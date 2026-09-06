import { matchRoutes } from 'react-router';
import { createMainRouter } from './main.routes';

// Guards the district-site takeover: an earlier regression had a leftover `index: true`
// route silently outrank `path: '/'`, so the root served the old page instead.
function leafElementName(pathname: string): string | undefined {
  const matches = matchRoutes(createMainRouter().routes, pathname);
  const leaf = matches?.[matches.length - 1]?.route as { element?: { type?: { name?: string } } } | undefined;
  return leaf?.element?.type?.name;
}

describe('main router resolution', () => {
  const districtPaths = [
    '/',
    '/directory',
    '/map',
    '/heritage',
    '/initiatives',
    '/showcase',
    '/resources',
    '/calendar',
    '/governance',
    '/leadership',
  ];

  it.each(districtPaths)('%s renders the district site', (path) => {
    expect(leafElementName(path)).toBe('DistrictApp');
  });

  it('sends unmatched paths to the district site rather than a 404 page', () => {
    expect(leafElementName('/no-such-page')).toBe('DistrictApp');
  });

  const keptPages: [string, string][] = [
    ['/privacy-policy', 'PrivacyPolicyPage'],
    ['/terms-of-service', 'TermsOfServicePage'],
    ['/contact', 'ContactPage'],
    ['/partners', 'PartnersPage'],
    ['/publications', 'PublicationsPage'],
    ['/achievements', 'AchievementsPage'],
    ['/showcase/some-project', 'ShowcaseDetailPage'],
    ['/heritage/some-drr', 'DrrProfilePage'],
    ['/leadership/clubs/some-club', 'ClubLeadershipPage'],
    ['/calendar/some-event', 'EventPage'],
  ];

  it.each(keptPages)('%s still resolves to %s', (path, expected) => {
    expect(leafElementName(path)).toBe(expected);
  });

  it('keeps the portal reachable and separate from the district site', () => {
    expect(leafElementName('/portal/login')).toBe('LoginPage');
  });
});
