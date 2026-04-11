import crypto from 'crypto';

if (process.env.RAILWAY_ENVIRONMENT && !process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

/**
 * Railway/Vercel: JWT_SECRET is optional if MONGODB_URI (or DATABASE_URL) is set —
 * we derive a stable secret from the DB URL so login works without an extra variable.
 */
if (!process.env.JWT_SECRET?.trim()) {
  const uri = (process.env.MONGODB_URI || process.env.DATABASE_URL || '').trim();
  if (uri && process.env.NODE_ENV === 'production') {
    process.env.JWT_SECRET = crypto.createHash('sha256').update(`popscore_jwt_v1|${uri}`).digest('hex');
  } else if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'dev_secret';
  }
}
