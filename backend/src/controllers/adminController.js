const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const FinancialDetails = require('../models/FinancialDetails');
const Expense = require('../models/Expense');
const FinancialGoal = require('../models/FinancialGoal');
const Saving = require('../models/Saving');
const asyncHandler = require('../middleware/asyncHandler');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const publicAdmin = (admin) => ({
  id: admin._id,
  name: admin.name,
  email: admin.email,
  avatar: admin.avatar || '',
  role: admin.role,
  createdAt: admin.createdAt,
});

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  mobile: user.mobile,
  role: user.role,
  isActive: user.isActive !== false,
  status: user.isActive === false ? 'Inactive' : 'Active',
  createdAt: user.createdAt,
});

const signToken = (id, remember) => jwt.sign(
  { id, role: 'admin' },
  process.env.JWT_SECRET,
  { expiresIn: remember ? '30d' : '1d' },
);

const goalView = (goal, savings) => {
  const linkedItems = savings.filter((item) => String(item.linkedGoal) === String(goal._id));
  const linked = linkedItems.reduce((sum, item) => sum + item.amount, 0);
  const savedAmount = goal.currentGoalSavings + linked;
  const months = Math.max(1, Math.round(goal.years * 12));
  const requiredMonthlySaving = Math.round(Math.max(0, goal.futureCost - savedAmount) / months);
  const progress = goal.futureCost > 0 ? Math.min(100, (savedAmount / goal.futureCost) * 100) : 0;
  return {
    id: goal._id,
    userId: goal.userId,
    goalName: goal.goalName,
    goalCategory: goal.goalCategory,
    currentCost: goal.currentCost,
    inflationRate: goal.inflationRate,
    years: goal.years,
    futureCost: goal.futureCost,
    currentGoalSavings: goal.currentGoalSavings,
    requiredMonthlySaving,
    savedAmount,
    progress,
    notes: goal.notes,
  };
};

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

const register = asyncHandler(async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const mobile = normalizeMobile(req.body.mobile);
  const { password, confirmPassword, accessCode } = req.body;
  const expectedCode = process.env.ADMIN_ACCESS_CODE || 'IW-ADMIN-2026';

  if (String(accessCode || '') !== expectedCode) {
    return res.status(403).json({ success: false, message: 'Invalid admin access code.' });
  }
  if (!name) return res.status(400).json({ success: false, message: 'Admin full name is required.' });
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
  await User.create({
    name,
    email,
    mobile,
    password: hashed,
    role: 'admin',
    isActive: true,
  });

  return res.status(201).json({ success: true, message: 'Admin account created successfully.' });
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

  const admin = await User.findOne({ email }).select('+password');
  if (!admin || admin.role !== 'admin') {
    return res.status(401).json({ success: false, message: 'Incorrect admin email or password.' });
  }
  const match = await bcrypt.compare(password, admin.password);
  if (!match) {
    return res.status(401).json({ success: false, message: 'Incorrect admin email or password.' });
  }
  if (admin.isActive === false) {
    return res.status(403).json({ success: false, message: 'This admin account is inactive.' });
  }

  return res.json({ success: true, token: signToken(admin._id, remember), admin: publicAdmin(admin) });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const { password, confirmPassword } = req.body;
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Confirm password must match password.' });
  }
  const admin = await User.findOne({ email, role: 'admin' }).select('+password');
  if (!admin) {
    return res.status(404).json({ success: false, message: 'No admin account found with that email.' });
  }
  admin.password = await bcrypt.hash(password, 12);
  await admin.save();
  res.json({ success: true, message: 'Password updated. Please login.' });
});

const logout = asyncHandler(async (_req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, admin: publicAdmin(req.admin) });
});

const updateProfile = asyncHandler(async (req, res) => {
  const name = String(req.body.name || '').trim();
  const avatar = req.body.avatar !== undefined ? String(req.body.avatar) : req.admin.avatar;
  if (!name) return res.status(400).json({ success: false, message: 'Name is required.' });
  if (avatar && avatar.length > 700000) {
    return res.status(400).json({ success: false, message: 'Profile picture must be smaller than 500 KB.' });
  }
  req.admin.name = name;
  req.admin.avatar = avatar || '';
  await req.admin.save();
  res.json({ success: true, message: 'Profile updated successfully.', admin: publicAdmin(req.admin) });
});

const updatePassword = asyncHandler(async (req, res) => {
  const currentPassword = req.body.currentPassword || '';
  const newPassword = req.body.newPassword || '';
  const confirmPassword = req.body.confirmPassword || '';
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current and new password are required.' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Confirm password must match the new password.' });
  }
  const admin = await User.findById(req.admin._id).select('+password');
  const match = await bcrypt.compare(currentPassword, admin.password);
  if (!match) return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
  admin.password = await bcrypt.hash(newPassword, 12);
  await admin.save();
  res.json({ success: true, message: 'Password updated successfully.' });
});

const overview = asyncHandler(async (_req, res) => {
  const users = await User.find({ role: 'user' });
  const [goals, expenses, savings] = await Promise.all([
    FinancialGoal.countDocuments(),
    Expense.countDocuments(),
    Saving.countDocuments(),
  ]);
  res.json({
    success: true,
    data: {
      totalUsers: users.length,
      activeUsers: users.filter((user) => user.isActive !== false).length,
      totalGoals: goals,
      totalExpenses: expenses,
      totalSavings: savings,
    },
  });
});

const users = asyncHandler(async (_req, res) => {
  const records = await User.find({ role: 'user' }).sort({ createdAt: -1 });
  res.json({ success: true, data: records.map(publicUser) });
});

const userDetails = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: 'user' });
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  const [financial, expenses, goals, savings] = await Promise.all([
    FinancialDetails.findOne({ userId: user._id }),
    Expense.find({ userId: user._id }).sort({ createdAt: -1 }),
    FinancialGoal.find({ userId: user._id }).sort({ createdAt: -1 }),
    Saving.find({ userId: user._id }).sort({ createdAt: -1 }),
  ]);
  const goalRows = goals.map((goal) => goalView(goal, savings));
  res.json({
    success: true,
    data: {
      user: publicUser(user),
      financial: financial ? {
        monthlyIncome: financial.monthlyIncome,
        monthlyExpenses: financial.monthlyExpenses,
        currentSavings: financial.currentSavings,
        monthlySavings: financial.monthlySavings,
        additionalIncome: financial.additionalIncome,
        notes: financial.notes,
      } : null,
      expenses: expenses.map((item) => ({
        id: item._id,
        expenseName: item.expenseName,
        amount: item.amount,
        category: item.category,
        expenseType: item.expenseType,
        notes: item.notes,
      })),
      goals: goalRows,
      savings: savings.map((item) => ({
        id: item._id,
        savingName: item.savingName,
        savingType: item.savingType,
        amount: item.amount,
        monthlyContribution: item.monthlyContribution,
        linkedGoal: goals.find((goal) => String(goal._id) === String(item.linkedGoal))?.goalName || '—',
      })),
    },
  });
});

const setUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: 'user' });
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  user.isActive = Boolean(req.body.isActive);
  await user.save();
  res.json({
    success: true,
    message: user.isActive ? 'User activated.' : 'User deactivated.',
    data: publicUser(user),
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: 'user' });
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  await Promise.all([
    FinancialDetails.deleteMany({ userId: user._id }),
    Expense.deleteMany({ userId: user._id }),
    FinancialGoal.deleteMany({ userId: user._id }),
    Saving.deleteMany({ userId: user._id }),
    user.deleteOne(),
  ]);
  res.json({ success: true, message: 'User deleted successfully.' });
});

const financial = asyncHandler(async (_req, res) => {
  const records = await FinancialDetails.find().populate('userId', 'name email role').sort({ createdAt: -1 });
  res.json({
    success: true,
    data: records
      .filter((item) => item.userId && item.userId.role !== 'admin')
      .map((item) => ({
        id: item._id,
        userId: item.userId._id,
        userName: item.userId.name,
        email: item.userId.email,
        monthlyIncome: item.monthlyIncome,
        monthlyExpenses: item.monthlyExpenses,
        currentSavings: item.currentSavings,
        monthlySavings: item.monthlySavings,
        additionalIncome: item.additionalIncome,
        notes: item.notes,
      })),
  });
});

const expenses = asyncHandler(async (_req, res) => {
  const records = await Expense.find().populate('userId', 'name email').sort({ createdAt: -1 });
  res.json({
    success: true,
    data: records.map((item) => ({
      id: item._id,
      userId: item.userId?._id,
      userName: item.userId?.name || '—',
      expenseName: item.expenseName,
      amount: item.amount,
      category: item.category,
      expenseType: item.expenseType,
      notes: item.notes,
    })),
  });
});

const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findByIdAndDelete(req.params.id);
  if (!expense) return res.status(404).json({ success: false, message: 'Expense not found.' });
  res.json({ success: true, message: 'Expense deleted successfully.' });
});

const goals = asyncHandler(async (_req, res) => {
  const [records, savings] = await Promise.all([
    FinancialGoal.find().populate('userId', 'name email').sort({ createdAt: -1 }),
    Saving.find(),
  ]);
  res.json({
    success: true,
    data: records.map((goal) => ({
      ...goalView(goal, savings),
      userName: goal.userId?.name || '—',
      userId: goal.userId?._id || goal.userId,
    })),
  });
});

const savings = asyncHandler(async (_req, res) => {
  const records = await Saving.find().populate('userId', 'name email').populate('linkedGoal', 'goalName').sort({ createdAt: -1 });
  res.json({
    success: true,
    data: records.map((item) => ({
      id: item._id,
      userName: item.userId?.name || '—',
      savingName: item.savingName,
      savingType: item.savingType,
      amount: item.amount,
      monthlyContribution: item.monthlyContribution,
      linkedGoal: item.linkedGoal?.goalName || '—',
      notes: item.notes,
    })),
  });
});

const reports = asyncHandler(async (_req, res) => {
  const [users, expenses, goals, savings] = await Promise.all([
    User.find({ role: 'user' }).select('createdAt isActive'),
    Expense.find(),
    FinancialGoal.find(),
    Saving.find(),
  ]);

  const expenseCategories = {};
  expenses.forEach((item) => {
    expenseCategories[item.category] = (expenseCategories[item.category] || 0) + item.amount;
  });
  const goalCategories = {};
  goals.forEach((item) => {
    goalCategories[item.goalCategory] = (goalCategories[item.goalCategory] || 0) + 1;
  });

  const registrations = [];
  const cursor = new Date();
  cursor.setDate(1);
  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(cursor.getFullYear(), cursor.getMonth() - i, 1);
    const count = users.filter((user) => {
      const created = new Date(user.createdAt);
      return created.getFullYear() === date.getFullYear() && created.getMonth() === date.getMonth();
    }).length;
    registrations.push({
      month: date.toLocaleString('en-IN', { month: 'short', year: 'numeric' }),
      count,
    });
  }

  res.json({
    success: true,
    data: {
      totalUsers: users.length,
      activeUsers: users.filter((user) => user.isActive !== false).length,
      totalExpenses: expenses.length,
      totalGoals: goals.length,
      totalSavings: savings.length,
      expenseCategories: Object.entries(expenseCategories).map(([name, value]) => ({ name, value })),
      goalCategories: Object.entries(goalCategories).map(([name, value]) => ({ name, value })),
      registrations,
    },
  });
});

module.exports = {
  register,
  login,
  forgotPassword,
  logout,
  getProfile,
  updateProfile,
  updatePassword,
  overview,
  users,
  userDetails,
  setUserStatus,
  deleteUser,
  financial,
  expenses,
  deleteExpense,
  goals,
  savings,
  reports,
};
