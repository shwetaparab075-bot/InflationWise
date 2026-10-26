const FinancialDetails = require('../models/FinancialDetails');
const Expense = require('../models/Expense');
const FinancialGoal = require('../models/FinancialGoal');
const Saving = require('../models/Saving');
const asyncHandler = require('../middleware/asyncHandler');

const monthKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const monthLabel = (key) => {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleString('en-IN', { month: 'short', year: 'numeric' });
};

const lastMonths = (count, yearFilter) => {
  const keys = [];
  if (yearFilter) {
    for (let month = 1; month <= 12; month += 1) {
      keys.push(`${yearFilter}-${String(month).padStart(2, '0')}`);
    }
    return keys;
  }
  const cursor = new Date();
  cursor.setDate(1);
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(cursor.getFullYear(), cursor.getMonth() - i, 1);
    keys.push(monthKey(date));
  }
  return keys;
};

const statusFor = (planned, actual) => {
  if (actual > planned) return 'Ahead of Target';
  if (actual < planned) return 'Behind Target';
  return 'On Track';
};

const getReports = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const now = new Date();
  const year = req.query.year ? Number(req.query.year) : null;
  const month = req.query.month ? Number(req.query.month) : null;
  const goalId = req.query.goalId || '';
  const category = req.query.category || '';

  const [financial, expenses, goals, savings] = await Promise.all([
    FinancialDetails.findOne({ userId }),
    Expense.find({ userId }),
    FinancialGoal.find({ userId }).sort({ createdAt: -1 }),
    Saving.find({ userId }),
  ]);

  const profile = financial || {
    monthlyIncome: 0,
    monthlyExpenses: 0,
    currentSavings: 0,
    monthlySavings: 0,
    additionalIncome: 0,
  };

  const cardYear = year || now.getFullYear();
  const cardMonth = month || now.getMonth() + 1;
  const filteredExpenses = expenses.filter((item) => {
    const d = new Date(item.createdAt);
    if (category && item.category !== category) return false;
    return d.getFullYear() === cardYear && d.getMonth() + 1 === cardMonth;
  });

  const recordedExpenses = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
  const hasAnyExpenses = expenses.length > 0;
  const monthlyExpenses = hasAnyExpenses ? recordedExpenses : profile.monthlyExpenses;
  const monthlySavings = savings.length
    ? savings.reduce((sum, item) => sum + item.monthlyContribution, 0)
    : profile.monthlySavings;
  const monthlyIncome = (profile.monthlyIncome || 0) + (profile.additionalIncome || 0);
  const availableBalance = monthlyIncome - monthlyExpenses - monthlySavings;

  const spendingKeys = lastMonths(6, year);
  const monthlySpending = spendingKeys.map((key) => {
    const amount = expenses
      .filter((item) => monthKey(item.createdAt) === key && (!category || item.category === category))
      .reduce((sum, item) => sum + item.amount, 0);
    return { key, month: monthLabel(key), amount };
  });

  const categoryMap = {};
  filteredExpenses.forEach((item) => {
    categoryMap[item.category] = (categoryMap[item.category] || 0) + item.amount;
  });
  const expenseCategories = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const savingsGrowth = spendingKeys.map((key) => {
    const [y, m] = key.split('-').map(Number);
    const monthEnd = new Date(y, m, 0);
    const amount = savings.reduce((sum, item) => {
      const start = new Date(item.startDate);
      if (start > monthEnd) return sum;
      const months = (monthEnd.getFullYear() - start.getFullYear()) * 12 + (monthEnd.getMonth() - start.getMonth());
      return sum + item.amount + item.monthlyContribution * Math.max(0, months);
    }, 0);
    return { key, month: monthLabel(key), amount };
  });

  const selectedGoals = goalId ? goals.filter((goal) => String(goal._id) === String(goalId)) : goals;
  const goalProgress = selectedGoals.map((goal) => {
    const linked = savings.filter((item) => String(item.linkedGoal) === String(goal._id));
    const linkedAmount = linked.reduce((sum, item) => sum + item.amount, 0);
    const actual = linked.reduce((sum, item) => sum + item.monthlyContribution, 0);
    const saved = goal.currentGoalSavings + linkedAmount;
    const progress = goal.futureCost > 0 ? Math.min(100, (saved / goal.futureCost) * 100) : 0;
    const months = Math.max(1, Math.round(goal.years * 12));
    const planned = Math.round(Math.max(0, goal.futureCost - saved) / months);
    const difference = planned - actual;
    return {
      id: goal._id,
      goalName: goal.goalName,
      goalCategory: goal.goalCategory,
      currentCost: goal.currentCost,
      futureCost: goal.futureCost,
      inflationRate: goal.inflationRate,
      years: goal.years,
      targetDate: goal.targetDate,
      currentGoalSavings: goal.currentGoalSavings,
      saved,
      planned,
      actual,
      difference,
      status: statusFor(planned, actual),
      progress,
      inflationIncrease: Math.max(0, goal.futureCost - goal.currentCost),
    };
  });

  const highest = expenseCategories[0] || null;
  const dailyTotal = filteredExpenses.filter((item) => item.expenseType === 'Daily').reduce((sum, item) => sum + item.amount, 0);
  const monthlyTypeTotal = filteredExpenses.filter((item) => item.expenseType === 'Monthly').reduce((sum, item) => sum + item.amount, 0);

  const alerts = [];
  if (!financial) alerts.push({ type: 'info', text: 'Add your financial details to personalize the dashboard.' });
  goalProgress.forEach((goal) => {
    if (goal.status === 'Behind Target') {
      alerts.push({ type: 'warning', text: `${goal.goalName} is behind the monthly saving target.` });
    }
  });
  if (monthlyIncome > 0 && monthlyExpenses > monthlyIncome) {
    alerts.push({ type: 'warning', text: 'Expenses are higher than income this period.' });
  }
  if (!alerts.length) alerts.push({ type: 'success', text: 'Your plan is ready. Keep tracking savings against each goal.' });

  res.json({
    success: true,
    data: {
      cards: {
        monthlyIncome,
        monthlyExpenses,
        monthlySavings,
        availableBalance,
        currentSavings: profile.currentSavings || 0,
      },
      profile,
      incomeVsExpenses: [{ name: 'Monthly', income: monthlyIncome, expenses: monthlyExpenses }],
      monthlySpending,
      expenseCategories,
      savingsGrowth,
      goalProgress,
      plannedVsActual: goalProgress.map((goal) => ({
        name: goal.goalName,
        planned: goal.planned,
        actual: goal.actual,
      })),
      inflationImpact: goalProgress.map((goal) => ({
        name: goal.goalName,
        current: goal.currentCost,
        future: goal.futureCost,
        increase: goal.inflationIncrease,
      })),
      expenseStats: { dailyTotal, monthlyTypeTotal, highestCategory: highest },
      alerts,
    },
  });
});

module.exports = { getReports };
