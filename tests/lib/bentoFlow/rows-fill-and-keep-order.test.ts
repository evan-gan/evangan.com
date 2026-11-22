import { describe, expect, it } from 'vitest';
import { planBentoRows } from '../../../src/lib/bentoFlow';
import { GAP, displayOrder, photo, rowWidth } from './test-helpers';

const OPTIONS = { containerWidth: 1200, gap: GAP, targetHeight: 240 };
const MIXED = [1.5, 0.75, 1.33, 1.78, 1, 2.4, 0.8, 1.5, 1.2, 1.6].map((ratio) => photo(ratio));

describe('planBentoRows', () => {
	it('returns no rows for no items or no width', () => {
		expect(planBentoRows([], OPTIONS)).toEqual([]);
		expect(planBentoRows(MIXED, { ...OPTIONS, containerWidth: 0 })).toEqual([]);
	});

	it('shows every item exactly once, in the original order', () => {
		expect(displayOrder(planBentoRows(MIXED, OPTIONS))).toEqual(MIXED.map((_, index) => index));
	});

	it('makes every filled row exactly as wide as the container', () => {
		const rows = planBentoRows(MIXED, OPTIONS);
		for (const row of rows.filter((candidate) => candidate.filled)) {
			expect(rowWidth(row)).toBeCloseTo(1200, 6);
		}
	});

	it('keeps each photo at its own ratio (width / height of its tile)', () => {
		for (const row of planBentoRows(MIXED, OPTIONS)) {
			for (const unit of row.units) {
				if (unit.kind === 'single') expect(unit.width / unit.height).toBeCloseTo(MIXED[unit.index].ratio, 6);
				else unit.indices.forEach((index, position) => expect(unit.width / unit.heights[position]).toBeCloseTo(MIXED[index].ratio, 6));
			}
		}
	});

	it('keeps rows near the target height', () => {
		for (const row of planBentoRows(MIXED, OPTIONS)) {
			expect(row.height).toBeGreaterThan(240 * 0.7);
			expect(row.height).toBeLessThan(240 * 1.4);
		}
	});
});
