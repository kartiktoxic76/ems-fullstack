// backend/controllers/userController.js
const User = require('../models/User');
const { addAudit } = require('../middleware/auth');

// GET /api/users  — HR/Admin/CEO/Manager
exports.getAllUsers = async (req, res) => {
  const filter = { isActive: true };
  // Managers only see their team
  if (req.user.role === 'manager') filter.managerId = req.user._id;
  const users = await User.find(filter).select('-password');
  res.json({ success: true, users });
};

// GET /api/users/:id
exports.getUser = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user });
};

// PUT /api/users/:id  — update profile (self or admin)
exports.updateUser = async (req, res) => {
  const allowed = ['name','phone','address','bankAcc','photo','ini'];
  // HR/Admin can also change role, dept, salary, title
  if (['hr','admin'].includes(req.user.role)) {
    allowed.push('role','dept','salary','title','managerId','isActive');
  }
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  await addAudit(req.user._id, 'USER_UPDATED', 'OK', { targetId: req.params.id }, req.ip);
  res.json({ success: true, user });
};

// POST /api/users  — HR/Admin creates employee
exports.createUser = async (req, res) => {
  const { name, email, password, role, dept, title, salary, managerId } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'name, email, password required' });

  if (await User.findOne({ email: email.toLowerCase() }))
    return res.status(409).json({ success: false, message: 'Email already in use' });

  const count = await User.countDocuments();
  const ini = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const eid = (role || 'employee') === 'employee' ? 'EMP-' + String(count + 100).padStart(3, '0') : name.slice(0, 3).toUpperCase() + '-' + String(count).padStart(3, '0');

  const user = await User.create({ name, email, password, role: role || 'employee', dept, title, salary, managerId, ini, eid,
    joinDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) });

  const LeaveBalance = require('../models/LeaveBalance');
  await LeaveBalance.create({ userId: user._id });

  await addAudit(req.user._id, 'USER_CREATED', 'OK', { name }, req.ip);
  const u = user.toObject(); delete u.password;
  res.status(201).json({ success: true, user: u });
};

// DELETE /api/users/:id  — soft-delete
exports.deleteUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isActive: false });
  await addAudit(req.user._id, 'USER_DELETED', 'OK', { targetId: req.params.id }, req.ip);
  res.json({ success: true, message: 'User deactivated' });
};

// PUT /api/users/change-password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword)))
    return res.status(401).json({ success: false, message: 'Current password incorrect' });
  if (newPassword.length < 6)
    return res.status(400).json({ success: false, message: 'New password must be 6+ chars' });
  user.password = newPassword;
  await user.save();
  await addAudit(user._id, 'CHANGE_PASSWORD', 'OK', {}, req.ip);
  res.json({ success: true, message: 'Password changed' });
};
