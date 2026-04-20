const jwt = require('jsonwebtoken');
const User = require('../models/User');

// checks the bearer token and attaches user to req
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || user.isActive === false) {
      return res.status(401).json({ success: false, message: 'Account not active' });
    }

    req.user = user;
    next();
  } catch (err) {
    // token expired or tampered
    res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

// role-based access - pass allowed roles as args
// e.g. authorize('admin', 'hr')
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
  };
};

// logs user actions to audit collection
// non-fatal - if it fails we dont want to crash the main request
exports.addAudit = async (userId, action, result = 'OK', details = {}, ip = '') => {
  try {
    const AuditLog = require('mongoose').model('AuditLog');
    await AuditLog.create({ userId, action, result, ip, details });
  } catch {
    // silently skip - audit failure shouldnt break anything
  }
};