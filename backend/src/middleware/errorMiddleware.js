const errorHandler = (err, _req, res, _next) => {
  console.error('[InflationWise]', err.message);
  if (err.code === 11000) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
  }
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((item) => item.message).join(' ');
    return res.status(400).json({ success: false, message });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid record id.' });
  }
  const status = err.statusCode || 500;
  return res.status(status).json({
    success: false,
    message: status === 500 ? 'Something went wrong. Please try again.' : err.message,
  });
};

module.exports = { errorHandler };
