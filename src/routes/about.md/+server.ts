// Markdown twin of /about.
import { buildAboutMarkdown } from '$lib/agentMarkdown';
import { markdownResponse } from '$lib/markdownResponse';
import { getAllProjectsFlat } from '$lib/projects';

export const prerender = true;

export const GET = () => markdownResponse(buildAboutMarkdown(getAllProjectsFlat().length));
