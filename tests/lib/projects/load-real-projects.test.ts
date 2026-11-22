// Smoke test against the real projects/projects.yaml, so a bad edit is caught before deploy.
import { describe, expect, it } from 'vitest';
import { getAllProjectsFlat } from '../../../src/lib/projects';

describe('getAllProjectsFlat with the real projects.yaml', () => {
	const projects = getAllProjectsFlat();

	it('loads at least one project', () => {
		expect(projects.length).toBeGreaterThan(0);
	});

	it('gives every project a year so it lands in a year section', () => {
		const undated = projects.filter((project) => project.year === 0).map((project) => project.name);
		expect(undated).toEqual([]);
	});

	it('measures an aspect ratio for every local thumbnail', () => {
		const unmeasured = projects
			.filter((project) => project.hasThumbnail && project.thumbnail.startsWith('/'))
			.filter((project) => !project.thumbnailRatio)
			.map((project) => project.thumbnail);
		expect(unmeasured).toEqual([]);
	});

	// Fails when a photo was added without running `pnpm previews` (the home page would load the full file).
	it('has a generated AVIF preview for every local thumbnail', () => {
		const missingPreview = projects
			.filter((project) => project.hasThumbnail && project.thumbnail.startsWith('/'))
			.filter((project) => !project.thumbnailPreview)
			.map((project) => project.thumbnail);
		expect(missingPreview).toEqual([]);
	});

	it('marks the placeholder thumbnail as "no thumbnail"', () => {
		const placeholders = projects.filter((project) =>
			project.thumbnail.endsWith('placeholder.svg')
		);
		expect(
			placeholders.every((project) => !project.hasThumbnail && project.thumbnailRatio === null)
		).toBe(true);
	});

	it('strips markdown from the plain-text name and tagline', () => {
		expect(
			projects.every((project) => !/<[^>]+>/.test(project.nameText + project.taglineText))
		).toBe(true);
	});

	it('sorts newest year first', () => {
		const years = projects.map((project) => project.year);
		expect(years).toEqual([...years].sort((first, second) => second - first));
	});
});
