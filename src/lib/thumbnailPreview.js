// Naming and sizing rules for the small AVIF previews of project thumbnails. Plain JS (with JSDoc
// types) so both the Node generator script and the TypeScript server code can import it.

/**
 * Preview height in pixels. Home gallery rows are ~358 CSS px tall on a 1512×982 screen, which is
 * ~716 device px on the 2× displays that size usually comes from; bigger or zoomed screens get the
 * full-quality file once the previews are in.
 */
export const PREVIEW_HEIGHT = 720;

/** Lossy AVIF quality (0–100). 45 keeps photos clean at gallery size while staying ~20–110 KB. */
export const PREVIEW_QUALITY = 45;

export const PREVIEW_FOLDER = 'previews';

/**
 * Site path of a thumbnail's preview, e.g. "/thumbnails/foo-webp.webp" → "/thumbnails/previews/foo-webp.avif".
 *
 * @param {string} thumbnailPath site path of a local thumbnail (starts with "/thumbnails/")
 * @returns {string | null} the preview's site path, or null for remote, SVG, or non-thumbnail paths
 */
export function previewPathFor(thumbnailPath) {
	const match = /^\/thumbnails\/([^/]+)\.[^./]+$/.exec(thumbnailPath);
	if (!match || thumbnailPath.toLowerCase().endsWith('.svg')) return null;
	return `/thumbnails/${PREVIEW_FOLDER}/${match[1]}.avif`;
}
