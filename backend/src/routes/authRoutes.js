const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const auth = require('../controllers/authController');
const rateLimiter = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/logout', protect, auth.logout);
router.post('/forgot-password', rateLimiter, auth.forgotPassword);
router.get('/profile', protect, auth.getProfile);
router.put('/profile', protect, auth.updateProfile);
router.put('/password', protect, auth.changePassword);

router.post('/reset-password', auth.resetPassword);
module.exports = router;
