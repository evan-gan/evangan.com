import { describe, expect, it } from 'vitest';
import { buildAboutMarkdown } from '../../../src/lib/agentMarkdown';
import { AFFILIATIONS } from '../../../src/lib/content/affiliations';
import { BIO_PARAGRAPHS } from '../../../src/lib/content/profile';
import { STATS } from '../../../src/lib/content/stats';

describe('buildAboutMarkdown', () => {
	const markdown = buildAboutMarkdown(12);

	it('includes every bio paragraph from content/profile', () => {
		for (const paragraph of BIO_PARAGRAPHS) expect(markdown).toContain(paragraph);
	});

	it('lists every affiliation, linking external sites and project sheets', () => {
		for (const affiliation of AFFILIATIONS) expect(markdown).toContain(affiliation.detail);
		expect(markdown).toContain('[The LigerBots](https://ligerbots.org)');
		expect(markdown).toContain('[Open Sauce](https://www.evangan.com/projects/all#corexy-pen-plotter)');
		expect(markdown).toMatch(/^- WPI: /m);
	});

	it('lists every stat with its caption', () => {
		for (const stat of STATS) expect(markdown).toContain(`${stat.label}: ${stat.value} (${stat.caption})`);
	});

	it('shows the project count', () => {
		expect(markdown).toContain('12 projects so far');
	});
});
