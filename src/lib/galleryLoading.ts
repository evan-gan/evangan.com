// Pure maths for deciding which gallery photos to download first. The browser glue lives in
// galleryImageLoader.svelte.ts.

export interface ScreenRect {
	left: number;
	top: number;
	right: number;
	bottom: number;
}

export interface ViewportRect {
	left: number;
	top: number;
	width: number;
	height: number;
}

/**
 * How long until a tile that drifts rightward is (at least partly) on screen.
 *
 * Args:
 *   tile: the tile's on-screen bounding box (getBoundingClientRect)
 *   viewport: the visible area in the same coordinates (the visual viewport when pinch-zoomed)
 *   loopWidth: width of one pass through the row; the tile reappears this far to its left
 *   speedPxPerSecond: how fast the row drifts; 0 when motion is off
 *
 * Returns:
 *   0 if visible now, else seconds until its right edge crosses the viewport's left edge;
 *   Infinity if it never will (row off screen vertically, or not moving).
 */
export function secondsUntilVisible(
	tile: ScreenRect,
	viewport: ViewportRect,
	loopWidth: number,
	speedPxPerSecond: number
): number {
	const viewportRight = viewport.left + viewport.width;
	const viewportBottom = viewport.top + viewport.height;
	if (tile.bottom <= viewport.top || tile.top >= viewportBottom) return Infinity;
	if (tile.right > viewport.left && tile.left < viewportRight) return 0;
	if (speedPxPerSecond <= 0 || loopWidth <= 0) return Infinity;
	// The row repeats every loopWidth, so a tile past the right edge is also one loop to the left.
	const gapToLeftEdge = viewport.left - tile.right;
	const distance = ((gapToLeftEdge % loopWidth) + loopWidth) % loopWidth;
	return distance / speedPxPerSecond;
}

/** Previews may be up-scaled this much before full quality is fetched straight away. */
const ACCEPTABLE_UPSCALE = 1.15;

/**
 * Whether the screen shows tiles at more device pixels than the preview has (big/high-density
 * screen, browser zoom, or pinch zoom), so the full-quality file should load right away.
 *
 * Args:
 *   tileHeightCss: tile height in CSS pixels
 *   displayDensity: device pixels per CSS pixel, including browser and pinch zoom
 *   previewHeight: pixel height of the preview images
 */
export function previewLooksSoft(
	tileHeightCss: number,
	displayDensity: number,
	previewHeight: number
): boolean {
	return tileHeightCss * displayDensity > previewHeight * ACCEPTABLE_UPSCALE;
}
