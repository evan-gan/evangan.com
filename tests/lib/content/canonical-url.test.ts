import { describe, expect, it } from 'vitest';
import { canonicalUrl } from '../../../src/lib/content/site';

describe('canonicalUrl', () => {
	it('points the home page at the www root', () => {
		expect(canonicalUrl('/')).toBe('https://www.evangan.com/');
	});

	it('keeps inner paths absolute and drops trailing slashes', () => {
		expect(canonicalUrl('/about')).toBe('https://www.evangan.com/about');
		expect(canonicalUrl('/projects/robotics/')).toBe('https://www.evangan.com/projects/robotics');
	});
});
