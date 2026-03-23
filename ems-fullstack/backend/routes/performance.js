// backend/routes/performance.js
const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/performanceController');
router.use(protect);
router.get('/my',  c.getMyPerf);
router.get('/all', authorize('manager','hr','admin','ceo'), c.getAllPerf);
router.post('/',   authorize('manager','hr','admin'), c.createReview);
router.put('/:id', authorize('manager','hr','admin'), c.updateReview);
module.exports = router;
