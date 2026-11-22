// Site-wide settings, not copy. Used by every file that builds an absolute URL (JSON-LD, Markdown, llms.txt).

// www is canonical: the apex domain 307-redirects to it.
export const SITE_URL = 'https://www.evangan.com';

// <meta name="description"> on every page (routes/+layout.svelte); search results show it under the title.
export const SITE_DESCRIPTION =
	'Personal site of Evan Gan - engineer and maker. Explore my projects, background, and ways to get in touch.';

// Social / link-preview image (og:image) for every page: a JPG copy of the About photo, since some
// preview crawlers don't read WebP. Regenerate with ImageMagick if the photo changes:
//   magick static/photo-of-me.webp -quality 85 static/og-image.jpg
export const OG_IMAGE = { src: '/og-image.jpg', width: 888, height: 1200, alt: 'Photo of Evan Gan' };

/** Turns a site path ("/about") into the absolute URL agents and search engines expect. */
export function absoluteUrl(sitePath: string): string {
	return new URL(sitePath, SITE_URL).toString();
}

/** <link rel="canonical"> for a page: absolute, no query or hash, no trailing slash (vercel.json strips it). */
export function canonicalUrl(pathname: string): string {
	return absoluteUrl(pathname.replace(/\/+$/, '') || '/');
}
