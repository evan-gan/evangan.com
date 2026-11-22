import { getAllProjectsFlat } from '$lib/projects';
import { toGalleryProject, type GalleryProject } from '$lib/galleryProject';

// Only projects with a measured photo can sit in the gallery (tiles are sized from the ratio).
// Fields are trimmed so the home page doesn't ship every description.
export const load = () => {
	const galleryProjects = getAllProjectsFlat()
		.map(toGalleryProject)
		.filter((project): project is GalleryProject => project !== null);
	return { galleryProjects };
};
