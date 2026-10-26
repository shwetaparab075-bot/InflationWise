const Saving = require('../models/Saving');
const FinancialGoal = require('../models/FinancialGoal');
const asyncHandler = require('../middleware/asyncHandler');

const TYPES = ['Cash Savings', 'Bank Savings', 'Recurring Deposit', 'Fixed Deposit', 'Emergency Savings', 'Other'];

const validate = async (body, userId) => {
  const savingName = String(body.savingName || '').trim();
  const savingType = body.savingType;
  const amount = Number(body.amount);
  const monthlyContribution = Number(body.monthlyContribution || 0);
  const startDate = body.startDate ? new Date(body.startDate) : null;
  const notes = String(body.notes || '').slice(0, 500);
  let linkedGoal = body.linkedGoal || null;

  if (!savingName) return { error: 'Savings name is required.' };
  if (!TYPES.includes(savingType)) return { error: 'Select a valid savings type.' };
  if (!Number.isFinite(amount) || amount < 0) return { error: 'Enter a valid current amount.' };
  if (!Number.isFinite(monthlyContribution) || monthlyContribution < 0) {
    return { error: 'Enter a valid monthly contribution.' };
  }
  if (!startDate || Number.isNaN(startDate.getTime())) return { error: 'Enter a valid start date.' };
  if (linkedGoal) {
    const goal = await FinancialGoal.findOne({ _id: linkedGoal, userId });
    if (!goal) return { error: 'Linked goal was not found.' };
  } else {
    linkedGoal = null;
  }

  return { savingName, savingType, amount, monthlyContribution, startDate, linkedGoal, notes };
};

const getSavings = asyncHandler(async (req, res) => {
  const data = await Saving.find({ userId: req.user._id }).populate('linkedGoal', 'goalName goalCategory').sort({ createdAt: -1 });
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  const monthly = data.reduce((sum, item) => sum + item.monthlyContribution, 0);
  res.json({ success: true, data, summary: { total, monthly } });
});

const createSaving = asyncHandler(async (req, res) => {
  const data = await validate(req.body, req.user._id);
  if (data.error) return res.status(400).json({ success: false, message: data.error });
  const saving = await Saving.create({ ...data, userId: req.user._id });
  res.status(201).json({ success: true, message: 'Savings record added successfully.', data: saving });
});

const updateSaving = asyncHandler(async (req, res) => {
  const saving = await Saving.findOne({ _id: req.params.id, userId: req.user._id });
  if (!saving) return res.status(404).json({ success: false, message: 'Savings record not found.' });
  const data = await validate(req.body, req.user._id);
  if (data.error) return res.status(400).json({ success: false, message: data.error });
  Object.assign(saving, data);
  await saving.save();
  res.json({ success: true, message: 'Savings record updated successfully.', data: saving });
});

const deleteSaving = asyncHandler(async (req, res) => {
  const saving = await Saving.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!saving) return res.status(404).json({ success: false, message: 'Savings record not found.' });
  res.json({ success: true, message: 'Savings record deleted successfully.' });
});

module.exports = { getSavings, createSaving, updateSaving, deleteSaving };
