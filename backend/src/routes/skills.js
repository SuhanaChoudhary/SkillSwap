import { Router } from 'express';
import mongoose from 'mongoose';
import { body, query } from 'express-validator';
import { Listing } from '../models/Listing.js';
import { Request as SwapRequest } from '../models/Request.js';
import { authRequired } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const shape = (l) => {
  const j = l.toJSON();
  const owner =
    l.ownerId && typeof l.ownerId === 'object' && l.ownerId.name
      ? { id: l.ownerId.id, name: l.ownerId.name, email: l.ownerId.email }
      : null;
  return { ...j, owner };
};

router.get(
  '/',
  query('search').optional().isString(),
  query('category').optional().isString(),
  query('owner').optional().isString(),
  validate,
  async (req, res) => {
    const { search, category, owner } = req.query;
    const filter = {};
    if (category) filter.category = new RegExp(`^${category}$`, 'i');
    if (owner && mongoose.isValidObjectId(owner)) filter.ownerId = owner;
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ skillName: rx }, { description: rx }, { category: rx }];
    }
    const items = await Listing.find(filter)
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ items: items.map(shape) });
  }
);

router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Not found' });
  const item = await Listing.findById(req.params.id).populate('ownerId', 'name email');
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json({ item: shape(item) });
});

router.post(
  '/',
  authRequired,
  body('skillName').isString().trim().isLength({ min: 2 }),
  body('description').isString().trim().isLength({ min: 5 }),
  body('category').isString().trim().isLength({ min: 2 }),
  validate,
  async (req, res) => {
    const { skillName, description, category } = req.body;
    const item = await Listing.create({
      skillName,
      description,
      category,
      ownerId: req.user._id,
    });
    await item.populate('ownerId', 'name email');
    res.status(201).json({ item: shape(item) });
  }
);

router.put(
  '/:id',
  authRequired,
  body('skillName').optional().isString().trim().isLength({ min: 2 }),
  body('description').optional().isString().trim().isLength({ min: 5 }),
  body('category').optional().isString().trim().isLength({ min: 2 }),
  validate,
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Not found' });
    const item = await Listing.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (item.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    for (const key of ['skillName', 'description', 'category']) {
      if (req.body[key] !== undefined) item[key] = req.body[key];
    }
    await item.save();
    await item.populate('ownerId', 'name email');
    res.json({ item: shape(item) });
  }
);

router.delete('/:id', authRequired, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Not found' });
  const item = await Listing.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  if (item.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  await item.deleteOne();
  await SwapRequest.deleteMany({ listingId: item._id });
  res.json({ ok: true });
});

export default router;
