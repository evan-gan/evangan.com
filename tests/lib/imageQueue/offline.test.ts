import { describe, expect, it } from 'vitest';
import { createControlledQueue } from './test-helpers';

describe('ImageQueue while offline', () => {
	it('starts nothing while offline and resumes on retryFailed once back online', () => {
		let online = false;
		const { queue, started } = createControlledQueue({ isOnline: () => online });
		queue.requestAll(['a', 'b'], 'preview');
		expect(started).toEqual([]);
		online = true;
		queue.retryFailed();
		expect(started).toEqual(['a', 'b']);
	});

	it('parks a download that failed because the connection dropped, without using a retry', async () => {
		let online = true;
		const { queue, started, fail, fireTimers } = createControlledQueue({
			isOnline: () => online,
			retryDelaysMs: []
		});
		queue.request('a', 'preview');
		online = false;
		await fail('a');
		await fireTimers();
		expect(started).toEqual(['a']);
		online = true;
		queue.retryFailed();
		// With zero retries allowed it would have been given up for good had the failure counted.
		expect(started).toEqual(['a', 'a']);
	});
});
