const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  register, login, verifyEmail, forgotPassword,
  resetPassword, getMe, updateMe, changePassword
} = require('../controllers/authController');

router.post('/register',              register);
router.post('/login',                 login);
router.get('/verify-email/:token',    verifyEmail);
router.post('/forgot-password',       forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me',                     protect, getMe);
router.put('/me',                     protect, updateMe);
router.patch('/me/password',          protect, changePassword);

module.exports = router;
