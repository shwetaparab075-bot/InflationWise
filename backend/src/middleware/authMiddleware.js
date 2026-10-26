const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Please login to continue.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === 'admin') {
      return res.status(401).json({ success: false, message: 'Please login to continue.' });
    }
    const user = await User.findById(decoded.id);
    if (!user || user.role === 'admin') {
      return res.status(401).json({ success: false, message: 'Account not found. Please login again.' });
    }
    if (user.isActive === false) {
      return res.status(401).json({ success: false, message: 'This account is inactive. Please contact the administrator.' });
    }
    req.user = user;
    return next();
  } catch (_error) {
    return res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
  }
};

module.exports = { protect };
