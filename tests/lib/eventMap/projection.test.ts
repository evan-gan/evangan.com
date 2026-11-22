import { describe, expect, it } from 'vitest';
import { nearestDot, projectToMap } from '../../../src/lib/eventMap';

describe('projectToMap', () => {
	it('puts west of the prime meridian to the left and north of the equator higher up', () => {
		const origin = projectToMap(0, 0);
		const northWest = projectToMap(-70, 40);
		expect(northWest.x).toBeLessThan(origin.x);
		expect(northWest.y).toBeLessThan(origin.y);
	});

	it('stretches latitude like Mercator (10° near the pole is taller than 10° near the equator)', () => {
		const nearEquator = projectToMap(0, 0).y - projectToMap(0, 10).y;
		const nearPole = projectToMap(0, 50).y - projectToMap(0, 60).y;
		expect(nearPole).toBeGreaterThan(nearEquator * 1.4);
	});

	// The fit is hand-calibrated; this catches a constant being broken, not a dot of drift.
	it.each([
		['Berlin', 13.4, 52.52],
		['San Francisco', -122.42, 37.77],
		['Miami', -80.19, 25.76],
		['Chicago', -87.63, 41.88],
		['Stockholm', 18.07, 59.33]
	])(
		'projects %s to within about a dot of land in the source PNG',
		(_name, longitude, latitude) => {
			const projected = projectToMap(longitude, latitude);
			const land = nearestDot(projected);
			expect(Math.hypot(land.x - projected.x, land.y - projected.y)).toBeLessThan(25);
		}
	);
});
