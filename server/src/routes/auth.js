const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { signToken } = require('../auth');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, try again in 15 minutes' },
});

router.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }
  const adminUser = process.env.ADMIN_USER;
  const adminHash = process.env.ADMIN_PASS_HASH;
  if (!adminUser || !adminHash) {
    return res.status(500).json({ error: 'admin not configured' });
  }
  const match = await bcrypt.compare(password, adminHash);
  if (username !== adminUser || !match) {
    return res.status(401).json({ error: 'invalid credentials' });
  }
  const token = signToken({ sub: username, role: 'admin' });
  res.json({ token, username });
});

module.exports = router;
