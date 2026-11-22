// Groups Evan belongs to: About page tiles (with photo + colours) and the about.md "Affiliations" list.

export interface Affiliation {
	name: string;
	/** Small uppercase line above the name on the tile, e.g. "FIRST Robotics". */
	role: string;
	detail: string;
	/** Tile photo; projects photos get their AVIF preview looked up automatically. */
	image?: string;
	/** External site the tile links to. */
	url?: string;
	/** Or: a project on the projects page whose sheet the tile opens. */
	projectId?: string;
	/** CSS colour tokens from app.css for the tile fill and role label. */
	fill: string;
	labelColor: string;
}

export const AFFILIATIONS: Affiliation[] = [
	{
		name: 'The LigerBots',
		role: 'FIRST Robotics',
		detail: 'Team 2877 · 2022–2026',
		image: '/thumbnails/1760310168343-webp.webp',
		url: 'https://ligerbots.org',
		fill: 'var(--affiliation-ligerbots)',
		labelColor: 'var(--affiliation-ligerbots-label)'
	},
	{
		name: 'Hack Club',
		role: 'Event organizer',
		detail: 'Hackathons for teens · 2024–2026',
		image: '/thumbnails/ShipwreckedGroupPhoto-webp.webp',
		url: 'https://hackclub.com',
		fill: 'var(--affiliation-hackclub)',
		labelColor: 'var(--affiliation-hackclub-label)'
	},
	{
		name: 'Open Sauce',
		role: 'Exhibitor',
		detail: 'Showed my CoreXY pen plotter · 2026',
		image: '/thumbnails/1788642542809-webp.webp',
		projectId: 'corexy-pen-plotter',
		fill: 'var(--affiliation-opensauce)',
		labelColor: 'var(--affiliation-opensauce-label)'
	},
	{
		name: 'WPI',
		role: 'Student',
		detail: 'Worcester Polytechnic Institute · 2026-2030',
		// Placeholder goat-statue photo until there's a real one (no AVIF preview; it's small).
		image: '/wpiGoatPlaceholder.jpg',
		fill: 'var(--affiliation-wpi)',
		labelColor: 'var(--affiliation-wpi-label)'
	}
];
