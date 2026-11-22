// Feeds an ordinary scrolling page's photos (projects wall, about tiles) into the shared image
// queue, ranked by how close each is to the screen; the queue's PRIORITY decides the order. The
// home gallery's drifting rows use galleryImageLoader.ts instead.

import { currentDisplayDensity, visibleViewportRect, watchDisplayDensity } from './displayDensity';
import { previewLooksSoft } from './galleryLoading';
import { detectAvifSupport, imageQueue, requestPhotoImages } from './imageCache.svelte';
import { secondsUntilScrolledIntoView } from './scrollLoading';
import { PREVIEW_HEIGHT } from './thumbnailPreview.js';

export interface PagePhoto {
	thumbnail: string;
	preview: string | null;
}

const PHOTO_ATTRIBUTE = 'data-photo-src';
// Only the order matters; this just turns "pixels away" into the queue's seconds-until-visible.
const ASSUMED_SCROLL_SPEED_PX_PER_SECOND = 1500;

/** Spread on each element showing a photo, so the loader can find where it is on screen. */
export function photoElementAttributes(thumbnail: string) {
	return { [PHOTO_ATTRIBUTE]: thumbnail };
}

function photoElements(root: HTMLElement, thumbnail: string) {
	return root.querySelectorAll<HTMLElement>(`[${PHOTO_ATTRIBUTE}="${CSS.escape(thumbnail)}"]`);
}

/** The same photo can appear more than once (e.g. an about tile and a recent project), so the nearest counts. */
function rankPhotosByUrl(root: HTMLElement, photos: PagePhoto[]) {
	const thumbnailByUrl = new Map<string, string>();
	for (const photo of photos) {
		thumbnailByUrl.set(photo.thumbnail, photo.thumbnail);
		if (photo.preview) thumbnailByUrl.set(photo.preview, photo.thumbnail);
	}
	return (url: string) => {
		const thumbnail = thumbnailByUrl.get(url);
		if (!thumbnail) return Infinity;
		const viewport = visibleViewportRect();
		let soonest = Infinity;
		for (const element of photoElements(root, thumbnail)) {
			soonest = Math.min(
				soonest,
				secondsUntilScrolledIntoView(
					element.getBoundingClientRect(),
					viewport,
					ASSUMED_SCROLL_SPEED_PX_PER_SECOND
				)
			);
		}
		return soonest;
	};
}

/** When the screen shows more detail than a preview holds, fetch full quality for what's on screen. */
function upgradeVisibleIfZoomed(root: HTMLElement, photos: PagePhoto[]) {
	const density = currentDisplayDensity();
	const viewport = visibleViewportRect();
	for (const photo of photos) {
		if (imageQueue.isLoaded(photo.thumbnail)) continue;
		for (const element of photoElements(root, photo.thumbnail)) {
			const box = element.getBoundingClientRect();
			const onScreen =
				secondsUntilScrolledIntoView(box, viewport, ASSUMED_SCROLL_SPEED_PX_PER_SECOND) === 0;
			if (onScreen && previewLooksSoft(box.height, density, PREVIEW_HEIGHT)) {
				imageQueue.boost(photo.thumbnail, 'zoomed');
				break;
			}
		}
	}
}

/**
 * Start loading a page's photos, nearest to the screen first. Downloads carry on after stopping
 * (they're cached for the rest of the visit); stopping only drops this page's ordering.
 *
 * Args:
 *   root: element containing the photos (each element spread with photoElementAttributes)
 *   photos: every photo the page can show, including ones currently filtered out
 *
 * Returns:
 *   A function that stops watching the page.
 */
export function startPageImageLoading(root: HTMLElement, photos: PagePhoto[]): () => void {
	let stopped = false;
	const rankOf = rankPhotosByUrl(root, photos);
	let scrollFrame = 0;

	// The queue re-ranks whenever it starts something; scrolling just gives it a chance to start a
	// photo that is newly on screen, and to notice zoom on photos that just scrolled in.
	function handleScroll() {
		if (scrollFrame) return;
		scrollFrame = requestAnimationFrame(() => {
			scrollFrame = 0;
			imageQueue.wake();
			upgradeVisibleIfZoomed(root, photos);
		});
	}

	const stopWatchingZoom = watchDisplayDensity(() => upgradeVisibleIfZoomed(root, photos));
	window.addEventListener('scroll', handleScroll, { passive: true });

	detectAvifSupport().then(() => {
		if (stopped) return;
		imageQueue.setRanker(rankOf);
		requestPhotoImages(photos);
		upgradeVisibleIfZoomed(root, photos);
	});

	return () => {
		stopped = true;
		stopWatchingZoom();
		window.removeEventListener('scroll', handleScroll);
		cancelAnimationFrame(scrollFrame);
		imageQueue.releaseRanker(rankOf);
	};
}
