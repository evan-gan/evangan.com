import { describe, expect, it } from 'vitest';
import { formatIsoDateLong } from '../../../src/lib/date';

describe('formatIsoDateLong', () => {
	it('spells out the month and keeps the day regardless of timezone', () => {
		expect(formatIsoDateLong('2026-11-21')).toBe('November 21, 2026');
		expect(formatIsoDateLong('2026-01-01')).toBe('January 1, 2026');
	});

	it('throws a clear error for a non-date', () => {
		expect(() => formatIsoDateLong('soon')).toThrow(/expected a YYYY-MM-DD date/);
	});
});
