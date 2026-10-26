const express = require('express');
const { protectAdmin } = require('../middleware/adminMiddleware');
const admin = require('../controllers/adminController');

const router = express.Router();

router.post('/register', admin.register);
router.post('/login', admin.login);
router.post('/forgot-password', admin.forgotPassword);
router.post('/logout', protectAdmin, admin.logout);
router.get('/profile', protectAdmin, admin.getProfile);
router.put('/profile', protectAdmin, admin.updateProfile);
router.put('/password', protectAdmin, admin.updatePassword);
router.get('/overview', protectAdmin, admin.overview);
router.get('/users', protectAdmin, admin.users);
router.get('/users/:id', protectAdmin, admin.userDetails);
router.put('/users/:id/status', protectAdmin, admin.setUserStatus);
router.delete('/users/:id', protectAdmin, admin.deleteUser);
router.get('/financial', protectAdmin, admin.financial);
router.get('/expenses', protectAdmin, admin.expenses);
router.delete('/expenses/:id', protectAdmin, admin.deleteExpense);
router.get('/goals', protectAdmin, admin.goals);
router.get('/savings', protectAdmin, admin.savings);
router.get('/reports', protectAdmin, admin.reports);

module.exports = router;
