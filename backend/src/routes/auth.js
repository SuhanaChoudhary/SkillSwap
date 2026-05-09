import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { body } from 'express-validator';
import { User } from '../models/User.js';
import { authRequired, signToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  skillsOffered: u.skillsOffered,
  skillsWanted: u.skillsWanted,
});

router.post(
  '/register',
  body('name').isString().trim().isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 6 }),
  validate,
  async (req, res) => {
    const { name, email, password, skillsOffered = [], skillsWanted = [] } = req.body;
    if (await User.findOne({ email })) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const user = await User.create({
      name,
      email,
      passwordHash: bcrypt.hashSync(password, 10),
      role: 'user',
      skillsOffered,
      skillsWanted,
    });
    const token = signToken(user);
    res.status(201).json({ token, user: publicUser(user) });
  }
);

router.post(
  '/login',
  body('email').isEmail().normalizeEmail(),
  body('password').isString().notEmpty(),
  validate,
  async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  }
);

router.get('/me', authRequired, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.put(
  '/me',
  authRequired,
  body('name').optional().isString().trim().isLength({ min: 2 }),
  body('skillsOffered').optional().isArray(),
  body('skillsWanted').optional().isArray(),
  validate,
  async (req, res) => {
    const { name, skillsOffered, skillsWanted } = req.body;
    if (name !== undefined) req.user.name = name;
    if (skillsOffered !== undefined) req.user.skillsOffered = skillsOffered;
    if (skillsWanted !== undefined) req.user.skillsWanted = skillsWanted;
    await req.user.save();
    res.json({ user: publicUser(req.user) });
  }
);

export default router;
