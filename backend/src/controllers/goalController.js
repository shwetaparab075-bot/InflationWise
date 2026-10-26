const FinancialGoal = require('../models/FinancialGoal');
const Saving = require('../models/Saving');
const asyncHandler = require('../middleware/asyncHandler');
const { calculateGoal, targetDateFromYears, yearsFromTargetDate } = require('../utils/calculations');

const CATEGORIES = ['Education', 'Medical', 'House', 'Vehicle', 'Retirement', 'Emergency Fund', 'Marriage', 'Travel', 'Business', 'Other'];

const buildPayload = (body, existing = {}) => {
  const goalName = String(body.goalName ?? existing.goalName ?? '').trim();
  const goalCategory = body.goalCategory ?? existing.goalCategory;
  const currentCost = Number(body.currentCost ?? existing.currentCost);
  const inflationRate = Number(body.inflationRate ?? existing.inflationRate);
  const currentGoalSavings = Number(body.currentGoalSavings ?? existing.currentGoalSavings ?? 0);
  const notes = String(body.notes ?? existing.notes ?? '').slice(0, 1000);
  let years = body.years !== undefined && body.years !== '' ? Number(body.years) : existing.years;
  let targetDate = null;
  if (body.targetDate) {
    if (typeof body.targetDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.targetDate.trim())) {
      const [y, m, d] = body.targetDate.trim().split('-').map(Number);
      targetDate = new Date(y, m - 1, d);
    } else {
      targetDate = new Date(body.targetDate);
    }
  }

  if (body.targetDate && !body.years) years = yearsFromTargetDate(body.targetDate);
  if (!targetDate || Number.isNaN(targetDate.getTime())) targetDate = targetDateFromYears(years);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  if (targetDate && targetDate.getTime() < todayStart.getTime()) {
    return { error: 'Target date cannot be in the past.' };
  }

  const expectedRaw = body.expectedReturn ?? existing.expectedReturn;
  const expectedReturn = expectedRaw === '' || expectedRaw === undefined || expectedRaw === null
    ? null
    : Number(expectedRaw);

  if (!goalName) return { error: 'Goal name is required.' };
  if (!CATEGORIES.includes(goalCategory)) return { error: 'Select a valid goal category.' };
  if (!Number.isFinite(currentCost) || currentCost < 0) return { error: 'Enter a valid current cost.' };
  if (!Number.isFinite(years) || years < 1 || years > 80) return { error: 'Enter target years between 1 and 80.' };
  if (!Number.isFinite(inflationRate) || inflationRate < 0 || inflationRate > 30) {
    return { error: 'Enter an inflation rate between 0 and 30.' };
  }
  if (!Number.isFinite(currentGoalSavings) || currentGoalSavings < 0) {
    return { error: 'Enter a valid current savings amount.' };
  }
  if (expectedReturn !== null && (!Number.isFinite(expectedReturn) || expectedReturn < 0 || expectedReturn > 30)) {
    return { error: 'Expected return must be between 0 and 30 percent.' };
  }

  const calc = calculateGoal({
    currentCost,
    inflationRate,
    years,
    currentGoalSavings,
    expectedReturn,
  });

  return {
    goalName,
    goalCategory,
    currentCost,
    years,
    inflationRate,
    futureCost: calc.futureCost,
    currentGoalSavings,
    requiredMonthlySaving: calc.requiredMonthlySaving,
    estimatedMonthlyInvestment: calc.estimatedMonthlyInvestment,
    targetDate,
    expectedReturn,
    notes,
    calculation: calc,
  };
};

const withProgress = (goal, savings) => {
  const linkedItems = savings.filter((item) => String(item.linkedGoal) === String(goal._id));
  const linked = linkedItems.reduce((sum, item) => sum + item.amount, 0);
  const actualMonthly = linkedItems.reduce((sum, item) => sum + item.monthlyContribution, 0);
  const savedAmount = goal.currentGoalSavings + linked;
  const months = Math.max(1, Math.round(goal.years * 12));
  const requiredMonthlySaving = Math.round(Math.max(0, goal.futureCost - savedAmount) / months);
  const progress = goal.futureCost > 0 ? Math.min(100, (savedAmount / goal.futureCost) * 100) : 0;
  return {
    ...goal.toObject(),
    linkedSavings: linked,
    savedAmount,
    actualMonthlySaving: actualMonthly,
    requiredMonthlySaving,
    remainingAmount: Math.max(0, goal.futureCost - savedAmount),
    monthsRemaining: months,
    progress,
  };
};

const getGoals = asyncHandler(async (req, res) => {
  const [goals, savings] = await Promise.all([
    FinancialGoal.find({ userId: req.user._id }).sort({ createdAt: -1 }),
    Saving.find({ userId: req.user._id }),
  ]);
  res.json({ success: true, data: goals.map((goal) => withProgress(goal, savings)) });
});

const getGoal = asyncHandler(async (req, res) => {
  const goal = await FinancialGoal.findOne({ _id: req.params.id, userId: req.user._id });
  if (!goal) return res.status(404).json({ success: false, message: 'Goal not found.' });
  const savings = await Saving.find({ userId: req.user._id, linkedGoal: goal._id });
  res.json({ success: true, data: withProgress(goal, savings) });
});

const createGoal = asyncHandler(async (req, res) => {
  const data = buildPayload(req.body);
  if (data.error) return res.status(400).json({ success: false, message: data.error });
  const { calculation, ...payload } = data;
  const goal = await FinancialGoal.create({ ...payload, userId: req.user._id });
  res.status(201).json({
    success: true,
    message: 'Goal created successfully.',
    data: { ...goal.toObject(), ...calculation, savedAmount: goal.currentGoalSavings, progress: 0, actualMonthlySaving: 0 },
  });
});

const updateGoal = asyncHandler(async (req, res) => {
  const goal = await FinancialGoal.findOne({ _id: req.params.id, userId: req.user._id });
  if (!goal) return res.status(404).json({ success: false, message: 'Goal not found.' });
  const data = buildPayload(req.body, goal.toObject());
  if (data.error) return res.status(400).json({ success: false, message: data.error });
  const { calculation, ...payload } = data;
  Object.assign(goal, payload);
  await goal.save();
  const savings = await Saving.find({ userId: req.user._id, linkedGoal: goal._id });
  res.json({ success: true, message: 'Goal updated successfully.', data: withProgress(goal, savings), calculation });
});

const deleteGoal = asyncHandler(async (req, res) => {
  const goal = await FinancialGoal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!goal) return res.status(404).json({ success: false, message: 'Goal not found.' });
  await Saving.updateMany({ userId: req.user._id, linkedGoal: goal._id }, { linkedGoal: null });
  res.json({ success: true, message: 'Goal deleted successfully.' });
});

const previewGoal = asyncHandler(async (req, res) => {
  const data = buildPayload(req.body);
  if (data.error) return res.status(400).json({ success: false, message: data.error });
  res.json({ success: true, data: data.calculation, goal: data });
});

module.exports = { getGoals, getGoal, createGoal, updateGoal, deleteGoal, previewGoal };
