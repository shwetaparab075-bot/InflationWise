const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { handleMessage } = require('../controllers/chatbotController');

const router = express.Router();

// Optional authentication middleware: if Authorization header is present, verify token
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return protect(req, res, next);
  }
  next();
};

router.post('/message', optionalAuth, handleMessage);

module.exports = router;
