import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import express, { type Request, type Response, type NextFunction } from 'express';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = (name: string): unknown => JSON.parse(readFileSync(join(here, 'fixtures', name), 'utf8')) as unknown;

const PORT = Number(process.env.MOCK_API_PORT ?? 3001);
const SESSION_COOKIE = 'e2e_session';

const app = express();
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (typeof origin === 'string') res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

function hasSession(req: Request): boolean {
  return (req.headers.cookie ?? '').includes(`${SESSION_COOKIE}=1`);
}

app.get('/health', (_req, res) => void res.json({ ok: true }));

app.get('/me', (req, res) => {
  if (!hasSession(req)) {
    res.status(401).json({ statusCode: 401, error: 'Unauthorized' });
    return;
  }
  res.json(fixture('me.json'));
});

app.patch('/me', (_req, res) => void res.json(fixture('me.json')));

app.post('/auth/sign-in/email', (req, res) => {
  const body = req.body as { email?: string; password?: string };
  if (!body.email || !body.password) {
    res.status(400).json({ statusCode: 400, error: 'ValidationError', details: [{ path: 'email', message: 'Enter the email you registered with' }] });
    return;
  }
  if (body.password === 'wrong') {
    res.status(401).json({ statusCode: 401, message: 'That email and password do not match an account' });
    return;
  }
  res.json({ twoFactorRedirect: true, method: 'email' });
});

app.post('/auth/second-factor', (req, res) => {
  const body = req.body as { code?: string };
  if (body.code !== '417293') {
    res.status(401).json({ statusCode: 401, message: 'That code is not right. Check the latest email and try again.' });
    return;
  }
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=1; Path=/; SameSite=Lax`);
  res.json({ ok: true });
});

app.post('/auth/second-factor/resend', (_req, res) => void res.json({ ok: true, retryAfterSeconds: 30 }));
app.post('/auth/sign-out', (_req, res) => {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; Max-Age=0`);
  res.json({ ok: true });
});

app.get('/public/home', (_req, res) => void res.json(fixture('home.json')));
app.post('/public/visits', (_req, res) => void res.json({ year: 2026, count: 12481 }));

app.get('/public/clubs', (_req, res) => void res.json(fixture('clubs.json')));
app.get('/public/clubs/:slug', (_req, res) => void res.json(fixture('club-detail.json')));

app.get('/public/projects', (_req, res) => void res.json(fixture('projects.json')));
app.get('/public/projects/:slug', (_req, res) => void res.json(fixture('project-detail.json')));

app.get('/public/past-drrs', (_req, res) => void res.json(fixture('past-drrs.json')));
app.get('/public/past-drrs/:slug', (_req, res) => void res.json(fixture('past-drr-detail.json')));

app.get('/public/district-team', (_req, res) => void res.json(fixture('district-team.json')));
app.get('/public/achievements', (_req, res) => void res.json(fixture('achievements.json')));
app.get('/public/partners', (_req, res) => void res.json(fixture('partners.json')));
app.get('/public/publications', (_req, res) => void res.json(fixture('publications.json')));
app.get('/public/resources', (_req, res) => void res.json(fixture('resources.json')));

app.get('/public/content/:pageKey', (req, res) => {
  const blocks = (fixture('public-content.json') as Record<string, unknown>)[req.params.pageKey] ?? {};
  res.json(blocks);
});

app.get('/public/initiatives', (_req, res) => void res.json(fixture('initiatives.json')));

app.get('/public/events', (_req, res) => void res.json(fixture('events.json')));
app.get('/public/events/:slug', (_req, res) => void res.json(fixture('event-detail.json')));
app.get('/public/calendar.ics', (_req, res) => void res.type('text/calendar').send('BEGIN:VCALENDAR\nEND:VCALENDAR'));

app.post('/public/enquiries', (_req, res) => void res.json({ received: true, routedTo: 'District Secretariat' }));

app.post('/files/grants', (_req, res) => void res.status(201).json({ grantId: 'grant_e2e', uploadUrl: `http://localhost:${PORT}/mock-provider` }));
app.patch('/files/grants/:grantId', (req, res) =>
  void res.json({ id: 'file_e2e', tier: 'dynamic', key: (req.body as { providerKey?: string }).providerKey ?? 'k', url: null, name: 'photo.jpg', mimeType: 'image/jpeg', size: 1024 }),
);
app.put('/mock-provider', (_req, res) => void res.sendStatus(204));

app.use((_req, res) => void res.status(404).json({ statusCode: 404, error: 'NotFound' }));

app.listen(PORT, () => console.log(`mock-api listening on ${PORT}`));
