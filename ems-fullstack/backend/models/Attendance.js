// backend/models/Attendance.js
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:         { type: String, required: true },  // 'YYYY-MM-DD'
  checkIn:      { type: String, default: null },   // 'HH:MM'
  checkOut:     { type: String, default: null },
  hoursWorked:  { type: Number, default: 0 },
  status:       { type: String, enum: ['present','absent','leave','weekend','holiday','half-day'], default: 'absent' },
  source:       { type: String, default: 'manual' },
}, { timestamps: true });

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
