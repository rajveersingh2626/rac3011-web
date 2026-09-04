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

app.get('/zones', (_req, res) => void res.json(fixture('zones.json')));

const CLUB_DSE = { id: 'club_dse', name: 'Rotaract Club of Delhi South East', shortName: 'Delhi South East', zoneId: 'zone_agni' };

let reportsStore = fixture('reports.json') as Array<Record<string, unknown>>;
let schemaStore = [fixture('report-schema.json') as Record<string, unknown>];
let requestStore = fixture('report-requests.json') as Array<Record<string, unknown>>;

app.get('/reports', (req, res) => {
  const clubId = req.query['filter[clubId]'] as string | undefined;
  const status = req.query['filter[status]'] as string | undefined;
  const include = String(req.query.include ?? '');
  let items = reportsStore;
  if (clubId) items = items.filter((r) => r.clubId === clubId);
  if (status) items = items.filter((r) => r.status === status);
  const mapped = items.map((r) => ({
    ...r,
    ...(include.includes('club') ? { club: CLUB_DSE } : {}),
    ...(include.includes('queries') ? { queries: r.queries ?? [] } : {}),
  }));
  res.json({ items: mapped, total: mapped.length, page: 1, pageSize: mapped.length || 1 });
});

app.get('/reports/:id', (req, res) => {
  const r = reportsStore.find((x) => x.id === req.params.id);
  if (!r) {
    res.status(404).json({ statusCode: 404, error: 'NotFound' });
    return;
  }
  const include = String(req.query.include ?? '');
  res.json({ ...r, ...(include.includes('club') ? { club: CLUB_DSE } : {}), ...(include.includes('queries') ? { queries: r.queries ?? [] } : {}) });
});

app.post('/reports', (req, res) => {
  const body = req.body as { clubId: string; month: string };
  const created = {
    id: `rep_${reportsStore.length + 1}`,
    clubId: body.clubId,
    ryYear: 2026,
    month: `${body.month}-01`,
    schemaVersion: 4,
    status: 'draft',
    values: { activities: [] },
    notes: null,
    submittedById: null,
    submittedAt: null,
    filedOnTime: null,
    scoredAt: null,
  };
  reportsStore = [...reportsStore, created];
  res.status(201).json(created);
});

app.patch('/reports/:id', (req, res) => {
  const idx = reportsStore.findIndex((x) => x.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ statusCode: 404, error: 'NotFound' });
    return;
  }
  const body = req.body as { values?: unknown; notes?: string | null; status?: string };
  const updated = {
    ...reportsStore[idx],
    ...(body.values !== undefined ? { values: { ...(reportsStore[idx].values as object), ...(body.values as object) } } : {}),
    ...(body.notes !== undefined ? { notes: body.notes } : {}),
    ...(body.status === 'submitted' ? { status: 'submitted', submittedAt: new Date().toISOString(), submittedById: 'usr_e2e', filedOnTime: true } : {}),
  };
  reportsStore[idx] = updated;
  res.json(updated);
});

app.get('/reports/:id/assist', (_req, res) => void res.json({ summary: '', suggestions: [] }));

app.post('/reports/:id/queries', (req, res) => {
  const idx = reportsStore.findIndex((x) => x.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ statusCode: 404, error: 'NotFound' });
    return;
  }
  const question = (req.body as { question: string }).question;
  const queries = [...((reportsStore[idx].queries as unknown[]) ?? []), { id: `q${Date.now()}`, reportId: req.params.id, askedById: 'usr_officer', question, reply: null, repliedById: null, repliedAt: null, createdAt: new Date().toISOString() }];
  reportsStore[idx] = { ...reportsStore[idx], status: 'queried', queries };
  res.json({ ...reportsStore[idx], queries });
});

app.patch('/reports/:id/queries/:queryId', (req, res) => {
  const idx = reportsStore.findIndex((x) => x.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ statusCode: 404, error: 'NotFound' });
    return;
  }
  const reply = (req.body as { reply: string }).reply;
  const queries = ((reportsStore[idx].queries as Array<Record<string, unknown>>) ?? []).map((q) =>
    q.id === req.params.queryId ? { ...q, reply, repliedById: 'usr_e2e', repliedAt: new Date().toISOString() } : q,
  );
  reportsStore[idx] = { ...reportsStore[idx], status: 'submitted', queries };
  res.json({ ...reportsStore[idx], queries });
});

app.get('/report-schemas', (req, res) => {
  const includeFields = String(req.query.include ?? '').includes('fields');
  const version = req.query['filter[version]'] as string | undefined;
  let items = schemaStore;
  if (version) items = items.filter((s) => String(s.version) === version);
  res.json({ items: items.map((s) => (includeFields ? s : { id: s.id, version: s.version, status: s.status, publishedAt: s.publishedAt })) });
});

app.post('/report-schemas', (_req, res) => {
  const active = schemaStore.find((s) => s.status === 'active') ?? schemaStore[0];
  const nextVersion = Math.max(...schemaStore.map((s) => s.version as number)) + 1;
  const draft = { ...active, id: `sc${nextVersion}`, version: nextVersion, status: 'draft', publishedAt: null };
  schemaStore = [...schemaStore, draft];
  res.status(201).json(draft);
});

app.patch('/report-schemas/:version', (req, res) => {
  const idx = schemaStore.findIndex((s) => s.version === Number(req.params.version));
  if (idx === -1) {
    res.status(404).json({ statusCode: 404, error: 'NotFound' });
    return;
  }
  const body = req.body as { fields?: unknown[]; status?: string };
  if (body.fields) schemaStore[idx] = { ...schemaStore[idx], fields: body.fields };
  if (body.status === 'active') {
    schemaStore = schemaStore.map((s) => (s.status === 'active' ? { ...s, status: 'retired' } : s));
    schemaStore[idx] = { ...schemaStore[idx], status: 'active', publishedAt: new Date().toISOString() };
  }
  res.json(schemaStore[idx]);
});

app.get('/report-requests', (_req, res) => void res.json({ items: requestStore }));

app.get('/report-requests/:id', (req, res) => {
  const r = requestStore.find((x) => x.id === req.params.id);
  if (!r) {
    res.status(404).json({ statusCode: 404, error: 'NotFound' });
    return;
  }
  res.json(r);
});

app.post('/report-requests', (req, res) => {
  const created = { id: `req_${requestStore.length + 1}`, createdById: 'usr_e2e', ...(req.body as object) };
  requestStore = [...requestStore, created];
  res.status(201).json(created);
});

app.patch('/report-requests/:id', (req, res) => {
  const idx = requestStore.findIndex((x) => x.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ statusCode: 404, error: 'NotFound' });
    return;
  }
  requestStore[idx] = { ...requestStore[idx], ...(req.body as object) };
  res.json(requestStore[idx]);
});

app.delete('/report-requests/:id', (req, res) => {
  requestStore = requestStore.filter((x) => x.id !== req.params.id);
  res.json({ ok: true });
});

app.put('/report-requests/:id/responses/:clubId', (req, res) =>
  void res.json({ id: 'resp_e2e', requestId: req.params.id, clubId: req.params.clubId, answers: (req.body as { answers: unknown }).answers, submittedById: 'usr_e2e' }),
);

app.use((_req, res) => void res.status(404).json({ statusCode: 404, error: 'NotFound' }));

app.listen(PORT, () => console.log(`mock-api listening on ${PORT}`));
