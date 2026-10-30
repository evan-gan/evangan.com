// A fake loader whose downloads finish only when a test says so, plus a manual clock for retries.
import { ImageQueue, type ImageQueueOptions } from '../../../src/lib/imageQueue';

export function createControlledQueue(overrides: Partial<ImageQueueOptions> = {}) {
	const pending = new Map<string, { resolve: () => void; reject: (error: Error) => void }>();
	const started: string[] = [];
	const loaded: string[] = [];
	const cancelled: string[] = [];
	const timers: (() => void)[] = [];
	const queue = new ImageQueue({
		concurrency: 2,
		retryDelaysMs: [1000],
		loadImage: (url, signal) =>
			new Promise<void>((resolve, reject) => {
				started.push(url);
				pending.set(url, { resolve, reject });
				signal.addEventListener('abort', () => {
					cancelled.push(url);
					reject(new Error('cancelled'));
				});
			}),
		onLoaded: (url) => loaded.push(url),
		setTimer: (callback) => timers.push(callback),
		...overrides
	});

	/** Let promise callbacks (onLoaded, starting the next download) run. */
	const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

	async function finish(url: string) {
		pending.get(url)!.resolve();
		await settle();
	}

	async function fail(url: string) {
		pending.get(url)!.reject(new Error('network'));
		await settle();
	}

	async function fireTimers() {
		timers.splice(0).forEach((callback) => callback());
		await settle();
	}

	return { queue, started, loaded, cancelled, finish, fail, fireTimers, settle };
}
