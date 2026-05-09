import { Router } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Listing } from '../models/Listing.js';
import { Request as SwapRequest } from '../models/Request.js';
import { authRequired, adminRequired } from '../middleware/auth.js';

const router = Router();
router.use(authRequired, adminRequired);

router.get('/users', async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({
    items: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      skillsOffered: u.skillsOffered,
      skillsWanted: u.skillsWanted,
      createdAt: u.createdAt,
    })),
  });
});

router.delete('/users/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Not found' });
  const u = await User.findById(req.params.id);
  if (!u) return res.status(404).json({ error: 'Not found' });
  if (u.role === 'admin') return res.status(400).json({ error: "Can't delete an admin" });

  await Listing.deleteMany({ ownerId: u._id });
  await SwapRequest.deleteMany({
    $or: [{ requesterId: u._id }, { receiverId: u._id }],
  });
  await u.deleteOne();
  res.json({ ok: true });
});

router.get('/stats', async (_req, res) => {
  const [users, listings, requests, pending] = await Promise.all([
    User.countDocuments(),
    Listing.countDocuments(),
    SwapRequest.countDocuments(),
    SwapRequest.countDocuments({ status: 'pending' }),
  ]);
  res.json({ users, listings, requests, pending });
});

export default router;
