// Small browser-side animation helpers used by the home gallery.

export interface TweenOptions {
	durationMs: number;
	easing: (progress: number) => number;
	/** Called every frame with eased progress 0 → 1. */
	onFrame: (easedProgress: number) => void;
	signal?: AbortSignal;
}

/**
 * Run a requestAnimationFrame tween. Unlike CSS/WAAPI animations, `onFrame` can re-read live
 * positions each frame, which lets a photo land on a tile that is still moving.
 *
 * Returns:
 *   A promise that resolves with true when finished, or false if aborted first.
 */
export function runTween({ durationMs, easing, onFrame, signal }: TweenOptions): Promise<boolean> {
	return new Promise((resolveTween) => {
		if (signal?.aborted) return resolveTween(false);
		const startTime = performance.now();
		let frameId = 0;
		const onAbort = () => {
			cancelAnimationFrame(frameId);
			resolveTween(false);
		};
		signal?.addEventListener('abort', onAbort, { once: true });

		function step(now: number) {
			const progress = durationMs <= 0 ? 1 : Math.min(1, (now - startTime) / durationMs);
			onFrame(easing(progress));
			if (progress < 1) {
				frameId = requestAnimationFrame(step);
			} else {
				signal?.removeEventListener('abort', onAbort);
				resolveTween(true);
			}
		}
		frameId = requestAnimationFrame(step);
	});
}

export function prefersReducedMotion(): boolean {
	return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
