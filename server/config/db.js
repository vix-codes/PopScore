import mongoose from 'mongoose';

function resolveMongoUri() {
  const fromEnv =
    process.env.MONGODB_URI?.trim() || process.env.DATABASE_URL?.trim() || '';
  if (fromEnv) return fromEnv;

  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    throw new Error(
      'Missing MongoDB URL: set MONGODB_URI (or DATABASE_URL) in your host environment to your Atlas/mongodb+srv connection string. Localhost is not available on Railway.'
    );
  }

  return 'mongodb://127.0.0.1:27017/popscore';
}

export async function connectDB() {
  const uri = resolveMongoUri();
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}
