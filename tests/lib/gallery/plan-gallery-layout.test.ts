import { describe, expect, it } from 'vitest';
import { coverSizeForTilt, planGalleryLayout, TILE_GAP } from '../../../src/lib/gallery';

// Aspect ratios of the site's real thumbnails, so the "no repeats" checks reflect real data.
const REAL_RATIOS = [
	1.61, 1.79, 1.29, 1.75, 1.77, 1.33, 1, 1.33, 1.78, 1.77, 1.5, 1.54, 1.78, 1.34, 0.75, 0.79, 1.33, 1,
	0.75
];
const items = REAL_RATIOS.map((ratio, index) => ({ id: `photo-${index}`, ratio }));

const VIEWPORTS = [
	{ name: 'phone', width: 390, height: 844 },
	{ name: 'laptop', width: 1280, height: 820 },
	{ name: 'desktop', width: 1920, height: 1080 },
	{ name: 'large monitor', width: 2560, height: 1440 }
];

describe('planGalleryLayout', () => {
	for (const viewport of VIEWPORTS) {
		describe(`on a ${viewport.name} (${viewport.width}×${viewport.height})`, () => {
			const layout = planGalleryLayout(items, viewport.width, viewport.height);

			it('places every photo exactly once across all rows', () => {
				const placed = layout.rows.flatMap((row) => row.tiles.map((tile) => tile.id)).sort();
				expect(placed).toEqual(items.map((item) => item.id).sort());
			});

			it('makes every row loop longer than the screen plus its widest tile', () => {
				expect(layout.fitsWithoutRepeats).toBe(true);
				for (const row of layout.rows) {
					const widestTile = Math.max(...row.tiles.map((tile) => tile.ratio * layout.rowHeight));
					expect(row.loopWidth).toBeGreaterThanOrEqual(layout.fieldWidth + widestTile);
				}
			});

			it('fills the tilted field top to bottom', () => {
				const stackedHeight =
					layout.rows.length * layout.rowHeight + (layout.rows.length - 1) * TILE_GAP;
				expect(stackedHeight).toBeCloseTo(layout.fieldHeight, 5);
			});
		});
	}

	it('is deterministic for the same seed', () => {
		const first = planGalleryLayout(items, 1280, 820, 7);
		const second = planGalleryLayout(items, 1280, 820, 7);
		expect(first.rows.map((row) => row.tiles.map((tile) => tile.id))).toEqual(
			second.rows.map((row) => row.tiles.map((tile) => tile.id))
		);
	});

	it('starts each row part-way through its loop (negative delay within one duration)', () => {
		for (const row of planGalleryLayout(items, 1280, 820).rows) {
			expect(row.delaySeconds).toBeLessThanOrEqual(0);
			expect(row.delaySeconds).toBeGreaterThan(-row.durationSeconds);
		}
	});

	it('reports when there are too few photos to avoid repeats', () => {
		const layout = planGalleryLayout([{ id: 'only', ratio: 1 }, { id: 'two', ratio: 1 }], 1920, 1080);
		expect(layout.fitsWithoutRepeats).toBe(false);
		expect(layout.rows.flatMap((row) => row.tiles)).toHaveLength(2);
	});

	it('returns no rows for no photos', () => {
		expect(planGalleryLayout([], 1280, 820).rows).toEqual([]);
	});
});

describe('coverSizeForTilt', () => {
	it('is the viewport itself with no tilt', () => {
		expect(coverSizeForTilt(1280, 820, 0)).toEqual({ width: 1280, height: 820 });
	});

	it('grows to cover the corners once tilted', () => {
		const cover = coverSizeForTilt(1280, 820, 5);
		expect(cover.width).toBeGreaterThan(1280);
		expect(cover.height).toBeGreaterThan(820);
	});
});
