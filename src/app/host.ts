export const SURFACES = ['main', 'mission3011', 'drishti', 'rcl', 'careerbridge', 'ride'] as const;
export type Surface = (typeof SURFACES)[number];

const PROJECT_SURFACES = SURFACES.filter((s): s is Exclude<Surface, 'main'> => s !== 'main');

function isSurface(value: string | null): value is Surface {
  return value !== null && (SURFACES as readonly string[]).includes(value);
}

function isLocalHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost');
}

export function resolveSurface(hostname: string, search = ''): Surface {
  const host = hostname.toLowerCase().replace(/\.$/, '');
  const labels = host.split('.');
  const first = labels[0] ?? '';
  const byPrefix = PROJECT_SURFACES.find((s) => s === first);
  if (byPrefix) return byPrefix;
  // testing.<surface>.rotaract3011.org mirrors testing.rotaract3011.org (main's staging host)
  // for the project subdomains, so each surface gets its own staging URL.
  if (first === 'testing') {
    const byTestingPrefix = PROJECT_SURFACES.find((s) => s === labels[1]);
    if (byTestingPrefix) return byTestingPrefix;
  }
  if (isLocalHost(host)) {
    const q = new URLSearchParams(search).get('surface');
    if (isSurface(q)) return q;
  }
  return 'main';
}
