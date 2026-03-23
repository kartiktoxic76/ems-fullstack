// backend/models/LeaveBalance.js
const mongoose = require('mongoose');

const balanceTypeSchema = new mongoose.Schema({
  total: { type: Number, default: 0 },
  used:  { type: Number, default: 0 },
}, { _id: false });

const leaveBalanceSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  casual:  { type: balanceTypeSchema, default: () => ({ total: 12, used: 0 }) },
  sick:    { type: balanceTypeSchema, default: () => ({ total: 10, used: 0 }) },
  annual:  { type: balanceTypeSchema, default: () => ({ total: 21, used: 0 }) },
  unpaid:  { type: balanceTypeSchema, default: () => ({ total: 999, used: 0 }) },
}, { timestamps: true });

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);
