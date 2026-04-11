import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { seedDatabase } from './seedDatabase.js';

async function run() {
  await connectDB();
  await seedDatabase({ forceWipe: true });
  console.log('--- ADMIN --- admin@popscore.com / admin123');
  console.log('--- Demo --- demo@popscore.com / demo123 (+ others, password demo123)');
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
