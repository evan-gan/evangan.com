// Site-wide settings, not copy. Used by every file that builds an absolute URL (JSON-LD, Markdown, llms.txt).

// www is canonical: the apex domain 307-redirects to it.
export const SITE_URL = 'https://www.evangan.com';

// <meta name="description"> on every page (routes/+layout.svelte); search results show it under the title.
export const SITE_DESCRIPTION =
	'Personal site of Evan Gan - engineer and maker. Explore my projects, background, and ways to get in touch.';

/** Turns a site path ("/about") into the absolute URL agents and search engines expect. */
export function absoluteUrl(sitePath: string): string {
	return new URL(sitePath, SITE_URL).toString();
}
