const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getPlannedVsActual,
  savePlannedBudget,
  saveAllBudgets,
} = require('../controllers/expenseController');

router.use(protect);
router.get('/', getPlannedVsActual);
router.post('/', saveAllBudgets);
router.post('/item', savePlannedBudget);

module.exports = router;
