const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getFinancial, saveFinancial } = require('../controllers/financialController');

const router = express.Router();
router.use(protect);
router.get('/', getFinancial);
router.post('/', saveFinancial);
router.put('/', saveFinancial);

module.exports = router;
