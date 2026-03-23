// backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const LeaveBalance = require('../models/LeaveBalance');
const { addAudit } = require('../middleware/auth');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password required' });

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    await addAudit(null, 'LOGIN', 'FAIL', { email }, req.ip);
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  if (!user.isActive)
    return res.status(403).json({ success: false, message: 'Account deactivated' });

  await addAudit(user._id, 'LOGIN', 'OK', {}, req.ip);
  const token = signToken(user._id);
  const u = user.toObject(); delete u.password;
  res.json({ success: true, token, user: u });
};

// POST /api/auth/signup
exports.signup = async (req, res) => {
  const { firstName, lastName, email, password, dept } = req.body;
  if (!firstName || !lastName || !email || !password || !dept)
    return res.status(400).json({ success: false, message: 'All fields required' });
  if (password.length < 6)
    return res.status(400).json({ success: false, message: 'Password must be 6+ chars' });

  if (await User.findOne({ email: email.toLowerCase() }))
    return res.status(409).json({ success: false, message: 'Email already registered' });

  const count = await User.countDocuments();
  const eid = 'EMP-' + String(count + 100).padStart(3, '0');
  const ini = (firstName[0] + lastName[0]).toUpperCase();

  const user = await User.create({
    name: `${firstName} ${lastName}`, email, password, dept, eid, ini,
    joinDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  });

  // Create default leave balance
  await LeaveBalance.create({ userId: user._id });
  await addAudit(user._id, 'SIGNUP', 'OK', {}, req.ip);

  const token = signToken(user._id);
  const u = user.toObject(); delete u.password;
  res.status(201).json({ success: true, token, user: u });
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// POST /api/auth/logout  (client just deletes token, but we log it)
exports.logout = async (req, res) => {
  await addAudit(req.user._id, 'LOGOUT', 'OK', {}, req.ip);
  res.json({ success: true, message: 'Logged out' });
};
