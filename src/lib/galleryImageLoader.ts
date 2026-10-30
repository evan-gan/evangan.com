// Feeds the home gallery's photos into the shared image queue and tells it how soon each photo
// drifts on screen; the queue's PRIORITY decides the order (on-screen previews, then clicked /
// hovered / zoomed full files, then the rest). The maths lives in galleryLoading.ts.

import { currentDisplayDensity, visibleViewportRect, watchDisplayDensity } from './displayDensity';
import { previewLooksSoft, secondsUntilVisible } from './galleryLoading';
import { detectAvifSupport, imageQueue, requestPhotoImages } from './imageCache.svelte';
import { prefersReducedMotion } from './motion';
import { PREVIEW_HEIGHT } from './thumbnailPreview.js';

export interface GalleryPhoto {
	id: string;
	thumbnail: string;
	preview: string | null;
}

const TILE_DATA = {
	photoId: 'data-photo-id',
	loopWidth: 'data-loop-width',
	speed: 'data-speed'
} as const;

/** Attributes every gallery tile must carry so the loader can work out when it'll be on screen. */
export function tileDataAttributes(photoId: string, loopWidth: number, speedPxPerSecond: number) {
	return {
		[TILE_DATA.photoId]: photoId,
		[TILE_DATA.loopWidth]: String(loopWidth),
		[TILE_DATA.speed]: String(speedPxPerSecond)
	};
}

// While zoomed in, photos this close to drifting on screen also get full quality early.
const ZOOM_LOOKAHEAD_SECONDS = 3;
const ZOOM_CHECK_INTERVAL_MS = 1000;

interface LoaderOptions {
	/** Element containing the gallery tiles (each spread with tileDataAttributes). */
	root: HTMLElement;
	photos: GalleryPhoto[];
	/** Current tile height in CSS pixels. */
	getRowHeight: () => number;
}

/**
 * Seconds until a photo is on screen: the soonest of its tiles (each photo appears in two passes).
 * Infinity when none of its tiles are in the page any more.
 */
function secondsUntilPhotoVisible(root: HTMLElement, photoId: string): number {
	const viewport = visibleViewportRect();
	const motionOff = prefersReducedMotion();
	let soonest = Infinity;
	for (const tile of root.querySelectorAll<HTMLElement>(
		`[${TILE_DATA.photoId}="${CSS.escape(photoId)}"]`
	)) {
		const speed = motionOff ? 0 : Number(tile.getAttribute(TILE_DATA.speed));
		const loopWidth = Number(tile.getAttribute(TILE_DATA.loopWidth));
		soonest = Math.min(
			soonest,
			secondsUntilVisible(tile.getBoundingClientRect(), viewport, loopWidth, speed)
		);
	}
	return soonest;
}

function rankPhotosByUrl(root: HTMLElement, photos: GalleryPhoto[]) {
	const photoIdByUrl = new Map<string, string>();
	for (const photo of photos) {
		photoIdByUrl.set(photo.thumbnail, photo.id);
		if (photo.preview) photoIdByUrl.set(photo.preview, photo.id);
	}
	return (url: string) => {
		const photoId = photoIdByUrl.get(url);
		return photoId ? secondsUntilPhotoVisible(root, photoId) : Infinity;
	};
}

/** When the screen shows more detail than a preview holds, fetch full quality for what's (nearly) visible. */
function upgradeVisibleIfZoomed({ root, photos, getRowHeight }: LoaderOptions) {
	if (!previewLooksSoft(getRowHeight(), currentDisplayDensity(), PREVIEW_HEIGHT)) return;
	for (const photo of photos) {
		if (imageQueue.isLoaded(photo.thumbnail)) continue;
		if (secondsUntilPhotoVisible(root, photo.id) <= ZOOM_LOOKAHEAD_SECONDS)
			imageQueue.boost(photo.thumbnail, 'zoomed');
	}
}

/**
 * Start loading the gallery's photos. Downloads carry on after stopping (they're cached for the
 * rest of the visit, e.g. for the projects page); stopping only drops the on-screen ordering.
 *
 * Returns:
 *   A function that stops watching the gallery.
 */
export function startGalleryImageLoading(options: LoaderOptions): () => void {
	let stopped = false;
	const stopWatchingZoom = watchDisplayDensity(() => upgradeVisibleIfZoomed(options));
	// Entering tiles need checking too while zoomed, not just the ones on screen when zoom changed.
	const zoomTimer = setInterval(() => upgradeVisibleIfZoomed(options), ZOOM_CHECK_INTERVAL_MS);

	const rankOf = rankPhotosByUrl(options.root, options.photos);

	detectAvifSupport().then(() => {
		if (stopped) return;
		imageQueue.setRanker(rankOf);
		requestPhotoImages(options.photos);
		upgradeVisibleIfZoomed(options);
	});

	return () => {
		stopped = true;
		stopWatchingZoom();
		clearInterval(zoomTimer);
		// Nothing from the gallery is on screen any more, so whatever's left loads as off-screen work.
		imageQueue.releaseRanker(rankOf);
	};
}
