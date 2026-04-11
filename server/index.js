import 'dotenv/config';
import './bootstrap-env.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import userRoutes from './routes/userRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveClientDist() {
  const candidates = [
    path.join(__dirname, '../client/dist'),
    path.join(process.cwd(), 'client/dist'),
    path.join(process.cwd(), 'dist'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(path.join(p, 'index.html'))) return p;
  }
  return null;
}

const distPath = resolveClientDist();
const isProdLike =
  process.env.NODE_ENV === 'production' || Boolean(process.env.RAILWAY_ENVIRONMENT);
const serveClient = Boolean(distPath && isProdLike);

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.set('trust proxy', 1);

const defaultOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const fromEnv = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...defaultOrigins, ...fromEnv])];

function corsOrigin(origin, cb) {
  if (!origin) return cb(null, true);
  if (allowedOrigins.includes(origin)) return cb(null, true);
  if (process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT) {
    try {
      const host = new URL(origin).hostname;
      if (
        host.endsWith('.railway.app') ||
        host.endsWith('.vercel.app') ||
        host === 'localhost' ||
        host === '127.0.0.1'
      ) {
        return cb(null, true);
      }
    } catch {
      /* ignore */
    }
  }
  return cb(null, false);
}

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (_, res) => res.json({ ok: true, client: serveClient }));

if (serveClient) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Server error' });
});

await connectDB();

try {
  const { seedDatabase } = await import('./seed/seedDatabase.js');
  const result = await seedDatabase({ forceWipe: false });
  if (!result.skipped) {
    console.log('PopScore: empty database — demo catalog and users were created automatically.');
  }
} catch (e) {
  console.error('PopScore auto-seed failed:', e.message);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PopScore listening on port ${PORT}${serveClient ? ' (API + client)' : ' (API only — no client/dist found)'}`);
  if (!serveClient && isProdLike) {
    console.warn('Warning: client/dist missing — check Railway build (client must be built to client/dist).');
  }
});
