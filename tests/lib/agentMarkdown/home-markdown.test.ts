import { describe, expect, it } from 'vitest';
import { buildHomeMarkdown } from '../../../src/lib/agentMarkdown';
import { makeProject } from './fixtures';

describe('buildHomeMarkdown', () => {
	const markdown = buildHomeMarkdown([makeProject()]);

	it('starts with the name as the only H1', () => {
		expect(markdown.startsWith('# Evan Gan\n')).toBe(true);
		expect(markdown.match(/^# /gm)).toHaveLength(1);
	});

	it('links recent projects to their sheet on the all-projects page', () => {
		expect(markdown).toContain(
			'- [Pen Plotter](https://www.evangan.com/projects/all#pen-plotter): A CoreXY plotter.'
		);
	});

	it('lists at most six recent projects', () => {
		const manyProjects = Array.from({ length: 10 }, (_, index) => makeProject({ id: `p${index}` }));
		const recentLines = buildHomeMarkdown(manyProjects).match(/projects\/all#p\d/g);
		expect(recentLines).toHaveLength(6);
	});

	it('links the profile accounts', () => {
		expect(markdown).toContain('[GitHub](https://github.com/evan-gan)');
	});
});
