// Markdown twin of the home page, prerendered to build/index.md.
import { buildHomeMarkdown } from '$lib/agentMarkdown';
import { markdownResponse } from '$lib/markdownResponse';
import { getAllProjectsFlat } from '$lib/projects';

export const prerender = true;

export const GET = () => markdownResponse(buildHomeMarkdown(getAllProjectsFlat()));
