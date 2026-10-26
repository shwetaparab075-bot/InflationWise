const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const crypto = require('crypto');
const PasswordResetToken = require('../models/PasswordResetToken');
const { sendEmail, sendPasswordResetEmail } = require('../utils/email');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeMobile = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
};

const passwordError = (password) => {
  if (!password || password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter.';
  if (!/\d/.test(password)) return 'Password must contain a number.';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain a special character.';
  return '';
};

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  mobile: user.mobile,
  avatar: user.avatar || '',
  createdAt: user.createdAt,
});

const signToken = (id, remember) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: remember ? '30d' : '1d',
});

const register = asyncHandler(async (req, res) => {
  const name = String(req.body.name || req.body.fullName || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const mobile = normalizeMobile(req.body.mobile);
  const { password, confirmPassword } = req.body;

  if (!name) return res.status(400).json({ success: false, message: 'Full name is required.' });
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
  }
  if (!/^[6-9]\d{9}$/.test(mobile)) {
    return res.status(400).json({ success: false, message: 'Enter a valid 10-digit mobile number.' });
  }
  const pwError = passwordError(password);
  if (pwError) return res.status(400).json({ success: false, message: pwError });
  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Confirm password must match password.' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
  }

  const hashed = await bcrypt.hash(password, 12);
  const newUser = await User.create({ name, email, mobile, password: hashed });

  // Send welcome email asynchronously without blocking registration response
  sendEmail({
    to: newUser.email,
    subject: 'Welcome to InflationWise',
    html: `<p>Hello ${newUser.name},</p><p>Thank you for registering with InflationWise. Your account has been created successfully.</p>`,
  }).catch((emailErr) => {
    console.error('Welcome email failed:', emailErr.message);
  });

  return res.status(201).json({
    success: true,
    message: 'Account created successfully!',
  });
});

const login = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';
  const remember = Boolean(req.body.rememberMe);

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ success: false, message: 'Incorrect email or password.' });
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ success: false, message: 'Incorrect email or password.' });
  }
  if (user.role === 'admin') {
    return res.status(401).json({ success: false, message: 'Incorrect email or password.' });
  }
  if (user.isActive === false) {
    return res.status(403).json({ success: false, message: 'This account is inactive. Please contact the administrator.' });
  }

  const token = signToken(user._id, remember);
  return res.json({ success: true, token, user: publicUser(user) });
});

const logout = asyncHandler(async (_req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
});

const updateProfile = asyncHandler(async (req, res) => {
  const name = req.body.name !== undefined ? String(req.body.name).trim() : req.user.name;
  const mobile = req.body.mobile !== undefined ? normalizeMobile(req.body.mobile) : req.user.mobile;
  const avatar = req.body.avatar !== undefined ? String(req.body.avatar) : req.user.avatar;

  if (!name) return res.status(400).json({ success: false, message: 'Full name is required.' });
  if (!/^[6-9]\d{9}$/.test(mobile)) {
    return res.status(400).json({ success: false, message: 'Enter a valid 10-digit mobile number.' });
  }
  if (avatar && avatar.length > 700000) {
    return res.status(400).json({ success: false, message: 'Profile picture must be smaller than 500 KB.' });
  }

  req.user.name = name;
  req.user.mobile = mobile;
  req.user.avatar = avatar || '';
  await req.user.save();
  res.json({ success: true, message: 'Profile updated successfully.', user: publicUser(req.user) });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const pwError = passwordError(newPassword);
  if (pwError) return res.status(400).json({ success: false, message: pwError });
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Confirm password must match the new password.' });
  }

  const user = await User.findById(req.user._id).select('+password');
  const match = await bcrypt.compare(currentPassword || '', user.password);
  if (!match) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
  }
  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();
  res.json({ success: true, message: 'Password changed successfully.' });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
  }

  // Find user - do not reveal account existence to prevent user enumeration
  const user = await User.findOne({ email });
  const genericResponse = {
    success: true,
    message: 'If an account exists for this email, password-reset instructions will be sent.',
  };

  if (!user || user.role === 'admin' || user.isActive === false) {
    return res.json(genericResponse);
  }

  // Invalidate any older unused tokens for this user
  await PasswordResetToken.updateMany({ userId: user._id, used: false }, { used: true });

  // Generate cryptographically secure reset token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = await bcrypt.hash(rawToken, 10);
  const expirationMinutes = 20;

  await PasswordResetToken.create({
    userId: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + expirationMinutes * 60 * 1000),
    used: false,
  });

  const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
  const cleanBase = frontendUrl.replace(/\/$/, '');
  const resetUrl = `${cleanBase}/reset-password?token=${rawToken}&id=${user._id}`;

  try {
    const emailResult = await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
      expiresInMinutes: expirationMinutes,
    });
    if (emailResult && emailResult.simulated) {
      console.log(`[PASSWORD RESET LINK for ${user.email}]:\n  ➔ ${resetUrl}\n  (Note: Configure SMTP_HOST, SMTP_USER, SMTP_PASS in backend/.env to deliver to real inbox)`);
    }
  } catch (err) {
    console.error('[Forgot Password] Email delivery error:', err.message);
  }

  return res.json(genericResponse);
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, id, password, confirmPassword } = req.body;
  if (!token || !id) {
    return res.status(400).json({ success: false, message: 'Invalid or missing password reset link.' });
  }
  if (!password || !confirmPassword) {
    return res.status(400).json({ success: false, message: 'Password and confirmation are required.' });
  }
  const pwError = passwordError(password);
  if (pwError) return res.status(400).json({ success: false, message: pwError });
  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Confirm password must match password.' });
  }

  // Find the active, unused token
  const tokenDoc = await PasswordResetToken.findOne({ userId: id, used: false }).sort({ createdAt: -1 });
  if (!tokenDoc) {
    return res.status(400).json({ success: false, message: 'Invalid or expired password reset link.' });
  }
  if (Date.now() > new Date(tokenDoc.expiresAt).getTime()) {
    tokenDoc.used = true;
    await tokenDoc.save();
    return res.status(400).json({ success: false, message: 'Password reset link has expired. Please request a new one.' });
  }

  const isValid = await bcrypt.compare(token, tokenDoc.tokenHash);
  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Invalid password reset token.' });
  }

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  user.password = await bcrypt.hash(password, 12);
  await user.save();

  // Invalidate token so it cannot be reused
  tokenDoc.used = true;
  await tokenDoc.save();

  return res.json({ success: true, message: 'Password reset successfully! You can now log in with your new password.' });
});

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  publicUser,
};
