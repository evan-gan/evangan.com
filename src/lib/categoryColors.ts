export interface CategoryColorTokens {
	/** Solid colour (dots, accents). */
	dot: string;
	/** Soft background for photo-less tiles. */
	tint: string;
	/** Text colour that reads on the tint. */
	ink: string;
}

/**
 * CSS var() references to one category's colour tokens (defined in app.css), falling back to the
 * neutral set for categories without their own colour.
 *
 * Args:
 *   slug: a slugified category name (only [a-z0-9-], so safe inside a CSS variable name)
 *
 * Returns:
 *   CSS values for the category's dot, tint and ink colours.
 */
export function categoryColorTokens(slug: string | undefined): CategoryColorTokens {
	if (!slug) {
		return { dot: 'var(--cat-default)', tint: 'var(--cat-default-tint)', ink: 'var(--cat-default-ink)' };
	}
	return {
		dot: `var(--cat-${slug}, var(--cat-default))`,
		tint: `var(--cat-${slug}-tint, var(--cat-default-tint))`,
		ink: `var(--cat-${slug}-ink, var(--cat-default-ink))`
	};
}

/** Inline style setting --category-dot / --category-tint / --category-ink for one category. */
export function categoryColorStyle(slug: string | undefined): string {
	const tokens = categoryColorTokens(slug);
	return `--category-dot: ${tokens.dot}; --category-tint: ${tokens.tint}; --category-ink: ${tokens.ink}`;
}
