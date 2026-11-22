import { describe, expect, it } from 'vitest';
import { DEFAULT_FIT_OPTIONS, fitViewBox } from '../../../src/lib/eventMap';

const PINS = [
	{ x: 300, y: 300 },
	{ x: 900, y: 200 },
	{ x: 500, y: 260 }
];

describe('fitViewBox', () => {
	it('pads the outermost pins horizontally', () => {
		const box = fitViewBox(PINS);
		expect(box.x).toBe(300 - DEFAULT_FIT_OPTIONS.sidePadding);
		expect(box.x + box.width).toBe(900 + DEFAULT_FIT_OPTIONS.sidePadding);
	});

	it('places the highest and lowest pins on the edges of the pin band', () => {
		const box = fitViewBox(PINS);
		expect((200 - box.y) / box.height).toBeCloseTo(DEFAULT_FIT_OPTIONS.pinBandTop, 6);
		expect((300 - box.y) / box.height).toBeCloseTo(DEFAULT_FIT_OPTIONS.pinBandBottom, 6);
	});

	it('still has height when every pin is on the same row', () => {
		const box = fitViewBox([
			{ x: 0, y: 100 },
			{ x: 200, y: 100 }
		]);
		expect(box.height).toBeGreaterThan(0);
		expect(box.y).toBeLessThan(100);
		expect(box.y + box.height).toBeGreaterThan(100);
	});

	it('throws a helpful error with no pins', () => {
		expect(() => fitViewBox([])).toThrow(/at least one pin/);
	});
});
