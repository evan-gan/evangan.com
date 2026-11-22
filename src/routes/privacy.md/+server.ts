// Markdown twin of /privacy.
import { buildPrivacyMarkdown } from '$lib/agentMarkdown';
import { markdownResponse } from '$lib/markdownResponse';

export const prerender = true;

export const GET = () => markdownResponse(buildPrivacyMarkdown());
