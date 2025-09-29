import { getAllProjectsFlat, loadAllProjects } from '$lib/projects.js';

export const load = async () => {
	const categories = loadAllProjects();
	const projects = getAllProjectsFlat();
	
	return {
		categories,
		projects
	};
};