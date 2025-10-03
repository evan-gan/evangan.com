import { dev } from '$app/environment';
import { json, error } from '@sveltejs/kit';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import type { RequestHandler } from './$types';

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
		return json({ success: true });
	} catch (err) {
		console.error('Error writing projects file:', err);
		throw error(500, 'Failed to write projects file');
	}
};
