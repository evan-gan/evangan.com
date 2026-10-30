// "The visitor is hovering this photo" for photos that may move under the pointer. Rows drifting
// (or a page scrolling) under a resting mouse fire pointer events with no hand movement; counting
// those would queue a multi-MB download for everything passing by. So only a pointer whose
// coordinates changed counts, and only after it stays on the same photo for a moment.

// A pointer just passing over a photo shouldn't start a multi-MB download on a slow connection.
const HOVER_INTENT_MS = 150;

// One pointer per page, so the state is shared by every photo that uses this.
let lastPointerPosition = { x: NaN, y: NaN };
let intentKey: string | null = null;
let intentTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * Call from a photo's pointermove handler.
 *
 * Args:
 *   event: the pointermove event
 *   key: identifies the photo (a repeat move over the same photo doesn't restart the wait)
 *   onIntent: runs once the pointer has stayed on that photo for HOVER_INTENT_MS
 */
export function trackHoverIntent(event: PointerEvent, key: string, onIntent: () => void) {
	const pointerMoved =
		event.clientX !== lastPointerPosition.x || event.clientY !== lastPointerPosition.y;
	lastPointerPosition = { x: event.clientX, y: event.clientY };
	if (!pointerMoved || intentKey === key) return;
	intentKey = key;
	clearTimeout(intentTimer);
	intentTimer = setTimeout(onIntent, HOVER_INTENT_MS);
}

/** Call from pointerleave, and when the photos go away. */
export function cancelHoverIntent() {
	clearTimeout(intentTimer);
	intentKey = null;
}
