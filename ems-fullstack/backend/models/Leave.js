// backend/models/Leave.js
const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:         { type: String, enum: ['casual','sick','annual','unpaid'], required: true },
  from:         { type: String, required: true },
  to:           { type: String, required: true },
  days:         { type: Number, required: true },
  reason:       { type: String, required: true },
  status:       { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  approvedById: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  approvedAt:   { type: Date, default: null },
  remark:       { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);
