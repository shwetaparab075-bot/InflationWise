const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protectAdmin = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Please login as admin to continue.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Admin access only.' });
    }
    const admin = await User.findById(decoded.id);
    if (!admin || admin.role !== 'admin' || admin.isActive === false) {
      return res.status(401).json({ success: false, message: 'Admin session expired. Please login again.' });
    }
    req.admin = admin;
    return next();
  } catch (_error) {
    return res.status(401).json({ success: false, message: 'Admin session expired. Please login again.' });
  }
};

module.exports = { protectAdmin };
