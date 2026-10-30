import { describe, expect, it } from 'vitest';
import { createControlledQueue } from './test-helpers';

describe('ImageQueue hold (page navigations)', () => {
	it('starts nothing while held and catches up on release', async () => {
		const { queue, started } = createControlledQueue();
		const release = queue.hold();
		queue.requestAll(['a', 'b'], 'preview');
		queue.boost('clicked-full', 'clicked');
		expect(started).toEqual([]);
		release();
		expect(started).toEqual(['a', 'b']);
	});

	it('stays held until every overlapping hold is released', () => {
		const { queue, started } = createControlledQueue();
		const releaseFirst = queue.hold();
		const releaseSecond = queue.hold();
		queue.request('a', 'preview');
		releaseFirst();
		releaseFirst(); // a second call must not release someone else's hold
		expect(started).toEqual([]);
		releaseSecond();
		expect(started).toEqual(['a']);
	});
});

describe('ImageQueue cancelActive', () => {
	it('aborts downloads in flight and re-queues them without using up a retry', async () => {
		const { queue, started, cancelled, loaded, finish, settle } = createControlledQueue({
			retryDelaysMs: []
		});
		queue.requestAll(['a', 'b'], 'preview');
		const holdForNavigation = queue.hold();
		queue.cancelActive();
		await settle();
		expect(cancelled).toEqual(['a', 'b']);
		// With no retries allowed, a counted failure would have given up for good.
		holdForNavigation();
		expect(started).toEqual(['a', 'b', 'a', 'b']);
		await finish('a');
		expect(loaded).toEqual(['a']);
	});

	it('keeps the photo the visitor clicked downloading', async () => {
		const { queue, cancelled, settle } = createControlledQueue();
		queue.request('background-preview', 'preview');
		queue.boost('clicked-full', 'clicked');
		await settle();
		queue.cancelActive();
		await settle();
		expect(cancelled).toEqual(['background-preview']);
	});
});

describe('ImageQueue maxInFlight', () => {
	it('caps clicked and hovered downloads too, leaving a connection for the page', () => {
		const { queue, started } = createControlledQueue({ concurrency: 2, maxInFlight: 3 });
		queue.setRanker(() => 5);
		queue.requestAll(['off-1', 'off-2'], 'preview');
		queue.boost('hovered-1', 'hovered');
		queue.boost('hovered-2', 'hovered');
		expect(started).toEqual(['off-1', 'off-2', 'hovered-1']);
	});
});

describe('ImageQueue releaseRanker', () => {
	it("only drops the ranker if it's still the current one", () => {
		const { queue, started } = createControlledQueue({ concurrency: 1 });
		const oldPageRanker = () => 0;
		const newPageRanker = (url: string) => (url === 'near' ? 0 : 9);
		queue.setRanker(oldPageRanker);
		queue.setRanker(newPageRanker);
		queue.releaseRanker(oldPageRanker);
		queue.requestAll(['far', 'near'], 'preview');
		expect(started).toEqual(['near']);
	});
});

describe('ImageQueue requestAll after giving up', () => {
	it('gives a failed image a fresh try when a page asks for it again', async () => {
		const { queue, started, fail } = createControlledQueue({ retryDelaysMs: [] });
		queue.request('photo', 'preview');
		await fail('photo');
		queue.request('photo', 'preview');
		expect(started).toEqual(['photo', 'photo']);
	});
});
