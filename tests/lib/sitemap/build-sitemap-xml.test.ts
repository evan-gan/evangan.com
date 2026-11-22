// /sitemap.xml must follow sitemaps.org 0.9: urlset namespace, absolute <loc>, W3C <lastmod>.
import { describe, expect, it } from 'vitest';
import { buildDate, buildSitemapXml } from '../../../src/lib/sitemap';

describe('buildSitemapXml', () => {
	const xml = buildSitemapXml([
		{ path: '/', lastmod: '2026-11-21' },
		{ path: '/about', lastmod: '2026-11-20' }
	]);

	it('starts with the XML declaration and the sitemaps.org namespace', () => {
		expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n')).toBe(true);
		expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
		expect(xml.trimEnd().endsWith('</urlset>')).toBe(true);
	});

	it('writes one <url> per entry with an absolute loc and its lastmod', () => {
		expect(xml.match(/<url>/g)).toHaveLength(2);
		expect(xml).toContain('<loc>https://www.evangan.com/about</loc>\n\t\t<lastmod>2026-11-20</lastmod>');
		expect(xml).toContain('<loc>https://www.evangan.com/</loc>');
	});

	it('entity-escapes special characters in URLs', () => {
		expect(buildSitemapXml([{ path: "/a&b'c", lastmod: '2026-01-01' }])).toContain(
			'<loc>https://www.evangan.com/a&amp;b&apos;c</loc>'
		);
	});
});

describe('buildDate', () => {
	it('formats as YYYY-MM-DD in UTC', () => {
		expect(buildDate(new Date('2026-03-04T23:30:00Z'))).toBe('2026-03-04');
	});
});
