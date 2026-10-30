import { describe, expect, it, vi } from 'vitest';
import { createControlledQueue } from './test-helpers';

describe('ImageQueue retries', () => {
	it('retries a failed download after the backoff delay', async () => {
		const { queue, started, fail, fireTimers } = createControlledQueue();
		queue.request('a', 'preview');
		await fail('a');
		expect(started).toEqual(['a']);
		await fireTimers();
		expect(started).toEqual(['a', 'a']);
	});

	it('gives up after the last retry delay and lets full-quality downloads proceed', async () => {
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		const { queue, started, fail, fireTimers } = createControlledQueue();
		queue.request('preview', 'preview');
		queue.request('full', 'full');
		await fail('preview');
		await fireTimers();
		await fail('preview');
		// A preview that can't load mustn't block the full file, which also serves as its fallback.
		expect(started).toEqual(['preview', 'preview', 'full']);
		expect(console.warn).toHaveBeenCalledOnce();
	});

	it('frees the slot while waiting to retry, so other images keep loading', async () => {
		const { queue, started, fail } = createControlledQueue({ concurrency: 1 });
		queue.requestAll(['a', 'b'], 'preview');
		await fail('a');
		expect(started).toEqual(['a', 'b']);
	});

	it('retryFailed restarts given-up and backing-off downloads straight away', async () => {
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		const { queue, started, fail, fireTimers } = createControlledQueue({ retryDelaysMs: [] });
		queue.requestAll(['gave-up'], 'preview');
		await fail('gave-up');
		queue.retryFailed();
		expect(started).toEqual(['gave-up', 'gave-up']);
		// No stale timer should start it a third time.
		await fireTimers();
		expect(started).toEqual(['gave-up', 'gave-up']);
	});

	it('treats a loader that throws synchronously as a failed download', async () => {
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		const { queue, settle } = createControlledQueue({
			retryDelaysMs: [],
			loadImage: () => {
				throw new Error('boom');
			}
		});
		queue.request('a', 'preview');
		await settle();
		expect(queue.isLoaded('a')).toBe(false);
	});
});
