import type { ProjectData, ProjectLink } from './projects';

/** The slice of a project the home gallery needs (kept small to keep the home page payload light). */
export interface GalleryProject {
	id: string;
	nameText: string;
	taglineText: string;
	thumbnail: string;
	/** width / height of the thumbnail */
	ratio: number;
	/** Small AVIF version of `thumbnail`, loaded first; null when none was generated. */
	preview: string | null;
	dateDisplay: string;
	categories: string[];
	categorySlugs: string[];
	links: ProjectLink[];
}

/**
 * Trim a project to the fields the gallery / focus card use.
 *
 * Returns:
 *   null when the project has no measured photo (gallery tiles and the focus card are sized from the ratio).
 */
export function toGalleryProject(project: ProjectData): GalleryProject | null {
	if (!project.hasThumbnail || !project.thumbnailRatio) return null;
	return {
		id: project.id,
		nameText: project.nameText,
		taglineText: project.taglineText,
		thumbnail: project.thumbnail,
		ratio: project.thumbnailRatio,
		preview: project.thumbnailPreview,
		dateDisplay: project.dateDisplay,
		categories: project.categories,
		categorySlugs: project.categorySlugs,
		links: project.links
	};
}
