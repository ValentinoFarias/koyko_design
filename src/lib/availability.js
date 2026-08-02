// Availability helper
// -----------------------------------------------------------------------------
// The hero shows a "next available" slot (e.g. "available · sep '26").
// Hardcoding that means it goes stale, so we derive it from today's date:
// current month + N months ahead (1 by default).

// Three-letter month abbreviations, lowercase to match the site's typography.
// We use a fixed list instead of Intl.DateTimeFormat because some locales
// abbreviate September as "Sept" (4 letters), which would break the alignment.
const MONTHS = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
];

/**
 * Returns the next available booking month, formatted like "sep '26".
 *
 * @param {number} monthsAhead - How many months after today to advertise. Default 1.
 * @param {Date}   from        - Reference date. Defaults to now; injectable for tests.
 * @returns {string} e.g. "sep '26"
 */
export function getAvailability(monthsAhead = 1, from = new Date()) {
  // Building a Date from (year, month + N, 1) lets the Date constructor handle
  // the year rollover for us: month index 12 becomes January of the next year.
  // Day 1 avoids the classic "Jan 31 + 1 month = Mar 3" overflow bug.
  const target = new Date(from.getFullYear(), from.getMonth() + monthsAhead, 1);

  const month = MONTHS[target.getMonth()];

  // Last two digits of the year, zero-padded ("2026" -> "26").
  const year = String(target.getFullYear() % 100).padStart(2, '0');

  return `${month} '${year}`;
}
