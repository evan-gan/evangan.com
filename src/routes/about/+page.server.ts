import { getAllProjectsFlat } from '$lib/projects';

const RECENT_PROJECT_COUNT = 2;

// The project count and "Working on lately" come from projects.yaml so they stay current on their own.
export const load = () => {
	const projects = getAllProjectsFlat();
	const recentProjects = projects
		.filter((project) => project.hasThumbnail)
		.slice(0, RECENT_PROJECT_COUNT)
		.map((project) => ({
			id: project.id,
			nameText: project.nameText,
			dateDisplay: project.dateDisplay,
			thumbnail: project.thumbnail,
			preview: project.thumbnailPreview
		}));
	// The affiliation tiles reuse project photos, so their previews are looked up by photo path.
	const previewByThumbnail = Object.fromEntries(
		projects.map((project) => [project.thumbnail, project.thumbnailPreview])
	);
	return { projectCount: projects.length, recentProjects, previewByThumbnail };
};
