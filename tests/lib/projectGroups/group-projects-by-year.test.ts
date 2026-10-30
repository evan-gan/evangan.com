import { describe, expect, it } from 'vitest';
import { EARLIER_LABEL, groupProjectsByYear } from '../../../src/lib/projectGroups';

const project = (name: string, year: number) => ({ name, year });

describe('groupProjectsByYear', () => {
	it('gives each of the newest years its own section, newest first', () => {
		const groups = groupProjectsByYear([
			project('a', 2026),
			project('b', 2025),
			project('c', 2024)
		]);
		expect(groups.map((group) => group.label)).toEqual(['2026', '2025', '2024']);
	});

	it('folds years beyond the recent count into a trailing "Earlier" group', () => {
		const groups = groupProjectsByYear(
			[
				project('a', 2026),
				project('b', 2025),
				project('c', 2024),
				project('d', 2021),
				project('e', 2019)
			],
			3
		);
		expect(groups.map((group) => group.label)).toEqual(['2026', '2025', '2024', EARLIER_LABEL]);
		expect(groups[3].projects.map((item) => item.name)).toEqual(['d', 'e']);
	});

	it('puts projects without a year (0) in "Earlier"', () => {
		const groups = groupProjectsByYear([project('dated', 2025), project('undated', 0)]);
		expect(groups.map((group) => group.label)).toEqual(['2025', EARLIER_LABEL]);
	});

	it('keeps the input order inside a group', () => {
		const groups = groupProjectsByYear([project('first', 2025), project('second', 2025)]);
		expect(groups[0].projects.map((item) => item.name)).toEqual(['first', 'second']);
	});

	it('omits "Earlier" when nothing falls into it', () => {
		expect(groupProjectsByYear([project('a', 2025)]).map((group) => group.label)).toEqual(['2025']);
	});

	it('returns no groups for no projects', () => {
		expect(groupProjectsByYear([])).toEqual([]);
	});
});
