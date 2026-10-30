import { describe, expect, it } from 'vitest';
import { previewLooksSoft } from '../../../src/lib/galleryLoading';

describe('previewLooksSoft', () => {
	it('keeps the preview for a 1512×982 Retina screen (358 px rows at 2×)', () => {
		expect(previewLooksSoft(358, 2, 720)).toBe(false);
	});

	it('asks for full quality when browser zoom raises the density', () => {
		expect(previewLooksSoft(358, 2.5, 720)).toBe(true);
	});

	it('asks for full quality when pinch zoom scales a 1× screen up 3×', () => {
		expect(previewLooksSoft(300, 1 * 3, 720)).toBe(true);
	});

	it('keeps the preview on a large 1× monitor', () => {
		expect(previewLooksSoft(541, 1, 720)).toBe(false);
	});
});
