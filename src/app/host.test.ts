import { resolveSurface } from './host';

describe('resolveSurface', () => {
  it.each([
    ['rotaract3011.org', 'main'],
    ['www.rotaract3011.org', 'main'],
    ['mission3011.rotaract3011.org', 'mission3011'],
    ['drishti.rotaract3011.org', 'drishti'],
    ['rcl.rotaract3011.org', 'rcl'],
    ['careerbridge.rotaract3011.org', 'careerbridge'],
    ['ride.rotaract3011.org', 'ride'],
    ['RIDE.rotaract3011.org', 'ride'],
    ['mission3011.rotaract3011.org.', 'mission3011'],
    ['mission3011.localhost', 'mission3011'],
    ['drishti.localhost', 'drishti'],
    ['localhost', 'main'],
    ['127.0.0.1', 'main'],
    ['staging.rotaract3011.org', 'main'],
    ['evil.com', 'main'],
  ])('%s → %s', (host, expected) => {
    expect(resolveSurface(host)).toBe(expected);
  });

  it('honours ?surface= on localhost only', () => {
    expect(resolveSurface('localhost', '?surface=rcl')).toBe('rcl');
    expect(resolveSurface('127.0.0.1', '?surface=ride')).toBe('ride');
    expect(resolveSurface('localhost', '?surface=bogus')).toBe('main');
    expect(resolveSurface('rotaract3011.org', '?surface=rcl')).toBe('main');
  });

  it('prefers hostname prefix over query', () => {
    expect(resolveSurface('drishti.localhost', '?surface=rcl')).toBe('drishti');
  });
});
