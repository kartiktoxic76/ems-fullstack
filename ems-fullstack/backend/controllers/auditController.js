// backend/controllers/auditController.js
const mongoose = require('mongoose');

// GET /api/audit  — admin only
exports.getAuditLogs = async (req, res) => {
  const AuditLog = mongoose.model('AuditLog');
  const logs = await AuditLog.find()
    .populate('userId', 'name eid role')
    .sort({ createdAt: -1 })
    .limit(200);
  res.json({ success: true, logs });
};
