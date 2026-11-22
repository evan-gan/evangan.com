import { describe, expect, it } from 'vitest';
import { toGalleryProject } from '../../../src/lib/galleryProject';
import type { ProjectData } from '../../../src/lib/projects';

function makeProject(overrides: Partial<ProjectData> = {}): ProjectData {
	return {
		id: 'plotter',
		date: 'June, 2026',
		dateDisplay: 'June 2026',
		name: 'Plotter',
		nameHtml: 'Plotter',
		tagline: 'Draws things',
		taglineHtml: 'Draws things',
		nameText: 'Plotter',
		taglineText: 'Draws things',
		description: 'Long text',
		descriptionHtml: '<p>Long text</p>',
		thumbnail: '/thumbnails/plotter.webp',
		hasThumbnail: true,
		thumbnailRatio: 1.5,
		thumbnailPreview: '/thumbnails/previews/plotter.avif',
		year: 2026,
		categories: ['Builds'],
		categorySlugs: ['builds'],
		importance: 1,
		links: [],
		...overrides
	};
}

describe('toGalleryProject', () => {
	it('keeps the gallery fields and renames thumbnailRatio / thumbnailPreview', () => {
		const galleryProject = toGalleryProject(makeProject());
		expect(galleryProject).toMatchObject({
			id: 'plotter',
			ratio: 1.5,
			preview: '/thumbnails/previews/plotter.avif'
		});
		expect(galleryProject).not.toHaveProperty('descriptionHtml');
	});

	it('returns null for projects with only the placeholder photo', () => {
		expect(toGalleryProject(makeProject({ hasThumbnail: false }))).toBeNull();
	});

	it('returns null when the photo could not be measured', () => {
		expect(toGalleryProject(makeProject({ thumbnailRatio: null }))).toBeNull();
	});
});
