// backend/controllers/leaveController.js
const Leave       = require('../models/Leave');
const LeaveBalance= require('../models/LeaveBalance');
const { addAudit }= require('../middleware/auth');

// GET /api/leaves/my
exports.getMyLeaves = async (req, res) => {
  const leaves = await Leave.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, leaves });
};

// GET /api/leaves/balance
exports.getBalance = async (req, res) => {
  let bal = await LeaveBalance.findOne({ userId: req.user._id });
  if (!bal) bal = await LeaveBalance.create({ userId: req.user._id });
  res.json({ success: true, balance: bal });
};

// GET /api/leaves/pending  — manager / hr
exports.getPending = async (req, res) => {
  const leaves = await Leave.find({ status: 'pending' })
    .populate('userId', 'name eid dept title')
    .sort({ createdAt: -1 });
  res.json({ success: true, leaves });
};

// GET /api/leaves/all  — hr / admin
exports.getAllLeaves = async (req, res) => {
  const { userId } = req.query;
  const filter = userId ? { userId } : {};
  const leaves = await Leave.find(filter)
    .populate('userId', 'name eid dept')
    .sort({ createdAt: -1 });
  res.json({ success: true, leaves });
};

// POST /api/leaves/apply
exports.applyLeave = async (req, res) => {
  const { type, from, to, reason } = req.body;
  if (!type || !from || !to || !reason)
    return res.status(400).json({ success: false, message: 'All fields required' });

  const d1 = new Date(from), d2 = new Date(to);
  if (d1 > d2) return res.status(400).json({ success: false, message: 'From must be before To' });
  const days = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;

  // Check balance
  if (type !== 'unpaid') {
    const bal = await LeaveBalance.findOne({ userId: req.user._id });
    const avail = bal ? (bal[type]?.total || 0) - (bal[type]?.used || 0) : 0;
    if (days > avail)
      return res.status(400).json({ success: false, message: `Insufficient ${type} leave. Available: ${avail} days` });
  }

  const leave = await Leave.create({ userId: req.user._id, type, from, to, days, reason });
  await addAudit(req.user._id, 'LEAVE_APPLIED', 'OK', { type, days }, req.ip);
  res.status(201).json({ success: true, leave });
};

// PUT /api/leaves/:id/approve  — manager / hr
exports.approveLeave = async (req, res) => {
  const { remark } = req.body;
  const leave = await Leave.findById(req.params.id);
  if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
  if (leave.status !== 'pending') return res.status(400).json({ success: false, message: 'Already processed' });

  leave.status = 'approved';
  leave.approvedById = req.user._id;
  leave.approvedAt = new Date();
  leave.remark = remark || 'Approved';
  await leave.save();

  // Deduct from balance
  if (leave.type !== 'unpaid') {
    await LeaveBalance.findOneAndUpdate(
      { userId: leave.userId },
      { $inc: { [`${leave.type}.used`]: leave.days } }
    );
  }
  await addAudit(req.user._id, 'LEAVE_APPROVED', 'OK', { leaveId: leave._id }, req.ip);
  res.json({ success: true, leave });
};

// PUT /api/leaves/:id/reject
exports.rejectLeave = async (req, res) => {
  const { remark } = req.body;
  const leave = await Leave.findById(req.params.id);
  if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
  leave.status = 'rejected';
  leave.approvedById = req.user._id;
  leave.approvedAt = new Date();
  leave.remark = remark || 'Rejected';
  await leave.save();
  await addAudit(req.user._id, 'LEAVE_REJECTED', 'OK', { leaveId: leave._id }, req.ip);
  res.json({ success: true, leave });
};

// DELETE /api/leaves/:id  — employee cancels own pending leave
exports.cancelLeave = async (req, res) => {
  const leave = await Leave.findOne({ _id: req.params.id, userId: req.user._id });
  if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
  if (leave.status !== 'pending') return res.status(400).json({ success: false, message: 'Cannot cancel processed leave' });
  await leave.deleteOne();
  await addAudit(req.user._id, 'LEAVE_CANCELLED', 'OK', {}, req.ip);
  res.json({ success: true, message: 'Leave cancelled' });
};
