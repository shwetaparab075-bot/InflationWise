const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getMe, updateProfile, updateSettings, changePassword } = require('../controllers/authController');

router.use(protect);
router.get('/me', getMe);
router.put('/profile', updateProfile);
router.put('/settings', updateSettings);
router.put('/password', changePassword);

module.exports = router;
