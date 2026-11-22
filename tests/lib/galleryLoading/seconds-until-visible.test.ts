import { describe, expect, it } from 'vitest';
import { secondsUntilVisible } from '../../../src/lib/galleryLoading';

const VIEWPORT = { left: 0, top: 0, width: 1000, height: 800 };
const LOOP_WIDTH = 3000;
const SPEED = 20;

function tileAt(left: number, width = 300, top = 100) {
	return { left, right: left + width, top, bottom: top + 200 };
}

describe('secondsUntilVisible', () => {
	it('is 0 for a tile on screen, even one only partly in view', () => {
		expect(secondsUntilVisible(tileAt(400), VIEWPORT, LOOP_WIDTH, SPEED)).toBe(0);
		expect(secondsUntilVisible(tileAt(-250), VIEWPORT, LOOP_WIDTH, SPEED)).toBe(0);
	});

	it('counts the drift time for a tile waiting off the left edge', () => {
		// Right edge is 200 px left of the screen; at 20 px/s that's 10 s.
		expect(secondsUntilVisible(tileAt(-500), VIEWPORT, LOOP_WIDTH, SPEED)).toBe(10);
	});

	it('wraps a tile past the right edge round to its next loop copy on the left', () => {
		// Right edge at 1400 → copy's right edge at -1600 → 1600 px to go.
		expect(secondsUntilVisible(tileAt(1100), VIEWPORT, LOOP_WIDTH, SPEED)).toBe(80);
	});

	it('is Infinity when motion is off and the tile is off screen', () => {
		expect(secondsUntilVisible(tileAt(-500), VIEWPORT, LOOP_WIDTH, 0)).toBe(Infinity);
	});

	it('is Infinity for a row above or below the visible area', () => {
		expect(secondsUntilVisible(tileAt(400, 300, 900), VIEWPORT, LOOP_WIDTH, SPEED)).toBe(Infinity);
	});

	it('measures against a pinch-zoomed visual viewport, not the whole page', () => {
		const zoomedIn = { left: 500, top: 0, width: 250, height: 800 };
		expect(secondsUntilVisible(tileAt(100), zoomedIn, LOOP_WIDTH, SPEED)).toBe(5);
	});
});
