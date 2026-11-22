import type { FlowItem } from './bentoFlow';
import { ALL_PROJECTS_SLUG, EARLIER_LABEL, HIGHLIGHTS_SLUG, isHighlight } from './projectGroups';

// Sizing rules for the projects page bento: what each tile asks of the row planner (bentoFlow.ts).

/** The two "view" filters in the intro tile; categories get their own count tiles. */
export const BENTO_VIEW_OPTIONS = [
	{ key: ALL_PROJECTS_SLUG, label: 'Everything' },
	{ key: HIGHLIGHTS_SLUG, label: 'Highlights' }
];

export const FLOW_GAP = 20;
const PHONE_MAX_WIDTH = 560;
// Below this a 2×-tall highlight would leave no room beside it, so highlights are sized like the rest.
const HIGHLIGHT_EMPHASIS_MIN_WIDTH = 700;
const HIGHLIGHT_EMPHASIS = 2;
const PHONE_TARGET_HEIGHT = 200;
const YEAR_TILE_HEIGHT_ON_PHONE = 150;
// Photo-less tiles have no fixed shape, so they can stretch to help a row fill.
const TEXT_TILE_RATIO = 1.3;
const TEXT_TILE_FLEX = { min: 0.8, max: 2.2 };
const YEAR_TILE_RATIO = 0.9;
const YEAR_TILE_FLEX = { min: 0.6, max: 1.8 };

/** Height a normal tile aims for: ~a fifth of the width on desktop/tablet (240 at 1200), 200 on phones. */
export function flowTargetHeight(containerWidth: number): number {
	if (containerWidth < PHONE_MAX_WIDTH) return PHONE_TARGET_HEIGHT;
	return Math.min(240, Math.max(160, containerWidth * 0.2));
}

/** Flow sizing for a project tile: its photo's exact ratio, or a flexible text tile without one. */
export function projectFlowItem(
	project: { hasThumbnail: boolean; thumbnailRatio: number | null; categories: string[]; categorySlugs: string[] },
	containerWidth: number
): FlowItem {
	const hasPhotoShape = project.hasThumbnail && project.thumbnailRatio !== null;
	const emphasized = isHighlight(project) && containerWidth >= HIGHLIGHT_EMPHASIS_MIN_WIDTH;
	return {
		ratio: hasPhotoShape ? project.thumbnailRatio! : TEXT_TILE_RATIO,
		flex: hasPhotoShape ? undefined : TEXT_TILE_FLEX,
		emphasis: emphasized ? HIGHLIGHT_EMPHASIS : 1,
		// Room for the category line, name and date over the scrim.
		minHeight: 130,
		minWidth: 140
	};
}

/** Flow sizing for a year tile; on phones it's a full-width banner instead of a squarish tile. */
export function yearFlowItem(label: string, containerWidth: number): FlowItem {
	const onPhone = containerWidth < PHONE_MAX_WIDTH;
	return {
		ratio: onPhone ? containerWidth / YEAR_TILE_HEIGHT_ON_PHONE : YEAR_TILE_RATIO,
		flex: onPhone ? undefined : YEAR_TILE_FLEX,
		emphasis: 1,
		minHeight: 150,
		// The year is set in 60px type: "2026" needs ~200px with padding, "Earlier" ~260px.
		minWidth: label === EARLIER_LABEL ? 260 : 200,
		keepWithNext: true
	};
}
