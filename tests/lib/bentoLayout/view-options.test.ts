import { describe, expect, it } from 'vitest';
import { BENTO_VIEW_OPTIONS } from '../../../src/lib/bentoLayout';

describe('BENTO_VIEW_OPTIONS', () => {
	it('offers everything first, then highlights, keyed by the real filter slugs', () => {
		expect(BENTO_VIEW_OPTIONS.map((option) => option.key)).toEqual(['all', 'highlights']);
	});
});
