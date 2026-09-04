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
  const first = host.split('.')[0] ?? '';
  const byPrefix = PROJECT_SURFACES.find((s) => s === first);
  if (byPrefix) return byPrefix;
  if (isLocalHost(host)) {
    const q = new URLSearchParams(search).get('surface');
    if (isSurface(q)) return q;
  }
  return 'main';
}
