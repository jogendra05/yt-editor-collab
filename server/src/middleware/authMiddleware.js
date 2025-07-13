function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  const [, token] = auth.split(' ');
  if (!token) return res.sendStatus(401);
  try {
    const { sub } = verifyAccessToken(token);
    req.userId = sub;
    next();
  } catch {
    res.sendStatus(403);
  }
}

export default authMiddleware;