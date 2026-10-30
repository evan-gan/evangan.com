// Pure maths for ranking photos on ordinary scrolling pages (projects, about). The browser glue
// lives in pageImageLoader.ts; the drifting home gallery has its own in galleryLoading.ts.
import type { ScreenRect, ViewportRect } from './galleryLoading';

/**
 * Roughly how soon a visitor scrolls a photo into view, so nearer photos load first.
 *
 * Args:
 *   photo: the photo's bounding box (getBoundingClientRect)
 *   viewport: the visible area in the same coordinates
 *   scrollSpeedPxPerSecond: assumed scrolling speed; only the order matters, not the exact seconds
 *
 * Returns:
 *   0 if any of it is on screen; else its distance from the screen divided by the speed;
 *   Infinity if it takes no space (not rendered, e.g. filtered out or display: none).
 */
export function secondsUntilScrolledIntoView(
	photo: ScreenRect,
	viewport: ViewportRect,
	scrollSpeedPxPerSecond: number
): number {
	if (photo.right <= photo.left || photo.bottom <= photo.top) return Infinity;
	const verticalGap = Math.max(
		photo.top - (viewport.top + viewport.height),
		viewport.top - photo.bottom
	);
	const horizontalGap = Math.max(
		photo.left - (viewport.left + viewport.width),
		viewport.left - photo.right
	);
	const gap = Math.max(verticalGap, horizontalGap);
	// Touching the edge (gap 0) still isn't visible, so it ranks just behind on-screen photos.
	return gap < 0 ? 0 : Math.max(gap, 1) / scrollSpeedPxPerSecond;
}
