import { describe, expect, it } from 'vitest';
import { arcPath, dotsPath } from '../../../src/lib/eventMap';
import { MAP_DOTS } from '../../../src/lib/mapDots';

describe('arcPath', () => {
	it('runs from the start to the end through a control point above the midpoint', () => {
		expect(arcPath({ x: 0, y: 100 }, { x: 200, y: 100 }, 0.25)).toBe('M0 100 Q100 50 200 100');
	});

	it('bows longer arcs higher', () => {
		const controlY = (path: string) => Number(path.split(' ')[3]);
		const short = arcPath({ x: 0, y: 100 }, { x: 100, y: 100 });
		const long = arcPath({ x: 0, y: 100 }, { x: 400, y: 100 });
		expect(controlY(long)).toBeLessThan(controlY(short));
	});
});

describe('dotsPath', () => {
	it('draws each dot as a zero-length segment', () => {
		expect(
			dotsPath([
				[1, 2],
				[3.5, 4]
			])
		).toBe('M1 2h0M3.5 4h0');
	});
});

describe('MAP_DOTS (generated from assets/world-dots.png)', () => {
	it('has the dots of a world map, all inside the image', () => {
		expect(MAP_DOTS.length).toBeGreaterThan(500);
		for (const [x, y] of MAP_DOTS) {
			expect(x).toBeGreaterThan(0);
			expect(y).toBeGreaterThan(0);
		}
	});
});
