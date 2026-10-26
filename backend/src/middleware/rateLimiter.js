const rateLimiter = (() => {
  const store = {};
  const WINDOW_MS = 5 * 60 * 1000; // 5 minutes
  const MAX_REQUESTS = 5; // per window per IP

  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress;
    const now = Date.now();
    if (!store[ip] || now - store[ip].first > WINDOW_MS) {
      store[ip] = { count: 1, first: now };
    } else {
      store[ip].count += 1;
    }
    if (store[ip].count > MAX_REQUESTS) {
      return res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
    }
    next();
  };
})();

module.exports = rateLimiter;
