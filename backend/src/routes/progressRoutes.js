const express = require('express');
const router = express.Router();
const { getPlannedVsActualComparison, getGoalProgressSummary, getDashboardMetrics } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.get('/planned-vs-actual', protect, getPlannedVsActualComparison);
router.get('/goals-summary', protect, getGoalProgressSummary);
router.get('/dashboard', protect, getDashboardMetrics);

module.exports = router;
