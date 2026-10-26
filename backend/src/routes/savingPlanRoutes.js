const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getSavingPlan, saveSavingPlan } = require('../controllers/savingPlanController');

router.use(protect);
router.get('/', getSavingPlan);
router.put('/', saveSavingPlan);

module.exports = router;
