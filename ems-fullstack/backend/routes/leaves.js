// backend/routes/leaves.js
const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/leaveController');
router.use(protect);
router.get('/my',           c.getMyLeaves);
router.get('/balance',      c.getBalance);
router.get('/pending',      authorize('manager','hr','admin'), c.getPending);
router.get('/all',          authorize('hr','admin','ceo'), c.getAllLeaves);
router.post('/apply',       c.applyLeave);
router.put('/:id/approve',  authorize('manager','hr','admin'), c.approveLeave);
router.put('/:id/reject',   authorize('manager','hr','admin'), c.rejectLeave);
router.delete('/:id',       c.cancelLeave);
module.exports = router;
