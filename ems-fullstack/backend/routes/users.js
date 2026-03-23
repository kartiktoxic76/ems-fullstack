// backend/routes/users.js
const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAllUsers, getUser, updateUser, createUser, deleteUser, changePassword
} = require('../controllers/userController');

router.use(protect);
router.get('/',               authorize('hr','admin','ceo','manager'), getAllUsers);
router.post('/',              authorize('hr','admin'), createUser);
router.put('/change-password', changePassword);
router.get('/:id',            getUser);
router.put('/:id',            updateUser);
router.delete('/:id',         authorize('hr','admin'), deleteUser);
module.exports = router;
