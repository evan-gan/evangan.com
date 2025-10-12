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

  // Month-year range: "April 2024 - June 2025"
  m = s.match(/^([A-Za-z]+)\s+(\d{4})\s*-\s*([A-Za-z]+)\s+(\d{4})$/);
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

export default formatDate;
