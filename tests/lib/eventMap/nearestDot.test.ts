import { describe, expect, it } from 'vitest';
import { nearestDot } from '../../../src/lib/eventMap';

const DOTS = [
	[0, 0],
	[20, 0],
	[10, 17]
] as const;

describe('nearestDot', () => {
	it('returns the closest dot', () => {
		expect(nearestDot({ x: 18, y: 3 }, DOTS)).toEqual({ x: 20, y: 0 });
		expect(nearestDot({ x: 9, y: 30 }, DOTS)).toEqual({ x: 10, y: 17 });
	});

	it('returns the dot itself when the point is on it', () => {
		expect(nearestDot({ x: 0, y: 0 }, DOTS)).toEqual({ x: 0, y: 0 });
	});

	it('throws a helpful error when there are no dots', () => {
		expect(() => nearestDot({ x: 0, y: 0 }, [])).toThrow(/mapDots/);
	});
});
