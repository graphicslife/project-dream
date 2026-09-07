function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  next();
}

function requireAdmin(req, res, next) {
  const role = req.session && req.session.user && req.session.user.role;
  if (role === 'admin' || role === 'super_admin') return next();
  return res.status(403).json({ error: 'Admin access required.' });
}

function requireSelfOrAdmin(req, res, next) {
  const sessionUser = req.session && req.session.user;
  if (!sessionUser) return res.status(401).json({ error: 'Authentication required.' });
  if (String(sessionUser.id) === String(req.params.id) || sessionUser.role === 'admin' || sessionUser.role === 'super_admin') {
    return next();
  }
  return res.status(403).json({ error: 'You may only access your own account.' });
}

module.exports = { requireAuth, requireAdmin, requireSelfOrAdmin };
