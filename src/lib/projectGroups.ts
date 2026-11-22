// Pure helpers for arranging projects on the projects page. No fs access, so they run in the
// browser and in tests (unlike $lib/projects, which reads the YAML file).

export const HIGHLIGHTS_SLUG = 'highlights';
export const EARLIER_LABEL = 'Earlier';
export const ALL_PROJECTS_SLUG = 'all';

interface YearTagged {
	year: number;
}

interface Categorized {
	categories: string[];
	categorySlugs: string[];
}

export interface YearGroup<T> {
	label: string;
	projects: T[];
}

/**
 * Split projects into one group per recent year, plus a trailing "Earlier" group.
 * Older years are folded together so a lone project from years ago doesn't get its own section.
 *
 * Args:
 *   projects: already sorted newest first; order inside each group is preserved
 *   recentYearCount: how many of the newest distinct years get their own section
 *
 * Returns:
 *   Groups newest first, e.g. [{label: "2026"}, {label: "2025"}, {label: "Earlier"}]; empty groups are omitted.
 */
export function groupProjectsByYear<T extends YearTagged>(
	projects: T[],
	recentYearCount = 3
): YearGroup<T>[] {
	const distinctYears = [...new Set(projects.map((project) => project.year))]
		.filter((year) => year > 0)
		.sort((first, second) => second - first);
	const ownSectionYears = new Set(distinctYears.slice(0, recentYearCount));

	const groupsByLabel = new Map<string, T[]>();
	for (const year of distinctYears.slice(0, recentYearCount)) {
		groupsByLabel.set(String(year), []);
	}
	groupsByLabel.set(EARLIER_LABEL, []);

	for (const project of projects) {
		const label = ownSectionYears.has(project.year) ? String(project.year) : EARLIER_LABEL;
		groupsByLabel.get(label)!.push(project);
	}

	return [...groupsByLabel.entries()]
		.filter(([, groupProjects]) => groupProjects.length > 0)
		.map(([label, groupProjects]) => ({ label, projects: groupProjects }));
}

export function isHighlight(project: Categorized): boolean {
	return project.categorySlugs.includes(HIGHLIGHTS_SLUG);
}

/** Categories to print on a card; "Highlights" is shown as a badge instead. */
export function displayCategories(project: Categorized): { name: string; slug: string }[] {
	return project.categories
		.map((name, index) => ({ name, slug: project.categorySlugs[index] }))
		.filter((category) => category.slug !== HIGHLIGHTS_SLUG);
}

export function matchesFilter(project: Categorized, filterSlug: string): boolean {
	return filterSlug === ALL_PROJECTS_SLUG || project.categorySlugs.includes(filterSlug);
}

/** The year groups for one filter: the projects matching `filterSlug`, split by groupProjectsByYear. */
export function groupFilteredProjects<T extends YearTagged & Categorized>(
	projects: T[],
	filterSlug: string
): YearGroup<T>[] {
	return groupProjectsByYear(projects.filter((project) => matchesFilter(project, filterSlug)));
}

/**
 * Every real photo a projects page can show, in the shape the page image loader takes.
 * Pages pass all projects (not just the current filter's) so switching filters finds photos ready.
 */
export function projectPhotos(
	projects: { hasThumbnail: boolean; thumbnail: string; thumbnailPreview: string | null }[]
): { thumbnail: string; preview: string | null }[] {
	return projects
		.filter((project) => project.hasThumbnail)
		.map((project) => ({ thumbnail: project.thumbnail, preview: project.thumbnailPreview }));
}

/** "1 project" / "8 projects". */
export function formatProjectCount(count: number): string {
	return `${count} ${count === 1 ? 'project' : 'projects'}`;
}

/** Clicking the selected filter again goes back to everything, so filter tiles work as toggles. */
export function toggleFilter(currentSlug: string, clickedSlug: string): string {
	return currentSlug === clickedSlug ? ALL_PROJECTS_SLUG : clickedSlug;
}
