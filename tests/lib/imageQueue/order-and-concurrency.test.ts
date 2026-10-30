import { describe, expect, it } from 'vitest';
import { createControlledQueue } from './test-helpers';

describe('ImageQueue concurrency and ranking', () => {
	it('never runs more than `concurrency` preview downloads at once', () => {
		const { queue, started } = createControlledQueue();
		queue.requestAll(['a', 'b', 'c', 'd'], 'preview');
		expect(started).toEqual(['a', 'b']);
	});

	it('starts the soonest-on-screen image first, using ranks read when a slot frees', async () => {
		const { queue, started, finish } = createControlledQueue({ concurrency: 1 });
		const ranks: Record<string, number> = { a: 5, b: 1, c: 3 };
		queue.setRanker((url) => ranks[url]);
		queue.requestAll(['a', 'b', 'c'], 'preview');
		expect(started).toEqual(['b']);
		// The content moved: "a" is now about to be on screen.
		ranks.a = 0.5;
		await finish('b');
		expect(started).toEqual(['b', 'a']);
	});

	it('holds full files nobody asked for until every preview has finished', async () => {
		const { queue, started, finish } = createControlledQueue();
		queue.requestAll(['p1', 'p2', 'p3'], 'preview');
		queue.requestAll(['f1', 'f2'], 'full');
		await finish('p1');
		await finish('p2');
		// p3 is still downloading, so a free slot stays empty rather than starting a full file.
		expect(started).toEqual(['p1', 'p2', 'p3']);
		await finish('p3');
		expect(started).toEqual(['p1', 'p2', 'p3', 'f1', 'f2']);
	});

	it('caps full-file downloads separately so big files finish one or two at a time', async () => {
		const { queue, started, finish } = createControlledQueue({
			concurrency: 4,
			fullConcurrency: 2
		});
		queue.requestAll(['f1', 'f2', 'f3'], 'full');
		expect(started).toEqual(['f1', 'f2']);
		await finish('f1');
		expect(started).toEqual(['f1', 'f2', 'f3']);
	});

	it('reports each finished download once and never refetches it', async () => {
		const { queue, started, loaded, finish } = createControlledQueue();
		queue.request('a', 'preview');
		await finish('a');
		queue.request('a', 'full');
		queue.boost('a', 'clicked');
		expect(loaded).toEqual(['a']);
		expect(started).toEqual(['a']);
		expect(queue.isLoaded('a')).toBe(true);
	});

	it('keeps a URL queued as a preview when it is later also asked for as a full file', async () => {
		// Photos without a usable preview queue their full file as the preview.
		const { queue, started, finish } = createControlledQueue({ concurrency: 1 });
		queue.requestAll(['p1', 'x'], 'preview');
		queue.request('x', 'full');
		await finish('p1');
		expect(started).toEqual(['p1', 'x']);
	});
});
