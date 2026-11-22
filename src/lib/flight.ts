// Geometry and easing for the home gallery's "photo flies to the middle" transition.
// Pure functions so the maths is testable without a browser.

/** A photo's on-screen pose: where its centre is, how big it is, and how far it's rotated. */
export interface BoxState {
	centerX: number;
	centerY: number;
	width: number;
	height: number;
	rotationDeg: number;
}

export interface FocusTargetOptions {
	/** Space kept clear at the top for the nav pill. */
	topOffset: number;
	/** Height reserved under the photo for the revealed text. */
	infoReserve: number;
	maxWidth: number;
	/** Gap kept on the left/right and bottom edges. */
	margin: number;
	minHeight: number;
}

export const DEFAULT_FOCUS_OPTIONS: FocusTargetOptions = {
	topOffset: 84,
	infoReserve: 210,
	maxWidth: 760,
	margin: 16,
	minHeight: 160
};

export function easeInOutCubic(progress: number): number {
	return progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
}

function lerp(from: number, to: number, progress: number): number {
	return from + (to - from) * progress;
}

export function lerpBoxState(from: BoxState, to: BoxState, progress: number): BoxState {
	return {
		centerX: lerp(from.centerX, to.centerX, progress),
		centerY: lerp(from.centerY, to.centerY, progress),
		width: lerp(from.width, to.width, progress),
		height: lerp(from.height, to.height, progress),
		rotationDeg: lerp(from.rotationDeg, to.rotationDeg, progress)
	};
}

/**
 * Where the focused photo comes to rest: centred horizontally near the top, as large as fits
 * while leaving room for the text underneath.
 *
 * Args:
 *   viewportWidth / viewportHeight: CSS pixels
 *   ratio: the photo's width / height
 *   options: spacing rules (defaults suit the home page)
 *
 * Returns:
 *   The resting BoxState (rotation 0).
 */
export function computeFocusTarget(
	viewportWidth: number,
	viewportHeight: number,
	ratio: number,
	options: FocusTargetOptions = DEFAULT_FOCUS_OPTIONS
): BoxState {
	const availableWidth = Math.min(options.maxWidth, viewportWidth - options.margin * 2);
	const availableHeight = Math.max(
		options.minHeight,
		viewportHeight - options.topOffset - options.infoReserve - options.margin
	);
	// Fit inside both limits, keeping the photo's own shape.
	const width = Math.min(availableWidth, availableHeight * ratio);
	const height = width / ratio;
	return {
		centerX: viewportWidth / 2,
		centerY: options.topOffset + height / 2,
		width,
		height,
		rotationDeg: 0
	};
}

/**
 * CSS transform that moves an element laid out at `rest` so it appears at `pose` instead.
 * Uses a uniform scale (the photo keeps its shape), so only width matters for size.
 */
export function transformFromRest(rest: BoxState, pose: BoxState): string {
	const offsetX = pose.centerX - rest.centerX;
	const offsetY = pose.centerY - rest.centerY;
	const scale = pose.width / rest.width;
	return `translate(${offsetX}px, ${offsetY}px) rotate(${pose.rotationDeg}deg) scale(${scale})`;
}

export interface RectLike {
	left: number;
	top: number;
	right: number;
	bottom: number;
}

/** True when any part of the rect is inside the viewport. */
export function isRectOnScreen(rect: RectLike, viewportWidth: number, viewportHeight: number): boolean {
	return rect.right > 0 && rect.left < viewportWidth && rect.bottom > 0 && rect.top < viewportHeight;
}

/** How far up a card at `topEdge` must travel to be fully above the screen (with a little slack). */
export function sweepUpDistance(topEdge: number, cardHeight: number, slack = 40): number {
	return topEdge + cardHeight + slack;
}
