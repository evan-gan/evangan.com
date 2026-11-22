// The /privacy page and privacy.md. Keep this true: update it if you ever add analytics, forms or
// third-party embeds. PRIVACY_UPDATED shows on the page and in the sitemap's lastmod.

export const PRIVACY_UPDATED = '2026-11-21';

export const PRIVACY_INTRO =
	"This is Evan Gan's personal portfolio site. It has no accounts, forms, comments, newsletter, ads, " +
	"analytics or tracking scripts, and it doesn't set cookies.";

export interface PrivacySection {
	heading: string;
	paragraphs: string[];
	/** Shown after the paragraphs as "See <label>." */
	link?: { label: string; url: string };
}

export const PRIVACY_SECTIONS: PrivacySection[] = [
	{
		heading: 'What the host records',
		paragraphs: [
			'The site is hosted on Vercel. Like any web host, its servers record standard request details ' +
				'(IP address, browser, page requested and time) to deliver the site and protect it from abuse. ' +
				"I don't use that information to identify or profile visitors."
		],
		link: { label: "Vercel's privacy policy", url: 'https://vercel.com/legal/privacy-policy' }
	},
	{
		heading: 'Third parties',
		paragraphs: [
			'Fonts and images are served from this site, so browsing it loads nothing from other companies. ' +
				'Links to GitHub, LinkedIn and project sites take you to those services, which have their own ' +
				'privacy policies.'
		]
	},
	{
		heading: 'Questions',
		paragraphs: [
			'Reach me through GitHub or LinkedIn (see the About page). If anything here changes, this page ' +
				'will be updated first.'
		]
	}
];
