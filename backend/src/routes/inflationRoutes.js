const express = require('express');
const router = express.Router();
const {
  getRates,
  calculateInflation,
  predictFutureExpenses,
} = require('../controllers/inflationController');

router.get('/rates', getRates);
router.post('/calculate', calculateInflation);
router.post('/predict', predictFutureExpenses);

module.exports = router;
