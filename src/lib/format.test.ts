import { relativeTimeOrFallback, titleCaseSlug } from './format';

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
