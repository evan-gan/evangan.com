// Pure helpers for arranging projects on the projects page. No fs access, so they run in the
// browser and in tests (unlike $lib/projects, which reads the YAML file).

const HIGHLIGHTS_SLUG = 'highlights';
export const EARLIER_LABEL = 'Earlier';
export const ALL_PROJECTS_SLUG = 'all';
const ALL_PROJECTS_LABEL = 'All Projects';

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

export interface FilterItem {
	slug: string;
	label: string;
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

/**
 * Build the filter bar entries in the order given by `tagOrder` in projects.yaml.
 *
 * Args:
 *   categories: every category found in the data
 *   tagOrder: display names in the desired order; "All Projects" may appear anywhere
 *
 * Returns:
 *   Ordered items; anything not named in tagOrder is appended in its original order.
 */
export function buildFilterItems(
	categories: { name: string; displayName: string }[],
	tagOrder: string[]
): FilterItem[] {
	const allProjectsItem: FilterItem = { slug: ALL_PROJECTS_SLUG, label: ALL_PROJECTS_LABEL };
	const categoryItems = categories.map((category) => ({
		slug: category.name,
		label: category.displayName
	}));
	if (tagOrder.length === 0) return [allProjectsItem, ...categoryItems];

	const remaining = new Set([allProjectsItem, ...categoryItems]);
	const ordered: FilterItem[] = [];
	for (const tagName of tagOrder) {
		const match =
			tagName === ALL_PROJECTS_LABEL
				? allProjectsItem
				: categoryItems.find((item) => item.label === tagName);
		if (match && remaining.has(match)) {
			ordered.push(match);
			remaining.delete(match);
		}
	}
	return [...ordered, ...remaining];
}

export function matchesFilter(project: Categorized, filterSlug: string): boolean {
	return filterSlug === ALL_PROJECTS_SLUG || project.categorySlugs.includes(filterSlug);
}
