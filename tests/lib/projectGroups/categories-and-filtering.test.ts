import { describe, expect, it } from 'vitest';
import { displayCategories, isHighlight, matchesFilter } from '../../../src/lib/projectGroups';

const highlighted = {
	categories: ['Hackathons', 'Highlights'],
	categorySlugs: ['hackathons', 'highlights']
};
const plain = { categories: ['Builds'], categorySlugs: ['builds'] };

describe('isHighlight', () => {
	it('is true only for projects tagged Highlights', () => {
		expect(isHighlight(highlighted)).toBe(true);
		expect(isHighlight(plain)).toBe(false);
	});
});

describe('displayCategories', () => {
	it('drops Highlights (shown as a badge) and keeps names paired with slugs', () => {
		expect(displayCategories(highlighted)).toEqual([{ name: 'Hackathons', slug: 'hackathons' }]);
	});

	it('returns an empty list for a highlights-only project', () => {
		expect(
			displayCategories({ categories: ['Highlights'], categorySlugs: ['highlights'] })
		).toEqual([]);
	});
});

describe('matchesFilter', () => {
	it('matches everything for "all"', () => {
		expect(matchesFilter(plain, 'all')).toBe(true);
	});

	it('matches by category slug', () => {
		expect(matchesFilter(plain, 'builds')).toBe(true);
		expect(matchesFilter(plain, 'robotics')).toBe(false);
	});
});
