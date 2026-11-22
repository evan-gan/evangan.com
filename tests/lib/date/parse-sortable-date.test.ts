import { describe, expect, it } from 'vitest';
import { compareSortableDatesDescending, parseSortableDate } from '../../../src/lib/date';

describe('parseSortableDate', () => {
	it('reads a single full date', () => {
		expect(parseSortableDate('Nov 23, 2024')).toEqual({ year: 2024, month: 10, day: 23 });
	});

	it('uses the last day of a day range', () => {
		expect(parseSortableDate('Aug 8-11, 2025')).toEqual({ year: 2025, month: 7, day: 11 });
	});

	it('uses the end of a month-year range', () => {
		expect(parseSortableDate('Sep 2022 - June 2026')).toEqual({ year: 2026, month: 5, day: 32 });
	});

	it('uses the end of a range written with commas ("Nov, 2025 - Aug, 2026")', () => {
		expect(parseSortableDate('Nov, 2025 - Aug, 2026').year).toBe(2026);
	});

	it('treats a whole month as later than any specific day in it', () => {
		expect(parseSortableDate('May 2024').day).toBe(32);
		expect(parseSortableDate('Jan 2024').day).toBe(32);
	});

	it('returns year 0 when there is no year', () => {
		expect(parseSortableDate('').year).toBe(0);
		expect(parseSortableDate('sometime').year).toBe(0);
	});
});

describe('compareSortableDatesDescending', () => {
	it('orders newest first across year, month, then day', () => {
		const dates = ['Mar 8, 2025', 'Aug 8-11, 2025', 'Mar 15, 2025', 'Nov 23, 2024'].map(
			parseSortableDate
		);
		const sorted = [...dates].sort(compareSortableDatesDescending);
		expect(sorted.map((date) => `${date.year}-${date.month}-${date.day}`)).toEqual([
			'2025-7-11',
			'2025-2-15',
			'2025-2-8',
			'2024-10-23'
		]);
	});
});
