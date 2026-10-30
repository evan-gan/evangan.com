import { describe, expect, it } from 'vitest';
import {
	computeFocusTarget,
	DEFAULT_FOCUS_OPTIONS,
	easeInOutCubic,
	isRectOnScreen,
	lerpBoxState,
	sweepUpDistance,
	transformFromRest,
	type BoxState
} from '../../../src/lib/flight';

describe('computeFocusTarget', () => {
	it('centres the photo horizontally just below the nav', () => {
		const target = computeFocusTarget(1280, 820, 1.5);
		expect(target.centerX).toBe(640);
		expect(target.centerY - target.height / 2).toBeCloseTo(DEFAULT_FOCUS_OPTIONS.topOffset, 6);
		expect(target.rotationDeg).toBe(0);
	});

	it('keeps the photo’s aspect ratio', () => {
		const target = computeFocusTarget(1280, 820, 1.78);
		expect(target.width / target.height).toBeCloseTo(1.78, 5);
	});

	it('leaves room for the text under a tall photo by limiting height', () => {
		const target = computeFocusTarget(1280, 820, 0.75);
		const { topOffset, infoReserve, margin } = DEFAULT_FOCUS_OPTIONS;
		expect(target.height).toBeLessThanOrEqual(820 - topOffset - infoReserve - margin + 0.001);
	});

	it('caps the width on wide screens and keeps side margins on phones', () => {
		expect(computeFocusTarget(2560, 1440, 1.78).width).toBe(DEFAULT_FOCUS_OPTIONS.maxWidth);
		expect(computeFocusTarget(390, 844, 1.78).width).toBe(390 - DEFAULT_FOCUS_OPTIONS.margin * 2);
	});
});

describe('lerpBoxState', () => {
	const from: BoxState = { centerX: 0, centerY: 0, width: 100, height: 50, rotationDeg: -5 };
	const to: BoxState = { centerX: 200, centerY: 100, width: 300, height: 150, rotationDeg: 0 };

	it('returns the endpoints at 0 and 1', () => {
		expect(lerpBoxState(from, to, 0)).toEqual(from);
		expect(lerpBoxState(from, to, 1)).toEqual(to);
	});

	it('interpolates every field, including rotation', () => {
		expect(lerpBoxState(from, to, 0.5)).toEqual({
			centerX: 100,
			centerY: 50,
			width: 200,
			height: 100,
			rotationDeg: -2.5
		});
	});
});

describe('transformFromRest', () => {
	const rest: BoxState = { centerX: 640, centerY: 300, width: 600, height: 400, rotationDeg: 0 };

	it('is the identity at rest', () => {
		expect(transformFromRest(rest, rest)).toBe('translate(0px, 0px) rotate(0deg) scale(1)');
	});

	it('moves, rotates and scales relative to the resting box', () => {
		const pose = { centerX: 100, centerY: 700, width: 150, height: 100, rotationDeg: -5 };
		expect(transformFromRest(rest, pose)).toBe('translate(-540px, 400px) rotate(-5deg) scale(0.25)');
	});
});

describe('isRectOnScreen', () => {
	it('counts partially visible rects as on screen', () => {
		expect(isRectOnScreen({ left: -50, right: 10, top: 0, bottom: 100 }, 1280, 820)).toBe(true);
	});

	it('is false once fully past an edge', () => {
		expect(isRectOnScreen({ left: 1290, right: 1500, top: 0, bottom: 100 }, 1280, 820)).toBe(false);
		expect(isRectOnScreen({ left: 0, right: 100, top: -200, bottom: 0 }, 1280, 820)).toBe(false);
	});
});

describe('sweepUpDistance', () => {
	it('moves the card fully above the top edge plus slack', () => {
		expect(sweepUpDistance(84, 600, 40)).toBe(724);
	});
});

describe('easeInOutCubic', () => {
	it('starts at 0, ends at 1 and is symmetric about the midpoint', () => {
		expect(easeInOutCubic(0)).toBe(0);
		expect(easeInOutCubic(1)).toBe(1);
		expect(easeInOutCubic(0.5)).toBeCloseTo(0.5, 10);
		expect(easeInOutCubic(0.25) + easeInOutCubic(0.75)).toBeCloseTo(1, 10);
	});
});
