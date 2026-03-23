// backend/routes/payroll.js
const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/payrollController');
router.use(protect);
router.get('/my',   c.getMyPayroll);
router.get('/all',  authorize('hr','admin','ceo'), c.getAllPayroll);
router.post('/run', authorize('hr','admin'), c.runPayroll);
router.put('/:id',  authorize('hr','admin'), c.updatePayroll);
module.exports = router;

// ────────────────────────────────────────────────────────────
// backend/routes/performance.js
// ────────────────────────────────────────────────────────────
// (save as separate file in production — combined here for brevity)
