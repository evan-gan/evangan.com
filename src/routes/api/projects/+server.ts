import { dev } from '$app/environment';
import { json, error } from '@sveltejs/kit';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { RequestHandler } from './$types';

const execAsync = promisify(exec);

export const prerender = false;

const PROJECTS_FILE = join(process.cwd(), 'projects', 'projects.yaml');

export const GET: RequestHandler = async () => {
	if (!dev) {
		throw error(404, 'Not found');
	}

	try {
		const content = await readFile(PROJECTS_FILE, 'utf-8');
		return json({ content });
	} catch (err) {
		console.error('Error reading projects file:', err);
		throw error(500, 'Failed to read projects file');
	}
};

export const POST: RequestHandler = async ({ request }) => {
	if (!dev) {
		throw error(404, 'Not found');
	}

	try {
		const { content } = await request.json();
		await writeFile(PROJECTS_FILE, content, 'utf-8');
		
		// Wait 100ms after save completes, then run compression script
		setTimeout(async () => {
			try {
				const scriptPath = join(process.cwd(), 'compress-thumbnails.js');
				console.log('Running compression script after save...');
				await execAsync(`node "${scriptPath}"`);
				console.log('Compression complete');
			} catch (compressionError) {
				console.error('Compression script failed:', compressionError);
				// Don't fail the save if compression fails
			}
		}, 100);
		
		return json({ success: true });
	} catch (err) {
		console.error('Error writing projects file:', err);
		throw error(500, 'Failed to write projects file');
	}
};
