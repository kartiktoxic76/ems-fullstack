// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, message: 'Not authenticated' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user || req.user.isActive === false) {
      return res.status(401).json({ success: false, message: 'Account not active' });
    }
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

// Role guard factory  e.g.  authorize('admin','hr')
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
};

// Helper — add audit entry
exports.addAudit = async (userId, action, result = 'OK', details = {}, ip = '') => {
  try {
    const AuditLog = require('mongoose').model('AuditLog');
    await AuditLog.create({ userId, action, result, ip, details });
  } catch { /* non-fatal */ }
};
