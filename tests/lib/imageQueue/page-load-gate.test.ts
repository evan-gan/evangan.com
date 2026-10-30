import { describe, expect, it } from 'vitest';
import { createControlledQueue } from './test-helpers';

describe('ImageQueue before the page has loaded', () => {
	function setup() {
		let pageLoaded = false;
		const controlled = createControlledQueue({ concurrency: 4, isPageLoaded: () => pageLoaded });
		controlled.queue.setRanker((url) => (url.startsWith('visible') ? 0 : 6));
		return { ...controlled, markLoaded: () => (pageLoaded = true) };
	}

	it('starts only on-screen previews, so the page finishes loading once they are in', () => {
		const { queue, started } = setup();
		queue.requestAll(['offscreen-preview', 'visible-preview'], 'preview');
		queue.requestAll(['visible-full'], 'full');
		queue.boost('visible-full', 'hovered');
		expect(started).toEqual(['visible-preview']);
	});

	it('starts everything else on wake() after the load event', async () => {
		const { queue, started, finish, markLoaded } = setup();
		queue.requestAll(['offscreen-preview', 'visible-preview'], 'preview');
		queue.boost('visible-full', 'hovered');
		await finish('visible-preview');
		expect(started).toEqual(['visible-preview']);
		markLoaded();
		queue.wake();
		expect(started).toEqual(['visible-preview', 'visible-full', 'offscreen-preview']);
	});
});
