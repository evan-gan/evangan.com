import { getAllProjectsFlat } from '$lib/projects';
import type { GalleryProject } from '$lib/galleryProject';

// Only projects with a measured photo can sit in the gallery (tiles are sized from the ratio).
// Fields are trimmed so the home page doesn't ship every description.
export const load = () => {
	const galleryProjects: GalleryProject[] = getAllProjectsFlat()
		.filter((project) => project.hasThumbnail && project.thumbnailRatio)
		.map((project) => ({
			id: project.id,
			nameText: project.nameText,
			taglineText: project.taglineText,
			thumbnail: project.thumbnail,
			ratio: project.thumbnailRatio!,
			preview: project.thumbnailPreview,
			dateDisplay: project.dateDisplay,
			categories: project.categories,
			categorySlugs: project.categorySlugs,
			links: project.links
		}));
	return { galleryProjects };
};
