import type { MarkdownCategory, MarkdownProject } from '../../../src/lib/agentMarkdown';

export function makeProject(overrides: Partial<MarkdownProject> = {}): MarkdownProject {
	return {
		id: 'pen-plotter',
		nameText: 'Pen Plotter',
		taglineText: 'A CoreXY plotter.',
		description: 'Built from **scratch**.',
		dateDisplay: 'Jun 2026',
		categories: ['Highlights', 'Builds'],
		categorySlugs: ['highlights', 'builds'],
		links: [{ type: 'github', label: 'GitHub', url: 'https://github.com/example/plotter' }],
		...overrides
	};
}

export const CATEGORIES: MarkdownCategory[] = [
	{ slug: 'highlights', displayName: 'Highlights', projectCount: 1 },
	{ slug: 'builds', displayName: 'Builds', projectCount: 1 }
];
