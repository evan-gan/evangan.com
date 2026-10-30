// Site-wide image download queue + record of what's downloaded. Module-level, so it lives for the
// whole visit: client-side navigation (e.g. home → projects) reuses everything already fetched.

import { SvelteSet } from 'svelte/reactivity';
import { ImageQueue } from './imageQueue';

// Reactive, so <ProgressiveImage> re-renders the moment a download finishes.
const loadedUrls = new SvelteSet<string>();
// Holding the Image objects keeps their bytes in the browser's memory cache for this visit, so
// a photo that drifts back round (or shows up on another page) never refetches.
const retainedImages: HTMLImageElement[] = [];

function loadInBrowser(url: string, signal: AbortSignal): Promise<void> {
	return new Promise((resolveLoad, rejectLoad) => {
		const image = new Image();
		image.decoding = 'async';
		image.onload = () => {
			retainedImages.push(image);
			resolveLoad();
		};
		image.onerror = () => rejectLoad(new Error(`Could not load ${url}`));
		signal.addEventListener('abort', () => {
			image.onload = image.onerror = null;
			// Pointing the image elsewhere is how browsers let you cancel its request.
			image.src = '';
			rejectLoad(new Error(`Cancelled loading ${url}`));
		});
		image.src = url;
	});
}

export const imageQueue = new ImageQueue({
	loadImage: loadInBrowser,
	concurrency: 4,
	fullConcurrency: 2,
	maxInFlight: 5,
	// ~1 minute of backing off before giving up (until the browser reports it's back online).
	retryDelaysMs: [1000, 2000, 4000, 8000, 15000, 30000],
	onLoaded: (url) => loadedUrls.add(url),
	isOnline: () => typeof navigator === 'undefined' || navigator.onLine,
	isPageLoaded: () => typeof document === 'undefined' || document.readyState === 'complete'
});

if (typeof window !== 'undefined') {
	window.addEventListener('online', () => imageQueue.retryFailed());
	window.addEventListener('load', () => imageQueue.wake());
}

// A preloaded page (hover preloads its data) navigates within a frame; cancelling downloads then
// would only throw away their progress. Past this, the navigation is waiting on the network.
const NAVIGATION_GRACE_MS = 150;

/**
 * Keep images off the network while the visitor moves to another page: nothing new starts, and if
 * the page hasn't arrived after a moment, downloads in flight are cancelled (and re-queued) so the
 * page's own requests get the connection.
 *
 * Args:
 *   navigationDone: settles when the navigation finishes or is abandoned
 */
export function holdImagesDuringNavigation(navigationDone: Promise<unknown>) {
	const release = imageQueue.hold();
	const cancelTimer = setTimeout(() => imageQueue.cancelActive(), NAVIGATION_GRACE_MS);
	const finish = () => {
		clearTimeout(cancelTimer);
		release();
	};
	navigationDone.then(finish, finish);
}

/** Queue a set of photos: every first image (preview, or full file without one), then every full file. */
export function requestPhotoImages(photos: { thumbnail: string; preview: string | null }[]) {
	// Without a usable preview the full file is a photo's first image, so it's queued as the preview.
	imageQueue.requestAll(
		photos.map((photo) => usablePreview(photo.preview) ?? photo.thumbnail),
		'preview'
	);
	imageQueue.requestAll(
		photos.map((photo) => photo.thumbnail),
		'full'
	);
}

export function isImageLoaded(url: string): boolean {
	return loadedUrls.has(url);
}

const formatSupport = $state({ avif: null as boolean | null });
let avifCheck: Promise<boolean> | null = null;

// A 1×1 8-bit AVIF (same profile as the previews); browsers that can't decode it fire onerror.
const TINY_AVIF =
	'data:image/avif;base64,AAAAHGZ0eXBhdmlmAAAAAG1pZjFhdmlmbWlhZgAAANZtZXRhAAAAAAAAACFoZGxyAAAAAAAAAABwaWN0AAAAAAAAAAAAAAAAAAAAACJpbG9jAAAAAERAAAEAAQAAAAAA+gABAAAAAAAAACEAAAAjaWluZgAAAAAAAQAAABVpbmZlAgAAAAABAABhdjAxAAAAAA5waXRtAAAAAAABAAAAVmlwcnAAAAA4aXBjbwAAAAxhdjFDgQAMAAAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAABZpcG1hAAAAAAAAAAEAAQOBAgMAAAApbWRhdBIACggYAAaICGg0IDITHEeHhd3TTTTCwAAAkDWOPH0XUA==';

/** Resolves (once per visit) to whether this browser can show the AVIF previews. */
export function detectAvifSupport(): Promise<boolean> {
	avifCheck ??= new Promise<boolean>((resolveCheck) => {
		const probe = new Image();
		probe.onload = () => resolveCheck(probe.width > 0);
		probe.onerror = () => resolveCheck(false);
		probe.src = TINY_AVIF;
	}).then((supported) => {
		formatSupport.avif = supported;
		return supported;
	});
	return avifCheck;
}

/** The preview path if this browser can show it; null (use the full file) otherwise or until known. */
export function usablePreview(preview: string | null): string | null {
	return formatSupport.avif ? preview : null;
}
