// schema.org JSON-LD for the home page, so search engines and agents can read who the site is about.
// All values come from content/ — edit them there.
import { PROFILE_LINKS } from './content/contact';
import {
	JOB_TITLE,
	KNOWS_ABOUT,
	PERSON_NAME,
	PERSON_PHOTO,
	PERSON_SUMMARY,
	SCHOOL
} from './content/profile';
import { SITE_URL, absoluteUrl } from './content/site';

export function buildPersonJsonLd(): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@type': 'Person',
		'@id': `${SITE_URL}/#person`,
		name: PERSON_NAME,
		url: absoluteUrl('/'),
		description: PERSON_SUMMARY,
		image: absoluteUrl(PERSON_PHOTO.src),
		jobTitle: JOB_TITLE,
		// schema.org uses alumniOf for current students too.
		alumniOf: { '@type': 'CollegeOrUniversity', name: SCHOOL.name, url: SCHOOL.url },
		knowsAbout: KNOWS_ABOUT,
		sameAs: PROFILE_LINKS.map((link) => link.url)
	};
}

/**
 * Render JSON-LD as a <script> tag for {@html}.
 *
 * Returns:
 *   The tag, with "<" escaped so no string value can close the script element early.
 */
export function jsonLdScriptTag(data: Record<string, unknown>): string {
	const json = JSON.stringify(data).replace(/</g, '\\u003c');
	return `<script type="application/ld+json">${json}</script>`;
}
