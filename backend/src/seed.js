// Standalone seeder. Usage: `npm run seed`
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDb, seedIfEmpty } from './db.js';

(async () => {
  await connectDb();
  await seedIfEmpty();
  await mongoose.disconnect();
  console.log('✅ Done.');
})();
