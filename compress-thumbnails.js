#!/usr/bin/env node

/**
 * Script to compress thumbnail images
 * Converts all image formats to WebP and compresses them
 * Creates compressed versions with "-webp.webp" suffix
 * Moves originals to oldNonCompressedAssets folder
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { readdir, stat, rename, mkdir, readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const THUMBNAILS_DIR = path.join(__dirname, 'static/thumbnails');
const ARCHIVE_DIR = path.join(__dirname, 'oldNonCompressedAssets');
const PROJECTS_YAML = path.join(__dirname, 'projects/projects.yaml');

// Image extensions to process
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff', '.tif'];

// Statistics
let compressedCount = 0;
let skippedCount = 0;
let yamlUpdatedCount = 0;

/**
 * Check if ImageMagick is installed
 */
async function checkImageMagick() {
	try {
		await execAsync('magick --version');
		return true;
	} catch {
		console.error('Error: ImageMagick is not installed. Please install it first.');
		console.error('  macOS: brew install imagemagick');
		console.error('  Ubuntu/Debian: sudo apt-get install imagemagick');
		return false;
	}
}

/**
 * Update YAML file with new filename
 */
async function updateYaml(oldFilename, newFilename) {
	if (!existsSync(PROJECTS_YAML)) {
		return;
	}

	try {
		let content = await readFile(PROJECTS_YAML, 'utf-8');
		
		if (content.includes(oldFilename)) {
			// Replace all occurrences
			content = content.replaceAll(oldFilename, newFilename);
			await writeFile(PROJECTS_YAML, content, 'utf-8');
			console.log('   📝 Updated in projects.yaml');
			yamlUpdatedCount++;
		}
	} catch (error) {
		console.error(`   ⚠️  Error updating YAML: ${error.message}`);
	}
}

/**
 * Compress an image file
 */
async function compressImage(filePath, filename) {
	const ext = path.extname(filename).toLowerCase();
	const basename = path.basename(filename, ext);
	
	// Process -compressed files to convert them to webp
	let isReprocessing = false;
	let actualBasename = basename;
	
	if (filename.includes('-compressed')) {
		isReprocessing = true;
		actualBasename = basename.replace('-compressed', '');
		console.log(`🔄 Reprocessing old compressed file: ${filename}`);
	} else if (filename.includes('-webp')) {
		// Skip if already webp
		console.log(`⏭️  Skipping already webp: ${filename}`);
		skippedCount++;
		return;
	}

	// Create webp filename
	const webpName = `${actualBasename}-webp.webp`;
	const webpPath = path.join(THUMBNAILS_DIR, webpName);

	if (isReprocessing) {
		console.log(`   Converting to WebP: ${filename} → ${webpName}`);
	} else if (ext !== '.webp') {
		console.log(`🔄 Converting & Compressing: ${filename} → ${webpName}`);
	} else {
		console.log(`🗜️  Compressing: ${filename} → ${webpName}`);
	}

	try {
		// ALL files go through the SAME compression command
		// WebP format for better compression with quality retention
		// -quality 80: WebP quality level (higher than JPG 50 because WebP is more efficient)
		// -define webp:method=6: Best compression (0-6, 6 is slowest but best)
		const command = `magick "${filePath}" -quality 80 -define webp:method=6 "${webpPath}"`;
		
		console.log(`   🔧 Running: ${command}`);
		
		const { stderr } = await execAsync(command);
		
		if (stderr) {
			console.log(`   ⚠️  Warning: ${stderr}`);
		}

		// Verify webp file was created
		if (!existsSync(webpPath)) {
			throw new Error('WebP file was not created');
		}

		// Get file sizes for comparison
		const originalStats = await stat(filePath);
		const webpStats = await stat(webpPath);
		const reduction = ((1 - webpStats.size / originalStats.size) * 100).toFixed(1);
		
		console.log(`   📊 Size: ${(originalStats.size / 1024).toFixed(1)}KB → ${(webpStats.size / 1024).toFixed(1)}KB (${reduction}% reduction)`);

		// Move original to archive
		const archivePath = path.join(ARCHIVE_DIR, filename);
		await rename(filePath, archivePath);

		// Update projects.yaml
		await updateYaml(filename, webpName);

		console.log(`   ✅ Created: ${webpName}`);
		console.log(`   📁 Archived: ${filename}`);
		compressedCount++;
	} catch (error) {
		console.error(`   ❌ Error processing ${filename}: ${error.message}`);
	}
}

/**
 * Main function
 */
async function main() {
	console.log('Starting image compression...');
	console.log(`Directory: ${THUMBNAILS_DIR}\n`);

	// Check if ImageMagick is installed
	if (!(await checkImageMagick())) {
		process.exit(1);
	}

	// Create archive directory if it doesn't exist
	if (!existsSync(ARCHIVE_DIR)) {
		await mkdir(ARCHIVE_DIR, { recursive: true });
	}

	// Check if thumbnails directory exists
	if (!existsSync(THUMBNAILS_DIR)) {
		console.error(`Error: ${THUMBNAILS_DIR} directory not found`);
		process.exit(1);
	}

	// Get all files in thumbnails directory
	const files = await readdir(THUMBNAILS_DIR);

	// Filter for image files
	const imageFiles = files.filter(file => {
		const ext = path.extname(file).toLowerCase();
		return IMAGE_EXTENSIONS.includes(ext);
	});

	console.log(`Found ${imageFiles.length} image(s) to process\n`);

	// Process each image
	for (const filename of imageFiles) {
		const filePath = path.join(THUMBNAILS_DIR, filename);
		await compressImage(filePath, filename);
		console.log(''); // Empty line between files
	}

	// Print summary
	console.log('============================================');
	console.log('Compression complete!');
	console.log(`  Compressed: ${compressedCount} files`);
	console.log(`  Skipped: ${skippedCount} files`);
	console.log(`  Updated in YAML: ${yamlUpdatedCount} references`);
	console.log(`  Originals archived in: ${ARCHIVE_DIR}`);
	console.log('============================================');
}

// Run the script
main().catch(error => {
	console.error('Fatal error:', error);
	process.exit(1);
});
