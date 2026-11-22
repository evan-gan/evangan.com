// Minimal date formatting helper for friendly display of dates and ranges
// Examples handled:
// - "Aug 8-11, 2025" -> "Aug 8-11th 2025"
// - "Jul 12-19, 2024" -> "Jul 12-19th 2024" (hyphen normalized to en dash)
// - "Nov 23, 2024"    -> "Nov 23rd 2024"
// - "May 2024"        -> "May 2024"
// - "2024"            -> "2024"
// - "" or invalid     -> ""

function ordinal(n: number): string {
  const rem10 = n % 10;
  const rem100 = n % 100;
  if (rem10 === 1 && rem100 !== 11) return `${n}st`;
  if (rem10 === 2 && rem100 !== 12) return `${n}nd`;
  if (rem10 === 3 && rem100 !== 13) return `${n}rd`;
  return `${n}th`;
}

function monthCap3(m: string): string {
  if (!m) return m;
  const lower = m.toLowerCase();
  const abbr = lower.slice(0, 3);
  return abbr.charAt(0).toUpperCase() + abbr.slice(1); // "Jan"
}

/**
 * Format a date or date range string into a friendly display string.
 */
export function formatDate(input: string | undefined | null): string {
  const raw = (input ?? '').trim();
  if (!raw) return '';

  // Normalize dashes and hyphens
  const s = raw.replace(/\s*-\s*/g, '-'); // hyphen to en dash with no extra spaces

  // Multi-month range with comma before year: "Sep - Nov, 2024" -> "Sep-Nov 2024"
  let m = s.match(/^([A-Za-z]+)\s*-\s*([A-Za-z]+),\s*(\d{4})$/);
  if (m) {
    const [, mon1, mon2, y] = m;
    return `${monthCap3(mon1)}-${monthCap3(mon2)} ${y}`;
  }

  // Multi-month range with year: "April-June 2024" -> "Apr-Jun 2024"
  m = s.match(/^([A-Za-z]+)\s*-\s*([A-Za-z]+)\s+(\d{4})$/);
  if (m) {
    const [, mon1, mon2, y] = m;
    return `${monthCap3(mon1)}-${monthCap3(mon2)} ${y}`;
  }

  // Full date range (same or different years): "April 6th 2024 - June 3rd 2025"
  // Handles: "April 6 2024 - June 3 2025", "April 6, 2024 - June 3, 2025", etc.
  m = s.match(/^([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?\s*,?\s+(\d{4})\s*-\s*([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?\s*,?\s+(\d{4})$/);
  if (m) {
    const [, mon1, d1, y1, mon2, d2, y2] = m;
    const month1 = monthCap3(mon1);
    const day1 = parseInt(d1, 10);
    const month2 = monthCap3(mon2);
    const day2 = parseInt(d2, 10);
    return `${month1} ${ordinal(day1)} ${y1} - ${month2} ${ordinal(day2)} ${y2}`;
  }

  // Month-year range: "April 2024 - June 2025" or "Nov, 2025 - Aug, 2026"
  m = s.match(/^([A-Za-z]+),?\s+(\d{4})\s*-\s*([A-Za-z]+),?\s+(\d{4})$/);
  if (m) {
    const [, mon1, y1, mon2, y2] = m;
    return `${monthCap3(mon1)} ${y1} - ${monthCap3(mon2)} ${y2}`;
  }

  // Month-year to month-day-year: "April 2024 - June 2nd 2025"
  m = s.match(/^([A-Za-z]+)\s+(\d{4})\s*-\s*([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?\s*,?\s+(\d{4})$/);
  if (m) {
    const [, mon1, y1, mon2, d2, y2] = m;
    const day2 = parseInt(d2, 10);
    return `${monthCap3(mon1)} ${y1} - ${monthCap3(mon2)} ${ordinal(day2)} ${y2}`;
  }

  // Range: "Mon 8-11, 2025" -> "mon 8-11th 2025"
  m = s.match(/^([A-Za-z]+)\s+(\d{1,2})\s*-\s*(\d{1,2}),\s*(\d{4})$/);
  if (m) {
    const [, mon, d1, d2, y] = m;
    const month = monthCap3(mon);
    const end = parseInt(d2, 10);
    return `${month} ${d1}-${ordinal(end)} ${y}`;
  }

  // Single full date: "Mon 23, 2024" or "Mon 23 2024" -> "mon 23rd 2024"
  m = s.match(/^([A-Za-z]+)\s+(\d{1,2})(?:,)?\s+(\d{4})$/);
  if (m) {
    const [, mon, d, y] = m;
    const month = monthCap3(mon);
    const day = parseInt(d, 10);
    return `${month} ${ordinal(day)} ${y}`;
  }

  // Month + comma + Year: "May, 2024" -> "May 2024"
  m = s.match(/^([A-Za-z]+),\s*(\d{4})$/);
  if (m) {
    const [, mon, y] = m;
    return `${monthCap3(mon)} ${y}`;
  }

  // Month + Year: "May 2024"
  m = s.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (m) {
    const [, mon, y] = m;
    return `${monthCap3(mon)} ${y}`;
  }

  // Year only
  m = s.match(/^(\d{4})$/);
  if (m) return m[1];

  // Fallback: try Date parsing (best effort)
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // Unknown/unsupported format
  return raw;
}

export interface SortableDate {
  year: number;
  month: number;
  day: number;
}

const MONTH_PREFIXES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Reduce a free-form project date to comparable numbers, using the END of any range so
 * ongoing work ("Sep 2022 - June 2026") sorts and groups by when it finished.
 *
 * Args:
 *   dateStr: the raw `date` string from projects.yaml
 *
 * Returns:
 *   { year, month (0-11), day } — year is 0 when none is found. A month with no day gets
 *   day 32 so whole months sort as more recent than specific dates in that month.
 */
export function parseSortableDate(dateStr: string): SortableDate {
  const rangeWithDay = dateStr.match(/[-–]\s*([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?\s*,?\s+(\d{4})/);
  const rangeMonthOnly = dateStr.match(/[-–]\s*([A-Za-z]+),?\s+(\d{4})/);

  let targetDateStr = dateStr;
  if (rangeWithDay) {
    targetDateStr = `${rangeWithDay[1]} ${rangeWithDay[2]}, ${rangeWithDay[3]}`;
  } else if (rangeMonthOnly) {
    targetDateStr = `${rangeMonthOnly[1]} ${rangeMonthOnly[2]}`;
  }

  const yearMatch = targetDateStr.match(/\b(20\d{2})\b/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : 0;

  const monthIndex = MONTH_PREFIXES.findIndex((prefix) => targetDateStr.includes(prefix));
  const month = Math.max(monthIndex, 0);

  // For day ranges like "8-11" take the last day. The 1-2 digit match can't grab the 4-digit year.
  const dayMatch = targetDateStr.match(/\b(\d{1,2})(?:[-–](\d{1,2}))?\b/);
  let day = 0;
  if (dayMatch) {
    day = parseInt(dayMatch[2] ?? dayMatch[1], 10);
  } else if (monthIndex >= 0) {
    day = 32;
  }

  return { year, month, day };
}

/** Newest-first comparator for SortableDate values. */
export function compareSortableDatesDescending(first: SortableDate, second: SortableDate): number {
  if (first.year !== second.year) return second.year - first.year;
  if (first.month !== second.month) return second.month - first.month;
  return second.day - first.day;
}

export default formatDate;
