import { getAllProjectsFlat, loadAllProjects } from '$lib/projects.js';

// Categories come sorted by projects.yaml's tagOrder (their count tiles show in that order).
export const load = async () => ({
	categories: loadAllProjects(),
	projects: getAllProjectsFlat()
});

// One prerendered page per filter, so filters are plain links that work without JS.
export const entries = () => [{ tag: 'all' }, ...loadAllProjects().map((category) => ({ tag: category.name }))];
