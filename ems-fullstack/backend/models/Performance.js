// backend/models/Performance.js
const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  title:    String,
  progress: { type: Number, default: 0 },
  status:   { type: String, enum: ['not-started','in-progress','done'], default: 'not-started' },
}, { _id: false });

const performanceSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  period:         { type: String },        // e.g. 'Q4-2025'
  codeQuality:    { type: Number, min: 0, max: 5, default: 0 },
  teamwork:       { type: Number, min: 0, max: 5, default: 0 },
  onTime:         { type: Number, min: 0, max: 5, default: 0 },
  communication:  { type: Number, min: 0, max: 5, default: 0 },
  initiative:     { type: Number, min: 0, max: 5, default: 0 },
  overallRating:  { type: Number, min: 0, max: 5, default: 0 },
  goals:          { type: [goalSchema], default: [] },
  achievements:   { type: String, default: '' },
  improvements:   { type: String, default: '' },
  feedback:       { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Performance', performanceSchema);

// ─────────────────────────────────────────────────────────────
// AuditLog
// ─────────────────────────────────────────────────────────────
const auditSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  action:   { type: String, required: true },
  result:   { type: String, default: 'OK' },
  ip:       { type: String, default: '' },
  details:  { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

mongoose.model('AuditLog', auditSchema);
