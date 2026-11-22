import { describe, expect, it } from 'vitest';
import { PRIORITY, priorityClassOf } from '../../../src/lib/imageQueue';
import { createControlledQueue } from './test-helpers';

describe('priorityClassOf', () => {
	it('splits previews into on-screen and off-screen', () => {
		expect(priorityClassOf('preview', null, 0)).toBe(PRIORITY.visiblePreview);
		expect(priorityClassOf('preview', null, 4)).toBe(PRIORITY.offscreenPreview);
	});

	it('puts full files in their boost class, or last when not asked for', () => {
		expect(priorityClassOf('full', 'clicked', 9)).toBe(PRIORITY.clicked);
		expect(priorityClassOf('full', 'hovered', 0)).toBe(PRIORITY.hovered);
		expect(priorityClassOf('full', 'zoomed', 0)).toBe(PRIORITY.zoomed);
		expect(priorityClassOf('full', null, 0)).toBe(PRIORITY.remainingFull);
	});

	it('never lets a boost push an on-screen preview down', () => {
		expect(priorityClassOf('preview', 'zoomed', 0)).toBe(PRIORITY.visiblePreview);
	});

	it('orders the classes: visible previews, clicked, hovered, zoomed, off-screen previews, the rest', () => {
		expect([
			PRIORITY.visiblePreview,
			PRIORITY.clicked,
			PRIORITY.hovered,
			PRIORITY.zoomed,
			PRIORITY.offscreenPreview,
			PRIORITY.remainingFull
		]).toEqual([0, 1, 2, 3, 4, 5]);
	});
});

describe('ImageQueue download order', () => {
	it('starts each class in priority order when one slot frees at a time', async () => {
		const { queue, started, finish } = createControlledQueue({
			concurrency: 1,
			fullConcurrency: 1
		});
		const ranks: Record<string, number> = { 'visible-preview': 0, 'offscreen-preview': 8 };
		queue.setRanker((url) => ranks[url] ?? 0);
		queue.requestAll(['offscreen-preview', 'visible-preview'], 'preview');
		queue.requestAll(['remaining-full', 'zoomed-full', 'hovered-full', 'clicked-full'], 'full');
		queue.boost('zoomed-full', 'zoomed');
		queue.boost('hovered-full', 'hovered');
		queue.boost('clicked-full', 'clicked');
		// A click starts at once, even over the caps and ahead of on-screen previews.
		expect(started).toEqual(['visible-preview', 'clicked-full']);

		// Once on-screen previews are in, hovered goes straight away (over the caps).
		await finish('visible-preview');
		expect(started).toEqual(['visible-preview', 'clicked-full', 'hovered-full']);

		// Zoomed respects the caps, so it takes the next slot ahead of the off-screen preview.
		await finish('clicked-full');
		await finish('hovered-full');
		expect(started.slice(3)).toEqual(['zoomed-full']);
		await finish('zoomed-full');
		expect(started.slice(4)).toEqual(['offscreen-preview']);
		await finish('offscreen-preview');
		expect(started.slice(5)).toEqual(['remaining-full']);
	});

	it('makes hovered full files wait for on-screen previews', async () => {
		const { queue, started, finish } = createControlledQueue();
		queue.request('visible-preview', 'preview');
		queue.boost('hovered-full', 'hovered');
		expect(started).toEqual(['visible-preview']);
		await finish('visible-preview');
		expect(started).toEqual(['visible-preview', 'hovered-full']);
	});

	it('starts a clicked full file at once, without waiting for on-screen previews', () => {
		const { queue, started } = createControlledQueue();
		queue.request('visible-preview', 'preview');
		queue.boost('clicked-full', 'clicked');
		expect(started).toEqual(['visible-preview', 'clicked-full']);
	});

	it('still holds a clicked full file to the hard cap on downloads in flight', () => {
		const { queue, started } = createControlledQueue({ concurrency: 2, maxInFlight: 2 });
		queue.requestAll(['a', 'b'], 'preview');
		queue.boost('clicked-full', 'clicked');
		expect(started).toEqual(['a', 'b']);
	});

	it('lets a click jump ahead even when every slot is busy with off-screen work', async () => {
		const { queue, started } = createControlledQueue({ concurrency: 2 });
		queue.setRanker((url) => (url.startsWith('off') ? 5 : 0));
		queue.requestAll(['off-1', 'off-2', 'off-3'], 'preview');
		queue.boost('clicked-full', 'clicked');
		expect(started).toEqual(['off-1', 'off-2', 'clicked-full']);
	});

	it('never lowers a boost (a clicked photo hovered later stays clicked)', async () => {
		const { queue, started, finish } = createControlledQueue({
			concurrency: 1,
			fullConcurrency: 1
		});
		queue.request('visible-preview', 'preview');
		queue.requestAll(['other-full', 'photo-full'], 'full');
		queue.boost('other-full', 'zoomed');
		queue.boost('photo-full', 'clicked');
		queue.boost('photo-full', 'zoomed');
		await finish('visible-preview');
		// Still clicked, so it started straight away instead of queuing as zoomed.
		expect(started).toEqual(['visible-preview', 'photo-full']);
	});

	it('restarts a failed download when the visitor asks for it', async () => {
		const { queue, started, fail } = createControlledQueue({ retryDelaysMs: [] });
		queue.request('photo', 'full');
		await fail('photo');
		queue.boost('photo', 'hovered');
		expect(started).toEqual(['photo', 'photo']);
	});
});
