// /sitemap.xml: every indexable HTML page (the .md twins are listed in /llms.txt instead).
import { PRIVACY_UPDATED } from '$lib/content/privacy';
import { loadAllProjects } from '$lib/projects';
import { buildDate, buildSitemapXml } from '$lib/sitemap';

export const prerender = true;

export const GET = () => {
	const deployDate = buildDate();
	const projectFilterPaths = ['all', ...loadAllProjects().map((category) => category.name)].map(
		(tag) => `/projects/${tag}`
	);
	const entries = [
		...['/', '/about', '/projects', ...projectFilterPaths].map((path) => ({
			path,
			lastmod: deployDate
		})),
		{ path: '/privacy', lastmod: PRIVACY_UPDATED }
	];
	return new Response(buildSitemapXml(entries), {
		headers: { 'Content-Type': 'application/xml; charset=utf-8' }
	});
};
