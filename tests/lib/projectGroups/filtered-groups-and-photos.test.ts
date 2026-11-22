import { describe, expect, it } from 'vitest';
import { groupFilteredProjects, projectPhotos } from '../../../src/lib/projectGroups';

const projects = [
	{ id: 'a', year: 2026, categories: ['Builds'], categorySlugs: ['builds'] },
	{ id: 'b', year: 2026, categories: ['Robotics'], categorySlugs: ['robotics'] },
	{ id: 'c', year: 2025, categories: ['Builds'], categorySlugs: ['builds'] }
];

describe('groupFilteredProjects', () => {
	it('groups only the projects matching the filter', () => {
		const groups = groupFilteredProjects(projects, 'builds');
		expect(groups.map((group) => [group.label, group.projects.map((project) => project.id)])).toEqual([
			['2026', ['a']],
			['2025', ['c']]
		]);
	});

	it('returns no groups when nothing matches', () => {
		expect(groupFilteredProjects(projects, 'hackathons')).toEqual([]);
	});
});

describe('projectPhotos', () => {
	it('skips placeholder-only projects and maps the rest to loader photos', () => {
		expect(
			projectPhotos([
				{ hasThumbnail: true, thumbnail: '/t/a.webp', thumbnailPreview: '/t/previews/a.avif' },
				{ hasThumbnail: false, thumbnail: '/thumbnails/placeholder.svg', thumbnailPreview: null }
			])
		).toEqual([{ thumbnail: '/t/a.webp', preview: '/t/previews/a.avif' }]);
	});
});
