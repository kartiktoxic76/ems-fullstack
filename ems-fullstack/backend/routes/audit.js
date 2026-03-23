// backend/routes/audit.js
const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { getAuditLogs } = require('../controllers/auditController');
router.use(protect);
router.get('/', authorize('admin'), getAuditLogs);
module.exports = router;
