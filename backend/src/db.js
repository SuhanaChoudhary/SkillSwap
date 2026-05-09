import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { Listing } from './models/Listing.js';

export async function connectDb() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillswap';
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log(`🗄️  MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
}

export async function seedIfEmpty() {
  const adminEmail = 'admin@skillswap.dev';
  if (!(await User.findOne({ email: adminEmail }))) {
    await User.create({
      name: 'Admin',
      email: adminEmail,
      passwordHash: bcrypt.hashSync('admin123', 10),
      role: 'admin',
    });
    console.log('👑 Seeded admin: admin@skillswap.dev / admin123');
  }

  if ((await Listing.countDocuments()) > 0) return;

  const demoUsers = [
    { name: 'Alice', email: 'alice@demo.dev', password: 'password',
      skillsOffered: ['Python Programming', 'Data Science'], skillsWanted: ['Guitar'] },
    { name: 'Bob', email: 'bob@demo.dev', password: 'password',
      skillsOffered: ['Guitar Lessons', 'Music Theory'], skillsWanted: ['Python Programming'] },
    { name: 'Carla', email: 'carla@demo.dev', password: 'password',
      skillsOffered: ['Italian Cooking', 'Baking'], skillsWanted: ['French'] },
  ];

  const created = {};
  for (const u of demoUsers) {
    let user = await User.findOne({ email: u.email });
    if (!user) {
      user = await User.create({
        name: u.name,
        email: u.email,
        passwordHash: bcrypt.hashSync(u.password, 10),
        role: 'user',
        skillsOffered: u.skillsOffered,
        skillsWanted: u.skillsWanted,
      });
    }
    created[u.name] = user;
  }

  await Listing.insertMany([
    { skillName: 'Python Programming', description: 'Beginner to intermediate Python — scripting, OOP, automation.', category: 'Programming', ownerId: created.Alice._id },
    { skillName: 'Pandas & Data Analysis', description: 'Hands-on data wrangling with pandas + matplotlib.', category: 'Programming', ownerId: created.Alice._id },
    { skillName: 'Acoustic Guitar Lessons', description: 'Chords, strumming patterns, and your first 5 songs.', category: 'Music', ownerId: created.Bob._id },
    { skillName: 'Music Theory Basics', description: 'Scales, intervals, and reading sheet music.', category: 'Music', ownerId: created.Bob._id },
    { skillName: 'Italian Pasta from Scratch', description: 'Fresh pasta dough, sauces, and plating.', category: 'Cooking', ownerId: created.Carla._id },
    { skillName: 'Sourdough Baking', description: 'Starter care, shaping, and baking artisan loaves.', category: 'Cooking', ownerId: created.Carla._id },
  ]);
  console.log('🌱 Seeded demo users + listings');
}
