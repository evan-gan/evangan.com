// Number tiles on the About page (colours are set there) and the about.md "By the numbers" list.
// The project count tile isn't here: it's counted from projects.yaml.

export interface Stat {
	label: string;
	value: string;
	caption: string;
}

export const HACKATHONS_RUN: Stat = {
	label: 'Hackathons run',
	value: '7',
	caption: 'organized and run since 2024'
};

export const BUDGET_MANAGED: Stat = { label: 'Managed', value: '$500K', caption: 'in event budgets' };

export const BIGGEST_EVENT: Stat = {
	label: 'Biggest event',
	value: '130',
	caption: 'people at Shipwrecked'
};

// Order of the about.md list.
export const STATS = [HACKATHONS_RUN, BUDGET_MANAGED, BIGGEST_EVENT];
