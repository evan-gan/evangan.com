import { json } from '@sveltejs/kit';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { dev } from '$app/environment';
import type { RequestHandler } from './$types';

export const prerender = false;

export const GET: RequestHandler = async () => {
	if (!dev) {
		throw new Response('Not found', { status: 404 });
	}

	try {
		const thumbnailsDir = join(process.cwd(), 'static', 'thumbnails');
		const files = await readdir(thumbnailsDir);
		
		// Filter for image files only
		const imageFiles = files.filter(file => 
			/\.(jpg|jpeg|png|gif|svg|webp)$/i.test(file)
		);
		
		// Return paths relative to static folder
		const thumbnails = imageFiles.map(file => `/thumbnails/${file}`);
		
		return json({ thumbnails });
	} catch (err) {
		console.error('Failed to read thumbnails:', err);
		return json({ thumbnails: [] });
	}
};
