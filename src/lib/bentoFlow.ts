// Layout for the "true ratio" bento: tiles keep their photo's exact aspect ratio (nothing is cropped)
// while every row still ends flush with the container, like a justified photo gallery. To keep the
// bento feel, a row may also hold a "stack": two consecutive tiles of equal width on top of each
// other, which is how a tall highlight ends up beside two smaller tiles.
//
// Rows are chosen with dynamic programming over every way to split the (date-ordered) items into
// rows and each row into singles / stacks, so the result is the cheapest layout overall rather than
// a greedy one, and it adapts by itself when projects are added, removed or re-shot.

export interface FlowItem {
	/** width / height; fixed for photos, a chosen shape for text tiles. */
	ratio: number;
	/** Preferred height as a multiple of the target row height (e.g. 2 for a highlight). */
	emphasis: number;
	/** Shorter than this and the tile's text no longer fits; heavily penalised. */
	minHeight: number;
	/** Narrower than this and the tile's text no longer fits; heavily penalised. */
	minWidth?: number;
	/** Tiles without a photo can change shape (width / height within these bounds) to help a row fill. */
	flex?: { min: number; max: number };
	/** Should not be the last tile of a row, e.g. a year tile that introduces the tiles after it. */
	keepWithNext?: boolean;
}

export interface FlowSingle {
	kind: 'single';
	index: number;
	width: number;
	height: number;
}

export interface FlowStack {
	kind: 'stack';
	indices: [number, number];
	width: number;
	heights: [number, number];
}

export type FlowUnit = FlowSingle | FlowStack;

export interface FlowRow {
	units: FlowUnit[];
	height: number;
	/** False only for a last row left short (rather than blowing its few tiles up to full width). */
	filled: boolean;
}

export interface FlowOptions {
	containerWidth: number;
	gap: number;
	/** Height an emphasis-1 tile should ideally get. */
	targetHeight: number;
	maxItemsPerRow?: number;
}

const DEFAULT_MAX_ITEMS_PER_ROW = 6;
// Small nudges: stacks only when they clearly help, and a short last row only when it beats stretching.
const STACK_COST = 0.08;
const RAGGED_LAST_ROW_COST = 1.5;
const STRANDED_LEAD_IN_COST = 1;
const BELOW_MIN_SIZE_COST = 25;
// Being a bit big is fine, but a lone tile blown up to full width dwarfs everything around it.
const OVERSIZE_FROM = 1.15;
const OVERSIZE_COST = 12;

/** One unit of a row pattern: a lone item (length 1) or a stack of two items (length 2). */
type PatternPart = 1 | 2;

/** Every way to cut `length` consecutive items into singles and stacks, e.g. 3 → [1,1,1] [1,2] [2,1]. */
function rowPatterns(length: number): PatternPart[][] {
	if (length === 0) return [[]];
	const withSingle = rowPatterns(length - 1).map((rest): PatternPart[] => [1, ...rest]);
	if (length < 2) return withSingle;
	const withStack = rowPatterns(length - 2).map((rest): PatternPart[] => [2, ...rest]);
	return [...withSingle, ...withStack];
}

/** A stack of ratios r1 over r2 at width w is w/r1 + w/r2 (+ gap) tall; this is its "ratio" before the gap. */
function stackRatio(first: number, second: number): number {
	return 1 / (1 / first + 1 / second);
}

/** A lone tile's ratio in this row: flexible tiles (no photo) are scaled, photos never are. */
function singleRatio(item: FlowItem, flexScale: number): number {
	if (!item.flex) return item.ratio;
	return Math.min(item.flex.max, Math.max(item.flex.min, item.ratio * flexScale));
}

/**
 * Lay out one row's units at a given height.
 *
 * Args:
 *   flexScale: multiplier applied to flexible tiles' preferred ratio (stacked tiles always use their own ratio)
 *
 * Returns:
 *   The units with pixel sizes, and the total width they take including gaps.
 */
function buildUnits(items: FlowItem[], start: number, pattern: PatternPart[], height: number, gap: number, flexScale: number) {
	const units: FlowUnit[] = [];
	let index = start;
	let usedWidth = gap * (pattern.length - 1);
	for (const part of pattern) {
		if (part === 1) {
			const width = singleRatio(items[index], flexScale) * height;
			units.push({ kind: 'single', index, width, height });
			usedWidth += width;
		} else {
			const [top, bottom] = [items[index], items[index + 1]];
			const width = stackRatio(top.ratio, bottom.ratio) * (height - gap);
			units.push({ kind: 'stack', indices: [index, index + 1], width, heights: [width / top.ratio, width / bottom.ratio] });
			usedWidth += width;
		}
		index += part;
	}
	return { units, usedWidth };
}

/** The pieces of the row-width equation W = fixed·h + flex·scale·h + stack·(h − gap) + gaps. */
function rowRatioSums(items: FlowItem[], start: number, pattern: PatternPart[]) {
	let fixed = 0;
	let flex = 0;
	let stacks = 0;
	// The scale range every flexible tile in the row can take while staying inside its own bounds.
	let minScale = 0;
	let maxScale = Infinity;
	let index = start;
	for (const part of pattern) {
		const item = items[index];
		if (part === 2) {
			stacks += stackRatio(item.ratio, items[index + 1].ratio);
		} else if (item.flex) {
			flex += item.ratio;
			minScale = Math.max(minScale, item.flex.min / item.ratio);
			maxScale = Math.min(maxScale, item.flex.max / item.ratio);
		} else {
			fixed += item.ratio;
		}
		index += part;
	}
	if (flex === 0) return { fixed, flex, stacks, minScale: 1, maxScale: 1 };
	return { fixed, flex, stacks, minScale, maxScale };
}

/**
 * Candidate (height, flexScale) pairs that exactly fill the row: the flexible tiles' preferred shape,
 * their extremes, and the shapes that put each tile at its own ideal height.
 */
function fillingCandidates(items: FlowItem[], start: number, pattern: PatternPart[], options: FlowOptions) {
	const { containerWidth, gap, targetHeight } = options;
	const sums = rowRatioSums(items, start, pattern);
	const availableWidth = containerWidth - gap * (pattern.length - 1) + sums.stacks * gap;
	const heightAt = (scale: number) => availableWidth / (sums.fixed + sums.stacks + sums.flex * scale);
	if (sums.flex === 0) return [{ height: heightAt(1), flexScale: 1 }];

	const scales = new Set([1, sums.minScale, sums.maxScale]);
	const patternLength = pattern.reduce<number>((sum, part) => sum + part, 0);
	for (const item of items.slice(start, start + patternLength)) {
		const wantedHeight = targetHeight * item.emphasis;
		const scale = (availableWidth / wantedHeight - sums.fixed - sums.stacks) / sums.flex;
		scales.add(Math.min(sums.maxScale, Math.max(sums.minScale, scale)));
	}
	return [...scales].filter((scale) => scale > 0 && Number.isFinite(scale)).map((scale) => ({ height: heightAt(scale), flexScale: scale }));
}

/** True when a keepWithNext tile sits in the row's last unit (so what it introduces starts on the next row). */
function strandsLeadIn(items: FlowItem[], start: number, pattern: PatternPart[]): boolean {
	const lastPart = pattern[pattern.length - 1];
	const lastUnitStart = start + pattern.reduce<number>((sum, part) => sum + part, 0) - lastPart;
	return items.slice(lastUnitStart, lastUnitStart + lastPart).some((item) => item.keepWithNext);
}

// Weighted by emphasis²: a highlight shown at the wrong size matters much more than a small tile being off.
function shortfallCost(actual: number, minimum: number): number {
	if (actual >= minimum) return 0;
	const shortfall = (minimum - actual) / minimum;
	return BELOW_MIN_SIZE_COST * (shortfall + shortfall * shortfall);
}

function itemCost(item: FlowItem, width: number, height: number, targetHeight: number): number {
	const wanted = targetHeight * item.emphasis;
	const relativeError = (height - wanted) / wanted;
	let cost = relativeError * relativeError;
	if (height > wanted * OVERSIZE_FROM) {
		const overshoot = (height - wanted * OVERSIZE_FROM) / wanted;
		cost += OVERSIZE_COST * overshoot * overshoot;
	}
	cost += shortfallCost(height, item.minHeight) + shortfallCost(width, item.minWidth ?? 0);
	return cost * item.emphasis * item.emphasis;
}

function unitsCost(items: FlowItem[], units: FlowUnit[], targetHeight: number): number {
	let cost = 0;
	for (const unit of units) {
		if (unit.kind === 'single') {
			cost += itemCost(items[unit.index], unit.width, unit.height, targetHeight);
		} else {
			cost += STACK_COST;
			cost += itemCost(items[unit.indices[0]], unit.width, unit.heights[0], targetHeight);
			cost += itemCost(items[unit.indices[1]], unit.width, unit.heights[1], targetHeight);
		}
	}
	return cost;
}

/** Best way to render one candidate row: filled, or (last row only) left short at its ideal height. */
function planRow(items: FlowItem[], start: number, pattern: PatternPart[], isLastRow: boolean, options: FlowOptions) {
	const { gap, targetHeight, containerWidth } = options;
	let best = { row: null as FlowRow | null, cost: Infinity };
	for (const { height, flexScale } of fillingCandidates(items, start, pattern, options)) {
		const { units } = buildUnits(items, start, pattern, height, gap, flexScale);
		const cost = unitsCost(items, units, targetHeight);
		if (cost < best.cost) best = { row: { units, height, filled: true }, cost };
	}
	if (!isLastRow) return best;

	// A last row of one or two tiles would otherwise be stretched huge just to reach the right edge.
	const patternItems = items.slice(start, start + pattern.reduce<number>((sum, part) => sum + part, 0));
	const idealHeight = targetHeight * Math.max(...patternItems.map((item) => item.emphasis));
	if (idealHeight >= best.row!.height) return best;
	const short = buildUnits(items, start, pattern, idealHeight, gap, 1);
	if (short.usedWidth > containerWidth) return best;
	const unusedFraction = 1 - short.usedWidth / containerWidth;
	const shortCost = unitsCost(items, short.units, targetHeight) + RAGGED_LAST_ROW_COST * unusedFraction;
	return shortCost < best.cost ? { row: { units: short.units, height: idealHeight, filled: false }, cost: shortCost } : best;
}

/**
 * Split items (kept in order) into justified rows of exact-ratio tiles and stacks.
 *
 * Args:
 *   items: tiles in display order
 *   options: container width, gap between tiles/rows, target height for emphasis-1 tiles
 *
 * Returns:
 *   Rows top to bottom; filled rows are exactly containerWidth wide (gaps included).
 */
export function planBentoRows(items: FlowItem[], options: FlowOptions): FlowRow[] {
	const itemCount = items.length;
	if (itemCount === 0 || options.containerWidth <= 0) return [];
	const maxItemsPerRow = options.maxItemsPerRow ?? DEFAULT_MAX_ITEMS_PER_ROW;

	// bestFrom[i] = cheapest layout of items i..end; walk backwards so each row can look up what follows it.
	const bestFrom: { cost: number; row: FlowRow | null; next: number }[] = new Array(itemCount + 1);
	bestFrom[itemCount] = { cost: 0, row: null, next: itemCount };
	for (let start = itemCount - 1; start >= 0; start--) {
		bestFrom[start] = { cost: Infinity, row: null, next: itemCount };
		for (let length = 1; length <= Math.min(maxItemsPerRow, itemCount - start); length++) {
			const end = start + length;
			for (const pattern of rowPatterns(length)) {
				const isLastRow = end === itemCount;
				const { row, cost } = planRow(items, start, pattern, isLastRow, options);
				const strandedCost = !isLastRow && strandsLeadIn(items, start, pattern) ? STRANDED_LEAD_IN_COST : 0;
				const total = cost + strandedCost + bestFrom[end].cost;
				if (total < bestFrom[start].cost) bestFrom[start] = { cost: total, row, next: end };
			}
		}
	}

	const rows: FlowRow[] = [];
	for (let start = 0; start < itemCount; start = bestFrom[start].next) rows.push(bestFrom[start].row!);
	return rows;
}
