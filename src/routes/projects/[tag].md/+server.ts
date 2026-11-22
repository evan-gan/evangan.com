// Markdown twins of /projects/all and each /projects/<category> filter page.
import { error } from '@sveltejs/kit';
import { buildProjectsMarkdown, toMarkdownCategories } from '$lib/agentMarkdown';
import { markdownResponse } from '$lib/markdownResponse';
import { getAllProjectsFlat, loadAllProjects } from '$lib/projects';

export const prerender = true;

const ALL_PROJECTS_TAG = 'all';

// Same pages the HTML route prerenders, so every filter has a Markdown twin.
export const entries = () => [
	{ tag: ALL_PROJECTS_TAG },
	...loadAllProjects().map((category) => ({ tag: category.name }))
];

export const GET = ({ params }) => {
	const categories = loadAllProjects();
	const markdownCategories = toMarkdownCategories(categories);
	if (params.tag === ALL_PROJECTS_TAG) {
		return markdownResponse(buildProjectsMarkdown('Projects', getAllProjectsFlat(), markdownCategories));
	}
	const category = categories.find((candidate) => candidate.name === params.tag);
	if (!category) {
		error(404, `No project category "${params.tag}"; see /llms.txt for the list.`);
	}
	return markdownResponse(
		buildProjectsMarkdown(`${category.displayName} projects`, category.projects, markdownCategories)
	);
};
