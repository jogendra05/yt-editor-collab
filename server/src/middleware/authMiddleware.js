import { verifyAccessToken } from '../utils/jwt.js';
import { User } from '../models/schema.js';

async function authMiddleware(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const [, token] = auth.split(' ');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { sub } = verifyAccessToken(token);
    const user = await User.findById(sub);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.userId = sub;
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
}

export default authMiddleware;