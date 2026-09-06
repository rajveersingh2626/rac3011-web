import {
  eventHasKnownTime,
  formatEventDate,
  formatEventDateTime,
  parseEventStart,
  relativeTimeOrFallback,
  titleCaseSlug,
} from './format';

describe('relativeTimeOrFallback', () => {
  it('returns the fallback for a null value', () => {
    expect(relativeTimeOrFallback(null)).toBe('Not sent yet');
    expect(relativeTimeOrFallback(null, 'Draft')).toBe('Draft');
  });

  it('formats a real date as a relative time with a suffix', () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    expect(relativeTimeOrFallback(oneHourAgo)).toBe('1 hour ago');
  });
});

describe('titleCaseSlug', () => {
  it('title-cases hyphen and underscore separated words', () => {
    expect(titleCaseSlug('officer-guides')).toBe('Officer Guides');
    expect(titleCaseSlug('brand_assets')).toBe('Brand Assets');
  });

  it('leaves a single word capitalised', () => {
    expect(titleCaseSlug('documents')).toBe('Documents');
  });
});

describe('parseEventStart', () => {
  it('treats an exact midnight timestamp as having no known time', () => {
    expect(parseEventStart('2026-08-02T00:00:00.000Z')?.hasTime).toBe(false);
    expect(eventHasKnownTime('2026-08-02T00:00:00.000Z')).toBe(false);
  });

  it('treats any non-midnight timestamp as having a known time', () => {
    expect(eventHasKnownTime('2026-08-02T00:01:00.000Z')).toBe(true);
    expect(eventHasKnownTime('2026-08-02T12:00:00.000Z')).toBe(true);
    expect(eventHasKnownTime('2026-08-02T23:59:00.000Z')).toBe(true);
  });

  it('reads a date-only value as having no known time', () => {
    expect(eventHasKnownTime('2026-08-02')).toBe(false);
  });

  it('returns null for missing or unparseable values', () => {
    expect(parseEventStart(null)).toBeNull();
    expect(parseEventStart('')).toBeNull();
    expect(parseEventStart('not a date')).toBeNull();
    expect(eventHasKnownTime(undefined)).toBe(false);
  });

  it('keeps the stored wall clock instead of shifting it into the viewer timezone', () => {
    const start = parseEventStart('2026-08-02T00:00:00.000Z');
    expect(start?.date.getFullYear()).toBe(2026);
    expect(start?.date.getMonth()).toBe(7);
    expect(start?.date.getDate()).toBe(2);
    expect(start?.date.getHours()).toBe(0);
    expect(parseEventStart('2026-08-02T18:30:00.000Z')?.date.getHours()).toBe(18);
  });
});

describe('formatEventDate / formatEventDateTime', () => {
  it('formats the date without a time when the time is midnight', () => {
    expect(formatEventDateTime('2026-08-02T00:00:00.000Z')).toBe('Sunday 2 August 2026');
  });

  it('appends the time when the event has a real time', () => {
    expect(formatEventDateTime('2026-08-02T00:01:00.000Z')).toBe('Sunday 2 August 2026 · 12:01 AM');
    expect(formatEventDateTime('2026-08-02T12:00:00.000Z')).toBe('Sunday 2 August 2026 · 12:00 PM');
  });

  it('formats a date with a custom pattern', () => {
    expect(formatEventDate('2026-08-02T00:00:00.000Z', 'yyyy-MM-dd')).toBe('2026-08-02');
    expect(formatEventDate(null)).toBeNull();
    expect(formatEventDateTime(null)).toBeNull();
  });
});
