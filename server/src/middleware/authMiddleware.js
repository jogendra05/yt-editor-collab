import { verifyAccessToken, verifyRefreshToken } from '../utils/jwt.js';
import { User } from '../models/schema.js';
import { COOKIE_OPTIONS } from '../utils/cookie.js';

async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies.yt_refresh;
    if (!token) return res.status(401).send('Not authenticated');

    const { sub } = verifyRefreshToken(token);

    const user = await User.findById(sub);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.userId = sub;
    req.user   = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    // clear both cookies on failure
    return res
      .clearCookie('yt_access',  COOKIE_OPTIONS)
      .clearCookie('yt_refresh', COOKIE_OPTIONS)
      .status(403)
      .json({ error: 'Invalid or expired token' });
  }
}

export default authMiddleware;