import { describe, expect, it } from 'vitest';
import { buildFilterItems } from '../../../src/lib/projectGroups';

const categories = [
	{ name: 'programming', displayName: 'Programming' },
	{ name: 'highlights', displayName: 'Highlights' },
	{ name: 'builds', displayName: 'Builds' }
];

describe('buildFilterItems', () => {
	it('puts "All Projects" first when there is no tagOrder', () => {
		expect(buildFilterItems(categories, []).map((item) => item.slug)).toEqual([
			'all',
			'programming',
			'highlights',
			'builds'
		]);
	});

	it('follows tagOrder, including where "All Projects" sits', () => {
		const items = buildFilterItems(categories, [
			'Highlights',
			'All Projects',
			'Builds',
			'Programming'
		]);
		expect(items.map((item) => item.label)).toEqual([
			'Highlights',
			'All Projects',
			'Builds',
			'Programming'
		]);
	});

	it('appends categories missing from tagOrder and ignores unknown names', () => {
		const items = buildFilterItems(categories, ['Builds', 'Nonexistent']);
		expect(items.map((item) => item.slug)).toEqual(['builds', 'all', 'programming', 'highlights']);
	});

	it('does not duplicate an item listed twice in tagOrder', () => {
		const items = buildFilterItems(categories, ['Builds', 'Builds']);
		expect(items.filter((item) => item.slug === 'builds')).toHaveLength(1);
	});
});
