import { describe, expect, it } from 'vitest';
import { buildProjectsMarkdown } from '../../../src/lib/agentMarkdown';
import { CATEGORIES, makeProject } from './fixtures';

describe('buildProjectsMarkdown', () => {
	const markdown = buildProjectsMarkdown('Builds projects', [makeProject()], CATEGORIES);

	it('uses the heading as the H1 and counts the projects', () => {
		expect(markdown.startsWith('# Builds projects\n')).toBe(true);
		expect(markdown).toContain('1 projects, newest first');
	});

	it('links every category filter page', () => {
		expect(markdown).toContain('- [Builds](https://www.evangan.com/projects/builds) (1)');
	});

	it('keeps the description markdown and drops the Highlights pseudo-category', () => {
		expect(markdown).toContain('Built from **scratch**.');
		expect(markdown).toContain('*Jun 2026 · Builds*');
	});

	it('lists the project links', () => {
		expect(markdown).toContain('- [GitHub](https://github.com/example/plotter)');
	});

	it('escapes brackets in link labels', () => {
		const bracketed = buildProjectsMarkdown(
			'Projects',
			[makeProject({ links: [{ type: 'external', label: 'Docs [beta]', url: 'https://x.test' }] })],
			CATEGORIES
		);
		expect(bracketed).toContain('[Docs \\[beta\\]](https://x.test)');
	});
});
