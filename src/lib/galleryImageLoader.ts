// Feeds the home gallery's photos into the shared image queue and tells it how soon each photo
// drifts on screen; the queue's PRIORITY decides the order (on-screen previews, then clicked /
// hovered full files, then the rest). The maths lives in galleryLoading.ts.
// Tiles only ever show previews, so there's no zoom upgrade here: full files are fetched for
// when a photo is opened, not for the tiles themselves.

import { visibleViewportRect } from './displayDensity';
import { secondsUntilVisible } from './galleryLoading';
import { detectAvifSupport, imageQueue, requestPhotoImages } from './imageCache.svelte';
import { prefersReducedMotion } from './motion';

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

interface LoaderOptions {
	/** Element containing the gallery tiles (each spread with tileDataAttributes). */
	root: HTMLElement;
	photos: GalleryPhoto[];
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

/**
 * Start loading the gallery's photos. Downloads carry on after stopping (they're cached for the
 * rest of the visit, e.g. for the projects page); stopping only drops the on-screen ordering.
 *
 * Returns:
 *   A function that stops watching the gallery.
 */
export function startGalleryImageLoading(options: LoaderOptions): () => void {
	let stopped = false;

	const rankOf = rankPhotosByUrl(options.root, options.photos);

	detectAvifSupport().then(() => {
		if (stopped) return;
		imageQueue.setRanker(rankOf);
		requestPhotoImages(options.photos);
	});

	return () => {
		stopped = true;
		// Nothing from the gallery is on screen any more, so whatever's left loads as off-screen work.
		imageQueue.releaseRanker(rankOf);
	};
}
