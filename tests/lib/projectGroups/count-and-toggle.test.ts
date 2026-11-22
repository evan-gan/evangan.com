import { describe, expect, it } from 'vitest';
import { formatProjectCount, toggleFilter } from '../../../src/lib/projectGroups';

describe('formatProjectCount', () => {
	it('uses the singular for one project', () => {
		expect(formatProjectCount(1)).toBe('1 project');
	});

	it('uses the plural otherwise, including zero', () => {
		expect(formatProjectCount(8)).toBe('8 projects');
		expect(formatProjectCount(0)).toBe('0 projects');
	});
});

describe('toggleFilter', () => {
	it('selects a newly clicked filter', () => {
		expect(toggleFilter('all', 'builds')).toBe('builds');
		expect(toggleFilter('robotics', 'builds')).toBe('builds');
	});

	it('goes back to all projects when the selected filter is clicked again', () => {
		expect(toggleFilter('builds', 'builds')).toBe('all');
	});
});
