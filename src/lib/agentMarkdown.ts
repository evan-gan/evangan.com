// Markdown versions of the site's pages, plus /llms.txt, for AI agents. Prerendered to static files at
// build time by the routes/*.md and routes/llms.txt endpoints. Pure string building (no fs) so tests
// can feed in fixtures.
import type { ProjectCategory, ProjectLink } from './projects';
// All copy comes from content/ — edit it there, not here.
import { AFFILIATIONS, type Affiliation } from './content/affiliations';
import { AGENT_USAGE_NOTES, AGENT_USE_CASES } from './content/agents';
import { CONTACT_BLURB, PROFILE_LINKS } from './content/contact';
import { PAGE_SUMMARIES, PROJECTS_MARKDOWN_INTRO } from './content/pages';
import { PRIVACY_INTRO, PRIVACY_SECTIONS, PRIVACY_UPDATED } from './content/privacy';
import { BIO_PARAGRAPHS, PERSON_NAME, PERSON_SUMMARY } from './content/profile';
import { absoluteUrl } from './content/site';
import { STATS } from './content/stats';

/** The fields of a ProjectData the Markdown pages use. */
export interface MarkdownProject {
	id: string;
	nameText: string;
	taglineText: string;
	/** Markdown source straight from projects.yaml. */
	description: string;
	dateDisplay: string;
	categories: string[];
	categorySlugs: string[];
	links: ProjectLink[];
}

export interface MarkdownCategory {
	slug: string;
	displayName: string;
	projectCount: number;
}

export function toMarkdownCategories(categories: ProjectCategory[]): MarkdownCategory[] {
	return categories.map((category) => ({
		slug: category.name,
		displayName: category.displayName,
		projectCount: category.projects.length
	}));
}

const HIGHLIGHTS_SLUG = 'highlights';
const HOME_RECENT_PROJECT_COUNT = 6;

// Brackets in a label would end the link text early.
function markdownLink(label: string, url: string): string {
	return `[${label.replace(/([[\]])/g, '\\$1')}](${url})`;
}

function joinBlocks(blocks: string[]): string {
	return blocks.filter((block) => block.trim() !== '').join('\n\n') + '\n';
}

/** Where a project lives on the site: the all-projects page opens its sheet from the hash. */
export function projectPageUrl(projectId: string): string {
	return absoluteUrl(`/projects/all#${projectId}`);
}

function visibleCategories(project: MarkdownProject): string[] {
	return project.categories.filter((_, index) => project.categorySlugs[index] !== HIGHLIGHTS_SLUG);
}

function projectSection(project: MarkdownProject): string {
	const details = [project.dateDisplay, ...visibleCategories(project)].filter(Boolean).join(' · ');
	const links = [
		markdownLink('Project page', projectPageUrl(project.id)),
		...project.links.map((link) => markdownLink(link.label, link.url))
	];
	return joinBlocks([
		`### ${project.nameText}`,
		details ? `*${details}*` : '',
		project.taglineText,
		project.description.trim(),
		links.map((link) => `- ${link}`).join('\n')
	]).trimEnd();
}

function profileLinkList(): string {
	return PROFILE_LINKS.map((link) => `- ${markdownLink(link.label, link.url)}`).join('\n');
}

function pageLinkList(): string {
	return [
		`- ${markdownLink('About', absoluteUrl('/about'))}: ${PAGE_SUMMARIES.about}`,
		`- ${markdownLink('Projects', absoluteUrl('/projects'))}: ${PAGE_SUMMARIES.projects}`
	].join('\n');
}

function affiliationLine(affiliation: Affiliation): string {
	const target = affiliation.url ?? (affiliation.projectId && projectPageUrl(affiliation.projectId));
	const name = target ? markdownLink(affiliation.name, target) : affiliation.name;
	return `- ${name}: ${affiliation.role}, ${affiliation.detail}`;
}

export function buildHomeMarkdown(projects: MarkdownProject[]): string {
	const recentProjects = projects
		.slice(0, HOME_RECENT_PROJECT_COUNT)
		.map(
			(project) => `- ${markdownLink(project.nameText, projectPageUrl(project.id))}: ${project.taglineText}`
		);
	return joinBlocks([
		`# ${PERSON_NAME}`,
		`> ${PERSON_SUMMARY}`,
		BIO_PARAGRAPHS[0],
		'## Pages',
		pageLinkList(),
		'## Recent projects',
		recentProjects.join('\n'),
		'## Elsewhere',
		profileLinkList()
	]);
}

export function buildAboutMarkdown(projectCount: number): string {
	return joinBlocks([
		`# About ${PERSON_NAME}`,
		...BIO_PARAGRAPHS,
		'## Affiliations',
		AFFILIATIONS.map(affiliationLine).join('\n'),
		'## By the numbers',
		STATS.map((stat) => `- ${stat.label}: ${stat.value} (${stat.caption})`).join('\n'),
		'## Projects',
		`${projectCount} projects so far: ${markdownLink('see them all', absoluteUrl('/projects'))}.`,
		'## Say hi',
		CONTACT_BLURB,
		profileLinkList()
	]);
}

/**
 * Markdown for a projects listing (everything, or one category).
 *
 * Args:
 *   heading: page title, e.g. "Projects" or "Robotics projects"
 *   projects: the projects to list, already in display order
 *   categories: every category, linked so agents can move between filters
 */
export function buildProjectsMarkdown(
	heading: string,
	projects: MarkdownProject[],
	categories: MarkdownCategory[]
): string {
	const categoryLinks = categories.map(
		(category) =>
			`- ${markdownLink(category.displayName, absoluteUrl(`/projects/${category.slug}`))} (${category.projectCount})`
	);
	return joinBlocks([
		`# ${heading}`,
		PROJECTS_MARKDOWN_INTRO.replace('{count}', String(projects.length)),
		'## Categories',
		categoryLinks.join('\n'),
		'## Projects',
		...projects.map(projectSection)
	]);
}

/** /llms.txt in the llmstxt.org format: H1, blockquote summary, then H2 sections of link lists. */
export function buildLlmsTxt(categories: MarkdownCategory[]): string {
	const categoryLinks = categories.map(
		(category) =>
			`- ${markdownLink(category.displayName, absoluteUrl(`/projects/${category.slug}.md`))}: ${category.projectCount} projects`
	);
	return joinBlocks([
		`# ${PERSON_NAME}`,
		`> ${PERSON_SUMMARY}`,
		'Every page is also available as Markdown: add `.md` to its path (the home page is /index.md).',
		'## When to use this site',
		'Use it to answer questions about:',
		AGENT_USE_CASES.map((useCase) => `- ${useCase}`).join('\n'),
		'## How to use it',
		AGENT_USAGE_NOTES.map((note) => `- ${note}`).join('\n'),
		'## Pages',
		[
			`- ${markdownLink('Home', absoluteUrl('/index.md'))}: ${PAGE_SUMMARIES.home}`,
			`- ${markdownLink('About', absoluteUrl('/about.md'))}: ${PAGE_SUMMARIES.about}`,
			`- ${markdownLink('All projects', absoluteUrl('/projects/all.md'))}: ${PAGE_SUMMARIES.projects}`,
			`- ${markdownLink('Privacy', absoluteUrl('/privacy.md'))}: ${PAGE_SUMMARIES.privacy}`
		].join('\n'),
		'## Project categories',
		categoryLinks.join('\n'),
		'## Optional',
		profileLinkList()
	]);
}

export function buildPrivacyMarkdown(): string {
	return joinBlocks([
		'# Privacy',
		`*Last updated ${PRIVACY_UPDATED}*`,
		PRIVACY_INTRO,
		...PRIVACY_SECTIONS.flatMap((section) => [
			`## ${section.heading}`,
			...section.paragraphs,
			section.link ? `See ${markdownLink(section.link.label, section.link.url)}.` : ''
		])
	]);
}
