#!/usr/bin/env node

/**
 * Make small AVIF previews of every thumbnail in static/thumbnails (see src/lib/thumbnailPreview.js
 * for size and quality). The home gallery loads these first, then swaps in the full files.
 * Only (re)builds previews that are missing or older than their source. Needs ImageMagick 7 with AVIF.
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import { readdir, stat, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
	PREVIEW_FOLDER,
	PREVIEW_HEIGHT,
	PREVIEW_QUALITY,
	previewPathFor
} from './src/lib/thumbnailPreview.js';

const execFileAsync = promisify(execFile);
const STATIC_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'static');
const THUMBNAILS_DIR = path.join(STATIC_DIR, 'thumbnails');
const PREVIEWS_DIR = path.join(THUMBNAILS_DIR, PREVIEW_FOLDER);
const IMAGE_EXTENSIONS = [
	'.jpg',
	'.jpeg',
	'.png',
	'.webp',
	'.bmp',
	'.tiff',
	'.tif',
	'.avif',
	'.heic'
];

async function isUpToDate(sourcePath, previewPath) {
	if (!existsSync(previewPath)) return false;
	const [source, preview] = await Promise.all([stat(sourcePath), stat(previewPath)]);
	return preview.mtimeMs >= source.mtimeMs;
}

async function makePreview(sourcePath, previewPath) {
	// "x720>" only ever shrinks (to 720 px tall), keeping the aspect ratio the layout was measured with.
	// heic:speed=2 is slow but squeezes noticeably more out of AVIF; it runs once per photo.
	await execFileAsync('magick', [
		sourcePath,
		'-auto-orient',
		'-strip',
		'-resize',
		`x${PREVIEW_HEIGHT}>`,
		// 8-bit keeps to the AVIF profile every browser decodes (16-bit sources would otherwise give 12-bit).
		'-depth',
		'8',
		'-quality',
		String(PREVIEW_QUALITY),
		'-define',
		'heic:speed=2',
		previewPath
	]);
}

async function main() {
	try {
		await execFileAsync('magick', ['-version']);
	} catch {
		console.error(
			'ImageMagick 7 (`magick`) not found. Install it with `brew install imagemagick`.'
		);
		process.exit(1);
	}
	await mkdir(PREVIEWS_DIR, { recursive: true });

	const sources = (await readdir(THUMBNAILS_DIR)).filter((file) =>
		IMAGE_EXTENSIONS.includes(path.extname(file).toLowerCase())
	);
	let built = 0;
	let failed = 0;
	for (const file of sources) {
		const sourcePath = path.join(THUMBNAILS_DIR, file);
		const previewPath = path.join(STATIC_DIR, previewPathFor(`/thumbnails/${file}`));
		if (await isUpToDate(sourcePath, previewPath)) continue;
		try {
			await makePreview(sourcePath, previewPath);
			const kilobytes = ((await stat(previewPath)).size / 1024).toFixed(0);
			console.log(`✅ ${file} → ${path.relative(STATIC_DIR, previewPath)} (${kilobytes} KB)`);
			built++;
		} catch (error) {
			console.error(
				`❌ ${file}: ${error.message}\n   Check the file opens in an image viewer, then re-run.`
			);
			failed++;
		}
	}
	console.log(
		`Previews: ${built} built, ${sources.length - built - failed} already up to date, ${failed} failed.`
	);
	if (failed > 0) process.exit(1);
}

main();
