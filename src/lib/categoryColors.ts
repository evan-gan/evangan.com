/**
 * Inline CSS custom properties that point a component at one category's colour tokens
 * (defined in app.css), falling back to the neutral set for categories without their own colour.
 *
 * Args:
 *   slug: a slugified category name (only [a-z0-9-], so safe inside a CSS variable name)
 *
 * Returns:
 *   A style string setting --category-dot, --category-tint and --category-ink.
 */
export function categoryColorStyle(slug: string | undefined): string {
	if (!slug) {
		return '--category-dot: var(--cat-default); --category-tint: var(--cat-default-tint); --category-ink: var(--cat-default-ink)';
	}
	return [
		`--category-dot: var(--cat-${slug}, var(--cat-default))`,
		`--category-tint: var(--cat-${slug}-tint, var(--cat-default-tint))`,
		`--category-ink: var(--cat-${slug}-ink, var(--cat-default-ink))`
	].join('; ');
}
