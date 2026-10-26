const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const goals = require('../controllers/goalController');

const router = express.Router();
router.use(protect);
router.post('/preview', goals.previewGoal);
router.route('/').get(goals.getGoals).post(goals.createGoal);
router.route('/:id').get(goals.getGoal).put(goals.updateGoal).delete(goals.deleteGoal);

module.exports = router;
