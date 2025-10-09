import { getAllProjectsFlat, loadAllProjects, getTagOrder } from '$lib/projects.js';

export const load = async () => {
	const categories = loadAllProjects();
	const projects = getAllProjectsFlat();
	const tagOrder = getTagOrder();
	
	return {
		categories,
		projects,
		tagOrder
	};
};