// /llms.txt must follow llmstxt.org: an H1, a blockquote summary, then H2 sections of link lists.
import { describe, expect, it } from 'vitest';
import { buildLlmsTxt } from '../../../src/lib/agentMarkdown';
import { CATEGORIES } from './fixtures';

describe('buildLlmsTxt', () => {
	const llmsTxt = buildLlmsTxt(CATEGORIES);
	const lines = llmsTxt.split('\n');

	it('opens with the H1 then a blockquote summary', () => {
		expect(lines[0]).toBe('# Evan Gan');
		expect(lines[2].startsWith('> ')).toBe(true);
	});

	it('uses only H2 section headings after the title', () => {
		const headings = lines.filter((line) => line.startsWith('#'));
		expect(headings.slice(1).every((heading) => heading.startsWith('## '))).toBe(true);
	});

	it('links the Markdown version of every page and category', () => {
		expect(llmsTxt).toContain('(https://www.evangan.com/index.md)');
		expect(llmsTxt).toContain('(https://www.evangan.com/about.md)');
		expect(llmsTxt).toContain('[Builds](https://www.evangan.com/projects/builds.md): 1 projects');
	});

	it('puts the off-site profiles under Optional', () => {
		expect(llmsTxt.indexOf('## Optional')).toBeLessThan(llmsTxt.indexOf('github.com/evan-gan'));
	});

	it('tells agents when and how to use the site', () => {
		expect(llmsTxt).toContain('## When to use this site');
		expect(llmsTxt).toContain('## How to use it');
		expect(llmsTxt).toContain('- How to reach him (GitHub, LinkedIn)');
	});

	it('links the privacy page', () => {
		expect(llmsTxt).toContain('(https://www.evangan.com/privacy.md)');
	});
});
