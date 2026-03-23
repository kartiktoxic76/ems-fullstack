// backend/controllers/attendanceController.js
const Attendance = require('../models/Attendance');
const { addAudit } = require('../middleware/auth');

const todayStr = () => new Date().toISOString().split('T')[0];
const nowStr   = () => new Date().toTimeString().slice(0, 5);

// GET /api/attendance/today
exports.getToday = async (req, res) => {
  const rec = await Attendance.findOne({ userId: req.user._id, date: todayStr() });
  res.json({ success: true, attendance: rec || null });
};

// GET /api/attendance/my?month=YYYY-MM
exports.getMy = async (req, res) => {
  const { month } = req.query;
  const filter = { userId: req.user._id };
  if (month) filter.date = { $regex: `^${month}` };
  const records = await Attendance.find(filter).sort({ date: -1 });
  res.json({ success: true, records });
};

// GET /api/attendance/team?month=YYYY-MM  — manager / hr
exports.getTeam = async (req, res) => {
  const { month, userId } = req.query;
  const filter = {};
  if (month) filter.date = { $regex: `^${month}` };
  if (userId) filter.userId = userId;
  const records = await Attendance.find(filter).populate('userId', 'name eid dept').sort({ date: -1 });
  res.json({ success: true, records });
};

// POST /api/attendance/checkin
exports.checkIn = async (req, res) => {
  const today = todayStr();
  let rec = await Attendance.findOne({ userId: req.user._id, date: today });

  if (rec?.checkIn && rec?.checkOut)
    return res.status(400).json({ success: false, message: 'Already checked in and out today' });

  if (rec?.checkIn && !rec?.checkOut) {
    // Check out
    const now = nowStr();
    const [h1, m1] = rec.checkIn.split(':').map(Number);
    const [h2, m2] = now.split(':').map(Number);
    const hrs = parseFloat(((h2 * 60 + m2 - h1 * 60 - m1) / 60).toFixed(2));
    rec.checkOut = now;
    rec.hoursWorked = Math.max(0, hrs);
    rec.status = 'present';
    await rec.save();
    await addAudit(req.user._id, 'CHECK_OUT', 'OK', { date: today, time: now }, req.ip);
    return res.json({ success: true, action: 'checkout', attendance: rec });
  }

  // Check in
  rec = await Attendance.findOneAndUpdate(
    { userId: req.user._id, date: today },
    { userId: req.user._id, date: today, checkIn: nowStr(), status: 'present', source: 'manual' },
    { upsert: true, new: true }
  );
  await addAudit(req.user._id, 'CHECK_IN', 'OK', { date: today }, req.ip);
  res.json({ success: true, action: 'checkin', attendance: rec });
};

// POST /api/attendance/manual  — HR/Admin marks attendance for someone
exports.manualMark = async (req, res) => {
  const { userId, date, status, checkIn, checkOut } = req.body;
  const rec = await Attendance.findOneAndUpdate(
    { userId, date },
    { userId, date, status, checkIn, checkOut, source: 'manual' },
    { upsert: true, new: true }
  );
  await addAudit(req.user._id, 'MANUAL_ATTENDANCE', 'OK', { userId, date, status }, req.ip);
  res.json({ success: true, attendance: rec });
};
