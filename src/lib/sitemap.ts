// /sitemap.xml in the sitemaps.org 0.9 format. Pure string building so tests can check the output.
import { absoluteUrl } from './content/site';

export interface SitemapEntry {
	/** Site path, e.g. "/about". */
	path: string;
	/** W3C date (YYYY-MM-DD) the page last changed. */
	lastmod: string;
}

const XML_ESCAPES: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&apos;'
};

// sitemaps.org requires entity-escaping these five characters in URLs.
function escapeXml(text: string): string {
	return text.replace(/[&<>"']/g, (character) => XML_ESCAPES[character]);
}

export function buildSitemapXml(entries: SitemapEntry[]): string {
	const urls = entries.map(
		(entry) =>
			`\t<url>\n\t\t<loc>${escapeXml(absoluteUrl(entry.path))}</loc>\n\t\t<lastmod>${entry.lastmod}</lastmod>\n\t</url>`
	);
	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		...urls,
		'</urlset>',
		''
	].join('\n');
}

/** Today's date as YYYY-MM-DD; the sitemap is regenerated on every build, so this is the deploy date. */
export function buildDate(now: Date = new Date()): string {
	return now.toISOString().slice(0, 10);
}
