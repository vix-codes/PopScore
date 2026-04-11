import mongoose from 'mongoose';

function resolveMongoUri() {
  const fromEnv =
    process.env.MONGODB_URI?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    process.env.MONGO_URI?.trim() ||
    '';
  if (fromEnv) return fromEnv;

  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    throw new Error(
      'Missing MongoDB URL: set MONGODB_URI (or DATABASE_URL) in your host environment to your Atlas/mongodb+srv connection string. Localhost is not available on Railway.'
    );
  }

  return 'mongodb://127.0.0.1:27017/popscore';
}

/**
 * Atlas copy-paste often looks like ...mongodb.net/?appName= with no DB name.
 * Mongoose would use "test" or look empty — we default to "popscore".
 * If the URI already has /dbname, we use that unless MONGODB_DB_NAME overrides.
 */
function parseDbFromUri(uri) {
  const base = uri.split('?')[0];
  const at = base.lastIndexOf('@');
  const from = at >= 0 ? at + 1 : base.indexOf('//') + 2;
  const pathStart = base.indexOf('/', from);
  if (pathStart < 0) return null;
  const afterSlash = base.slice(pathStart + 1);
  if (!afterSlash || afterSlash.startsWith('?')) return null;
  const segment = afterSlash.split('/')[0]?.trim();
  return segment || null;
}

function resolveDbName(uri) {
  const override = process.env.MONGODB_DB_NAME?.trim();
  if (override) return override;
  const fromUri = parseDbFromUri(uri);
  if (fromUri) return fromUri;
  return 'popscore';
}

export async function connectDB() {
  const uri = resolveMongoUri();
  const dbName = resolveDbName(uri);

  await mongoose.connect(uri, { dbName });
  console.log(`MongoDB connected (database: ${dbName})`);
}
