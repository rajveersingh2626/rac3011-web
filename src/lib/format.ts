import { format, formatDistanceToNowStrict } from 'date-fns';

export function relativeTimeOrFallback(value: string | null, fallback = 'Not sent yet'): string {
  if (!value) return fallback;
  return formatDistanceToNowStrict(new Date(value), { addSuffix: true });
}

export function titleCaseSlug(input: string): string {
  return input
    .split(/[-_]/)
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');
}

// Event timestamps are naive local wall-clock values that the API serialises with a `Z` suffix,
// so they are read literally instead of being converted through the viewer's timezone.
const WALL_CLOCK_RE = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/;

export interface EventStart {
  /** Wall-clock instant rebuilt in the local timezone, safe for date-fns formatting. */
  date: Date;
  /** False when the stored time is exactly midnight, our marker for "time not specified". */
  hasTime: boolean;
}

export function parseEventStart(value: string | null | undefined): EventStart | null {
  if (!value) return null;
  const m = WALL_CLOCK_RE.exec(value);
  if (!m) return null;
  const [, y, mo, d, hh, mm] = m;
  const hours = hh ? Number(hh) : 0;
  const minutes = mm ? Number(mm) : 0;
  const date = new Date(Number(y), Number(mo) - 1, Number(d), hours, minutes);
  if (isNaN(date.getTime())) return null;
  return { date, hasTime: hh !== undefined && (hours !== 0 || minutes !== 0) };
}

export function eventHasKnownTime(value: string | null | undefined): boolean {
  return parseEventStart(value)?.hasTime ?? false;
}

export function formatEventDate(value: string | null | undefined, pattern = 'EEEE d MMMM yyyy'): string | null {
  const start = parseEventStart(value);
  return start ? format(start.date, pattern) : null;
}

export function formatEventDateTime(
  value: string | null | undefined,
  datePattern = 'EEEE d MMMM yyyy',
  timePattern = 'h:mm a',
  separator = ' · '
): string | null {
  const start = parseEventStart(value);
  if (!start) return null;
  const datePart = format(start.date, datePattern);
  return start.hasTime ? `${datePart}${separator}${format(start.date, timePattern)}` : datePart;
}
