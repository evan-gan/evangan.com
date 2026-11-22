// /llms.txt (llmstxt.org): an index of the site's Markdown pages for AI agents.
import { buildLlmsTxt, toMarkdownCategories } from '$lib/agentMarkdown';
import { plainTextResponse } from '$lib/markdownResponse';
import { loadAllProjects } from '$lib/projects';

export const prerender = true;

export const GET = () => plainTextResponse(buildLlmsTxt(toMarkdownCategories(loadAllProjects())));
