// Layout maths for the home page's drifting photo gallery: tilted rows of photos that scroll
// right forever. Pure functions so they run in the browser and in tests.

export interface GalleryItem {
	/** width / height of the photo */
	ratio: number;
}

export interface GalleryRow<T> {
	tiles: T[];
	/** Width of one pass through the row's tiles (the track holds two passes). */
	loopWidth: number;
	durationSeconds: number;
	/** Negative, so rows start mid-way through their loop instead of all lined up. */
	delaySeconds: number;
}

export interface GalleryLayout<T> {
	rowHeight: number;
	/** Size of the un-rotated field that, once tilted, still covers the whole viewport. */
	fieldWidth: number;
	fieldHeight: number;
	rows: GalleryRow<T>[];
	/** False when there aren't enough photos to fill the screen without a photo repeating. */
	fitsWithoutRepeats: boolean;
}

export const TILT_DEGREES = 5;
export const TILE_GAP = 18;
const TARGET_ROW_HEIGHT = 320;
const MIN_ROW_COUNT = 2;
const MIN_SPEED_PX_PER_SECOND = 18;
const MAX_SPEED_PX_PER_SECOND = 28;

/** Deterministic PRNG (mulberry32) so the "random" arrangement is identical on server and client. */
export function createSeededRandom(seed: number): () => number {
	let state = seed;
	return function nextRandom() {
		state = (state + 0x6d2b79f5) | 0;
		let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
		mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
		return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
	};
}

export function shuffleWithRandom<T>(random: () => number, list: T[]): T[] {
	const copy = list.slice();
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}

/**
 * Split items into groups that share no items, keeping each group's total size as even as possible
 * (greedy: biggest item goes to the currently lightest group).
 *
 * Args:
 *   items: things to distribute
 *   groupCount: number of groups to make
 *   sizeOf: how much of a group's budget an item uses
 *
 * Returns:
 *   `groupCount` arrays; every item appears in exactly one.
 */
export function partitionBalanced<T>(items: T[], groupCount: number, sizeOf: (item: T) => number): T[][] {
	const groups = Array.from({ length: groupCount }, () => ({ total: 0, items: [] as T[] }));
	const largestFirst = items.slice().sort((first, second) => sizeOf(second) - sizeOf(first));
	for (const item of largestFirst) {
		const lightest = groups.reduce((best, group) => (group.total < best.total ? group : best));
		lightest.items.push(item);
		lightest.total += sizeOf(item);
	}
	return groups.map((group) => group.items);
}

/** Smallest un-rotated rectangle that still covers a width × height viewport after tilting. */
export function coverSizeForTilt(viewportWidth: number, viewportHeight: number, degrees = TILT_DEGREES) {
	const radians = (degrees * Math.PI) / 180;
	const cos = Math.cos(radians);
	const sin = Math.sin(radians);
	return {
		width: Math.ceil(viewportWidth * cos + viewportHeight * sin),
		height: Math.ceil(viewportHeight * cos + viewportWidth * sin)
	};
}

function rowLoopWidth(tiles: GalleryItem[], rowHeight: number): number {
	return tiles.reduce((total, tile) => total + tile.ratio * rowHeight + TILE_GAP, 0);
}

/**
 * A row never shows the same photo twice at once if one pass through it is at least as wide as
 * the visible field plus its widest tile (the tile that is half-off one edge as its copy enters).
 */
function rowFitsWithoutRepeats(tiles: GalleryItem[], rowHeight: number, fieldWidth: number): boolean {
	const widestTile = Math.max(...tiles.map((tile) => tile.ratio * rowHeight));
	return rowLoopWidth(tiles, rowHeight) >= fieldWidth + widestTile;
}

/**
 * Plan the gallery for a viewport: how many rows, how tall, which photos go in each row, and how
 * fast each row drifts. Prefers rows near TARGET_ROW_HEIGHT, but uses fewer, taller rows when
 * that's what it takes for every row to be longer than the screen.
 *
 * Args:
 *   items: photos to place (each used exactly once across all rows)
 *   viewportWidth / viewportHeight: CSS pixels of the area the gallery fills
 *   seed: fixes the shuffle so layouts are stable between renders
 *
 * Returns:
 *   A GalleryLayout; `rows` is empty when there are no items.
 */
export function planGalleryLayout<T extends GalleryItem>(
	items: T[],
	viewportWidth: number,
	viewportHeight: number,
	seed = 2877
): GalleryLayout<T> {
	const field = coverSizeForTilt(viewportWidth, viewportHeight);
	const emptyLayout = { rowHeight: 0, fieldWidth: field.width, fieldHeight: field.height, rows: [], fitsWithoutRepeats: true };
	if (items.length === 0) return emptyLayout;

	const random = createSeededRandom(seed);
	const shuffled = shuffleWithRandom(random, items);
	const maxRows = Math.min(items.length, Math.max(MIN_ROW_COUNT, Math.round(field.height / TARGET_ROW_HEIGHT)));

	let rowCount = maxRows;
	let rowHeight = 0;
	let rowTiles: T[][] = [];
	let fits = false;
	// Fewer rows means each row is taller AND holds more photos, so its loop grows on both counts.
	for (; rowCount >= Math.min(MIN_ROW_COUNT, maxRows); rowCount--) {
		rowHeight = (field.height - TILE_GAP * (rowCount - 1)) / rowCount;
		rowTiles = partitionBalanced(shuffled, rowCount, (item) => item.ratio);
		fits = rowTiles.every((tiles) => rowFitsWithoutRepeats(tiles, rowHeight, field.width));
		if (fits || rowCount === MIN_ROW_COUNT) break;
	}

	const rows = rowTiles.map((tiles) => {
		// Re-shuffle inside the row so the size-sorted partition doesn't read as big-to-small.
		const orderedTiles = shuffleWithRandom(random, tiles);
		const loopWidth = rowLoopWidth(orderedTiles, rowHeight);
		const speed = MIN_SPEED_PX_PER_SECOND + random() * (MAX_SPEED_PX_PER_SECOND - MIN_SPEED_PX_PER_SECOND);
		const durationSeconds = loopWidth / speed;
		return { tiles: orderedTiles, loopWidth, durationSeconds, delaySeconds: -random() * durationSeconds };
	});

	return { rowHeight, fieldWidth: field.width, fieldHeight: field.height, rows, fitsWithoutRepeats: fits };
}
