// Markdown twin of /projects (everything).
import { buildProjectsMarkdown, toMarkdownCategories } from '$lib/agentMarkdown';
import { markdownResponse } from '$lib/markdownResponse';
import { getAllProjectsFlat, loadAllProjects } from '$lib/projects';

export const prerender = true;

export const GET = () =>
	markdownResponse(
		buildProjectsMarkdown('Projects', getAllProjectsFlat(), toMarkdownCategories(loadAllProjects()))
	);
