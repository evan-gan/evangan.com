import { dev } from '$app/environment';
import { json, error } from '@sveltejs/kit';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import type { RequestHandler } from './$types';

export const prerender = false;

const THUMBNAILS_DIR = join(process.cwd(), 'static', 'thumbnails');

export const POST: RequestHandler = async ({ request }) => {
	if (!dev) {
		throw error(404, 'Not found');
	}

	try {
		const formData = await request.formData();
		const file = formData.get('file') as File;
		
		if (!file) {
			throw error(400, 'No file provided');
		}

		// Get the file extension
		const ext = file.name.split('.').pop();
		const filename = `${Date.now()}.${ext}`;
		const filepath = join(THUMBNAILS_DIR, filename);

		// Convert file to buffer and write
		const buffer = Buffer.from(await file.arrayBuffer());
		await writeFile(filepath, buffer);

		return json({ 
			success: true, 
			path: `/thumbnails/${filename}` 
		});
	} catch (err) {
		console.error('Error uploading thumbnail:', err);
		throw error(500, 'Failed to upload thumbnail');
	}
};
