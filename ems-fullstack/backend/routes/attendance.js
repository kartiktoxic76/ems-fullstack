// backend/routes/attendance.js
const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/attendanceController');
router.use(protect);
router.get('/today',   c.getToday);
router.get('/my',      c.getMy);
router.get('/team',    authorize('manager','hr','admin'), c.getTeam);
router.post('/checkin', c.checkIn);
router.post('/manual',  authorize('hr','admin'), c.manualMark);
module.exports = router;
