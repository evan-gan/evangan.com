import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: { 
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: undefined,
			precompress: false,
			strict: false // Allow dev-only routes (editor, API endpoints) to be excluded from build
		}),
		prerender: {
			// /projects/...#<project-id> isn't an element anchor: the page reads the hash and opens that
			// project's sheet. Any other missing anchor is still a real broken link.
			handleMissingId: ({ path, message }) => {
				if (path.startsWith('/projects/')) return;
				throw new Error(message);
			}
		}
	}
};

export default config;
