import { describe, expect, it } from 'vitest';
import { previewPathFor } from '../../../src/lib/thumbnailPreview.js';

describe('previewPathFor', () => {
	it('maps a thumbnail to an AVIF of the same name in the previews folder', () => {
		expect(previewPathFor('/thumbnails/1760310168343-webp.webp')).toBe(
			'/thumbnails/previews/1760310168343-webp.avif'
		);
	});

	it('keeps dots inside the name, only replacing the extension', () => {
		expect(previewPathFor('/thumbnails/1788639210808.JPG-webp.webp')).toBe(
			'/thumbnails/previews/1788639210808.JPG-webp.avif'
		);
	});

	it('has no preview for SVGs, remote URLs, or files outside /thumbnails', () => {
		expect(previewPathFor('/thumbnails/placeholder.svg')).toBeNull();
		expect(previewPathFor('https://example.com/photo.jpg')).toBeNull();
		expect(previewPathFor('/photo of me.jpg')).toBeNull();
		expect(previewPathFor('/thumbnails/../secret.png')).toBeNull();
	});
});
