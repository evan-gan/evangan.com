import { describe, expect, it } from 'vitest';
import { planBentoRows } from '../../../src/lib/bentoFlow';
import { GAP, photo, rowWidth } from './test-helpers';

const OPTIONS = { containerWidth: 1200, gap: GAP, targetHeight: 240 };

describe('planBentoRows with emphasis', () => {
	it('gives a highlight a tall tile beside a stack of two smaller ones', () => {
		const rows = planBentoRows([photo(1.78, 2), photo(1.5), photo(1.4), photo(1.5), photo(1.5), photo(1.5)], OPTIONS);
		const highlightRow = rows.find((row) => row.units.some((unit) => unit.kind === 'single' && unit.index === 0))!;
		expect(highlightRow.units.some((unit) => unit.kind === 'stack')).toBe(true);
		expect(highlightRow.height).toBeGreaterThan(400);
	});

	it('makes a stack exactly as tall as its row', () => {
		const rows = planBentoRows([photo(1.78, 2), photo(1.5), photo(1.4)], OPTIONS);
		for (const row of rows) {
			for (const unit of row.units) {
				if (unit.kind === 'stack') expect(unit.heights[0] + GAP + unit.heights[1]).toBeCloseTo(row.height, 6);
			}
		}
	});

	it("doesn't blow a lone highlight up to the full width", () => {
		const [row] = planBentoRows([photo(1.78, 2)], OPTIONS);
		expect(row.filled).toBe(false);
		expect(row.height).toBe(480);
	});
});

describe('planBentoRows with flexible and minimum-size tiles', () => {
	it('stretches a flexible (photo-less) tile so the row fills without distorting photos', () => {
		const flexible = { ratio: 1.3, emphasis: 1, minHeight: 100, flex: { min: 0.8, max: 2.2 } };
		const rows = planBentoRows([photo(1.5), flexible, photo(1.5)], OPTIONS);
		expect(rows).toHaveLength(1);
		expect(rows[0].filled).toBe(true);
		expect(rowWidth(rows[0])).toBeCloseTo(1200, 6);
		const flexibleUnit = rows[0].units[1];
		expect(flexibleUnit.kind === 'single' && flexibleUnit.width / flexibleUnit.height).toBeLessThanOrEqual(2.2);
	});

	it('avoids making a tile narrower than its minWidth', () => {
		const items = [photo(1.5), { ...photo(0.75), minWidth: 200 }, photo(1.5), photo(1.5), photo(1.5)];
		for (const row of planBentoRows(items, OPTIONS)) {
			for (const unit of row.units) {
				if (unit.kind === 'single' && unit.index === 1) expect(unit.width).toBeGreaterThanOrEqual(190);
			}
		}
	});

	it('avoids ending a row on a keepWithNext tile', () => {
		const items = [photo(1.5), photo(1.5), photo(1.5), { ...photo(0.9), keepWithNext: true }, photo(1.5), photo(1.5), photo(1.5)];
		const rows = planBentoRows(items, OPTIONS);
		for (const row of rows.slice(0, -1)) {
			const lastUnit = row.units[row.units.length - 1];
			const lastIndices = lastUnit.kind === 'single' ? [lastUnit.index] : lastUnit.indices;
			expect(lastIndices).not.toContain(3);
		}
	});
});
