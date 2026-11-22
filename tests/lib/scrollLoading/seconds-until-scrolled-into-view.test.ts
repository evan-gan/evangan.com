import { describe, expect, it } from 'vitest';
import { secondsUntilScrolledIntoView } from '../../../src/lib/scrollLoading';

const viewport = { left: 0, top: 0, width: 1000, height: 800 };
const SPEED = 1000;

function box(top: number, height = 200, left = 100, width = 300) {
	return { top, bottom: top + height, left, right: left + width };
}

describe('secondsUntilScrolledIntoView', () => {
	it('is 0 for a photo partly on screen', () => {
		expect(secondsUntilScrolledIntoView(box(700), viewport, SPEED)).toBe(0);
		expect(secondsUntilScrolledIntoView(box(-150), viewport, SPEED)).toBe(0);
	});

	it('grows with distance below or above the screen', () => {
		expect(secondsUntilScrolledIntoView(box(1800), viewport, SPEED)).toBe(1);
		expect(secondsUntilScrolledIntoView(box(-2200), viewport, SPEED)).toBe(2);
	});

	it('ranks a photo touching the edge just behind on-screen ones', () => {
		expect(secondsUntilScrolledIntoView(box(800), viewport, SPEED)).toBeGreaterThan(0);
	});

	it('counts sideways distance (e.g. a horizontal scroller)', () => {
		expect(secondsUntilScrolledIntoView(box(100, 200, 3000), viewport, SPEED)).toBe(2);
	});

	it('is Infinity for a photo that takes no space (filtered out / not rendered)', () => {
		expect(
			secondsUntilScrolledIntoView({ top: 0, bottom: 0, left: 0, right: 0 }, viewport, SPEED)
		).toBe(Infinity);
	});
});
