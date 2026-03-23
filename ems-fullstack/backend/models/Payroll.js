// backend/models/Payroll.js
const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month:          { type: String, required: true },   // 'YYYY-MM'
  monthLabel:     { type: String },
  basic:          { type: Number, default: 0 },
  hra:            { type: Number, default: 0 },
  transport:      { type: Number, default: 0 },
  bonus:          { type: Number, default: 0 },
  gross:          { type: Number, default: 0 },
  tds:            { type: Number, default: 0 },
  pf:             { type: Number, default: 0 },
  profTax:        { type: Number, default: 0 },
  totalDeductions:{ type: Number, default: 0 },
  netPay:         { type: Number, default: 0 },
  status:         { type: String, enum: ['pending','paid'], default: 'pending' },
  paidOn:         { type: Date, default: null },
}, { timestamps: true });

payrollSchema.index({ userId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
