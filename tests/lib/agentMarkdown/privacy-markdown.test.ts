import { describe, expect, it } from 'vitest';
import { buildPrivacyMarkdown } from '../../../src/lib/agentMarkdown';
import { PRIVACY_SECTIONS, PRIVACY_UPDATED } from '../../../src/lib/content/privacy';

describe('buildPrivacyMarkdown', () => {
	const markdown = buildPrivacyMarkdown();

	it('has the title and last-updated date', () => {
		expect(markdown.startsWith('# Privacy\n')).toBe(true);
		expect(markdown).toContain(PRIVACY_UPDATED);
	});

	it('has every section heading and paragraph', () => {
		for (const section of PRIVACY_SECTIONS) {
			expect(markdown).toContain(`## ${section.heading}`);
			for (const paragraph of section.paragraphs) expect(markdown).toContain(paragraph);
		}
	});

	it("links the host's privacy policy", () => {
		expect(markdown).toContain("[Vercel's privacy policy](https://vercel.com/legal/privacy-policy)");
	});

	// Agents checking trust pages look for real content, not a stub.
	it('is at least 500 characters', () => {
		expect(markdown.length).toBeGreaterThanOrEqual(500);
	});
});
