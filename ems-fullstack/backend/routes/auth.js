// backend/routes/auth.js
const router = require('express').Router();
const { login, signup, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
router.post('/login',  login);
router.post('/signup', signup);
router.get('/me',      protect, getMe);
router.post('/logout', protect, logout);
module.exports = router;
