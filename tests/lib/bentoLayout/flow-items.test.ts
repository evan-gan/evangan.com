import { describe, expect, it } from 'vitest';
import { flowTargetHeight, projectFlowItem, yearFlowItem } from '../../../src/lib/bentoLayout';

const photoProject = { hasThumbnail: true, thumbnailRatio: 1.6, categories: ['Builds'], categorySlugs: ['builds'] };
const highlight = { ...photoProject, categories: ['Builds', 'Highlights'], categorySlugs: ['builds', 'highlights'] };
const textProject = { hasThumbnail: false, thumbnailRatio: null, categories: ['Programming'], categorySlugs: ['programming'] };

describe('flowTargetHeight', () => {
	it('scales with width on desktop and tablet, within 160–240', () => {
		expect(flowTargetHeight(1200)).toBe(240);
		expect(flowTargetHeight(820)).toBeCloseTo(164);
		expect(flowTargetHeight(600)).toBe(160);
	});

	it('uses a fixed 200px on phones', () => {
		expect(flowTargetHeight(358)).toBe(200);
	});
});

describe('projectFlowItem', () => {
	it('keeps the photo ratio fixed', () => {
		expect(projectFlowItem(photoProject, 1200)).toMatchObject({ ratio: 1.6, flex: undefined, emphasis: 1 });
	});

	it('makes photo-less projects flexible', () => {
		expect(projectFlowItem(textProject, 1200).flex).toBeDefined();
	});

	it('emphasises highlights only when there is room beside them', () => {
		expect(projectFlowItem(highlight, 1200).emphasis).toBe(2);
		expect(projectFlowItem(highlight, 390).emphasis).toBe(1);
	});
});

describe('yearFlowItem', () => {
	it('is a flexible lead-in tile on desktop', () => {
		expect(yearFlowItem('2026', 1200)).toMatchObject({ keepWithNext: true, minWidth: 200 });
		expect(yearFlowItem('2026', 1200).flex).toBeDefined();
	});

	it('needs more width for "Earlier"', () => {
		expect(yearFlowItem('Earlier', 1200).minWidth).toBe(260);
	});

	it('becomes a full-width 150px banner on phones', () => {
		const banner = yearFlowItem('2026', 360);
		expect(banner.ratio).toBe(360 / 150);
		expect(banner.flex).toBeUndefined();
	});
});
