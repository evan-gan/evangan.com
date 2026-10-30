import { describe, expect, it } from 'vitest';
import { categoryColorStyle } from '../../../src/lib/categoryColors';

describe('categoryColorStyle', () => {
	it('points at the category tokens with a neutral fallback', () => {
		const style = categoryColorStyle('builds');
		expect(style).toContain('--category-dot: var(--cat-builds, var(--cat-default))');
		expect(style).toContain('--category-tint: var(--cat-builds-tint, var(--cat-default-tint))');
		expect(style).toContain('--category-ink: var(--cat-builds-ink, var(--cat-default-ink))');
	});

	it('uses the neutral tokens when there is no category', () => {
		expect(categoryColorStyle(undefined)).toContain('--category-dot: var(--cat-default)');
	});
});
