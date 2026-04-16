const jwt = require('jsonwebtoken');

function signToken(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not set');
  return jwt.sign(payload, secret, { expiresIn: '1h' });
}

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'missing token' });
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not set');
    const decoded = jwt.verify(token, secret);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'invalid token' });
  }
}

module.exports = { signToken, requireAdmin };
