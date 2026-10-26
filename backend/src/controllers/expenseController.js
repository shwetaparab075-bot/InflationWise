const Expense = require('../models/Expense');
const asyncHandler = require('../middleware/asyncHandler');

const CATEGORIES = [
  'Rent', 'Electricity', 'Groceries', 'Transport', 'Medical', 'Education',
  'Shopping', 'Entertainment', 'EMI', 'Mobile Recharge', 'Internet',
  'Insurance', 'Food', 'Other',
];
const TYPES = ['Daily', 'Monthly'];

const validate = (body) => {
  const expenseName = String(body.expenseName || '').trim();
  const amount = Number(body.amount);
  const category = body.category;
  const expenseType = body.expenseType;
  const notes = String(body.notes || '').slice(0, 500);

  if (!expenseName) return { error: 'Expense name is required.' };
  if (!Number.isFinite(amount) || amount < 0) return { error: 'Enter a valid amount.' };
  if (!CATEGORIES.includes(category)) return { error: 'Select a valid category.' };
  if (!TYPES.includes(expenseType)) return { error: 'Select daily or monthly expense type.' };

  return { expenseName, amount, category, expenseType, notes };
};

const getExpenses = asyncHandler(async (req, res) => {
  const query = { userId: req.user._id };
  if (req.query.category) query.category = req.query.category;
  if (req.query.expenseType) query.expenseType = req.query.expenseType;
  if (req.query.search) {
    const safe = String(req.query.search).slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.expenseName = { $regex: safe, $options: 'i' };
  }

  let expenses = await Expense.find(query).sort({ createdAt: -1 });
  if (req.query.month && req.query.year) {
    const month = Number(req.query.month);
    const year = Number(req.query.year);
    expenses = expenses.filter((item) => {
      const date = new Date(item.createdAt);
      return date.getMonth() + 1 === month && date.getFullYear() === year;
    });
  }

  res.json({ success: true, data: expenses });
});

const createExpense = asyncHandler(async (req, res) => {
  const data = validate(req.body);
  if (data.error) return res.status(400).json({ success: false, message: data.error });
  const expense = await Expense.create({ ...data, userId: req.user._id });
  res.status(201).json({ success: true, message: 'Expense added successfully.', data: expense });
});

const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
  if (!expense) return res.status(404).json({ success: false, message: 'Expense not found.' });
  const data = validate({ ...expense.toObject(), ...req.body });
  if (data.error) return res.status(400).json({ success: false, message: data.error });
  Object.assign(expense, data);
  await expense.save();
  res.json({ success: true, message: 'Expense updated successfully.', data: expense });
});

const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!expense) return res.status(404).json({ success: false, message: 'Expense not found.' });
  res.json({ success: true, message: 'Expense deleted successfully.' });
});

module.exports = { getExpenses, createExpense, updateExpense, deleteExpense };
