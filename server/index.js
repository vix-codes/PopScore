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
const distPath = path.join(__dirname, '../client/dist');
const serveClient = process.env.NODE_ENV === 'production' && fs.existsSync(distPath);

const app = express();
const PORT = Number(process.env.PORT) || 5000;

const defaultOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const fromEnv = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...defaultOrigins, ...fromEnv])];

function corsOrigin(origin, cb) {
  if (!origin) return cb(null, true);
  if (allowedOrigins.includes(origin)) return cb(null, true);
  if (process.env.NODE_ENV === 'production') {
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

app.get('/api/health', (_, res) => res.json({ ok: true }));

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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`PopScore listening on port ${PORT}${serveClient ? ' (API + client)' : ' (API only)'}`);
});
