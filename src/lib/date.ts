// Minimal date formatting helper for friendly display of dates and ranges
// Examples handled:
// - "Aug 8–11, 2025" -> "Aug 8–11th 2025"
// - "Jul 12-19, 2024" -> "Jul 12–19th 2024" (hyphen normalized to en dash)
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

  // Normalize dashes
  const s = raw.replace(/\s*-\s*/g, '–'); // hyphen to en dash with no extra spaces

  // Range: "Mon 8–11, 2025" -> "mon 8-11th 2025"
  let m = s.match(/^([A-Za-z]+)\s+(\d{1,2})\s*–\s*(\d{1,2}),\s*(\d{4})$/);
  if (m) {
    const [, mon, d1, d2, y] = m;
    const month = monthCap3(mon);
    const end = parseInt(d2, 10);
    return `${month} ${d1}–${ordinal(end)} ${y}`;
  }

  // Single full date: "Mon 23, 2024" or "Mon 23 2024" -> "mon 23rd 2024"
  m = s.match(/^([A-Za-z]+)\s+(\d{1,2})(?:,)?\s+(\d{4})$/);
  if (m) {
    const [, mon, d, y] = m;
    const month = monthCap3(mon);
    const day = parseInt(d, 10);
    return `${month} ${ordinal(day)} ${y}`;
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
