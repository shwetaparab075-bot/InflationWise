const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const savings = require('../controllers/savingController');

const router = express.Router();
router.use(protect);
router.route('/').get(savings.getSavings).post(savings.createSaving);
router.route('/:id').put(savings.updateSaving).delete(savings.deleteSaving);

module.exports = router;
