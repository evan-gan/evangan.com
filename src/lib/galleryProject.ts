import type { ProjectLink } from './projects';

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
