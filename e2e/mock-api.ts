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
app.post('/public/visits', (_req, res) => void res.status(201).json({ counted: true }));

app.post('/files/grants', (_req, res) => void res.status(201).json({ grantId: 'grant_e2e', uploadUrl: `http://localhost:${PORT}/mock-provider` }));
app.patch('/files/grants/:grantId', (req, res) =>
  void res.json({ id: 'file_e2e', tier: 'dynamic', key: (req.body as { providerKey?: string }).providerKey ?? 'k', url: null, name: 'photo.jpg', mimeType: 'image/jpeg', size: 1024 }),
);
app.put('/mock-provider', (_req, res) => void res.sendStatus(204));

app.use((_req, res) => void res.status(404).json({ statusCode: 404, error: 'NotFound' }));

app.listen(PORT, () => console.log(`mock-api listening on ${PORT}`));
