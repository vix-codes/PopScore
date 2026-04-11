import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const signToken = (user) =>
  jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: '7d' }
  );

function toUserPayload(user) {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
    favorites: (user.favorites || []).map((x) => x.toString()),
  };
}

export async function register(req, res) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password required' });
    }
    const em = String(email).toLowerCase().trim();
    const un = String(username).trim();
    const exists = await User.findOne({ $or: [{ email: em }, { username: un }] });
    if (exists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username: un, email: em, password: hashed, role: 'user' });
    const token = signToken(user);
    res.status(201).json({
      token,
      user: toUserPayload(user),
    });
  } catch (e) {
    res.status(500).json({ message: e.message || 'Server error' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    const em = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: em });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = signToken(user);
    res.json({
      token,
      user: toUserPayload(user),
    });
  } catch (e) {
    res.status(500).json({ message: e.message || 'Server error' });
  }
}
