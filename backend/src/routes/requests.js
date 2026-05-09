import { Router } from 'express';
import mongoose from 'mongoose';
import { body } from 'express-validator';
import { Request as SwapRequest } from '../models/Request.js';
import { Listing } from '../models/Listing.js';
import { authRequired } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const shape = (r) => {
  const j = r.toJSON();
  return {
    ...j,
    requester:
      r.requesterId && r.requesterId.name
        ? { id: r.requesterId.id, name: r.requesterId.name }
        : null,
    receiver:
      r.receiverId && r.receiverId.name
        ? { id: r.receiverId.id, name: r.receiverId.name }
        : null,
    listing:
      r.listingId && r.listingId.skillName
        ? { id: r.listingId.id, skillName: r.listingId.skillName, category: r.listingId.category }
        : null,
  };
};

const populated = (q) =>
  q
    .populate('requesterId', 'name')
    .populate('receiverId', 'name')
    .populate('listingId', 'skillName category');

router.get('/', authRequired, async (req, res) => {
  const all = await populated(
    SwapRequest.find({
      $or: [{ requesterId: req.user._id }, { receiverId: req.user._id }],
    }).sort({ createdAt: -1 })
  );
  const incoming = all
    .filter((r) => r.receiverId._id.toString() === req.user._id.toString())
    .map(shape);
  const outgoing = all
    .filter((r) => r.requesterId._id.toString() === req.user._id.toString())
    .map(shape);
  res.json({ incoming, outgoing });
});

router.post(
  '/',
  authRequired,
  body('listingId').isString().notEmpty(),
  body('offerSkill').isString().trim().isLength({ min: 2 }),
  body('message').optional().isString(),
  validate,
  async (req, res) => {
    const { listingId, offerSkill, message = '' } = req.body;
    if (!mongoose.isValidObjectId(listingId)) return res.status(404).json({ error: 'Listing not found' });

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.ownerId.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: "Can't request your own listing" });
    }

    const exists = await SwapRequest.findOne({
      listingId,
      requesterId: req.user._id,
      status: 'pending',
    });
    if (exists) return res.status(409).json({ error: 'Pending request already exists' });

    const r = await SwapRequest.create({
      requesterId: req.user._id,
      receiverId: listing.ownerId,
      listingId,
      offerSkill,
      message,
      status: 'pending',
    });
    const doc = await populated(SwapRequest.findById(r._id));
    res.status(201).json({ item: shape(doc) });
  }
);

router.patch(
  '/:id',
  authRequired,
  body('status').isIn(['approved', 'rejected', 'cancelled']),
  validate,
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Not found' });
    const r = await SwapRequest.findById(req.params.id);
    if (!r) return res.status(404).json({ error: 'Not found' });
    const { status } = req.body;
    if (status === 'cancelled') {
      if (r.requesterId.toString() !== req.user._id.toString())
        return res.status(403).json({ error: 'Forbidden' });
    } else {
      if (r.receiverId.toString() !== req.user._id.toString())
        return res.status(403).json({ error: 'Forbidden' });
    }
    if (r.status !== 'pending') {
      return res.status(400).json({ error: 'Already ' + r.status });
    }
    r.status = status;
    await r.save();
    const doc = await populated(SwapRequest.findById(r._id));
    res.json({ item: shape(doc) });
  }
);

export default router;
