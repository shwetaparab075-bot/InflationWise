const Notification = require('../models/Notification');
const Expense = require('../models/Expense');
const FinancialProfile = require('../models/FinancialProfile');
const FinancialGoal = require('../models/FinancialGoal');
const PlannedBudget = require('../models/PlannedBudget');

const upsertCondition = async (userId, key, payload) => {
  const existing = await Notification.findOne({ userId, link: key });
  if (existing) return existing;
  return Notification.create({ ...payload, userId, link: key });
};

const syncNotifications = async (userId) => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const start = new Date(year, month - 1, 1);

  const [profile, expenses, goals, budgets] = await Promise.all([
    FinancialProfile.findOne({ userId }),
    Expense.find({ userId, date: { $gte: start, $lte: now } }),
    FinancialGoal.find({ userId }),
    PlannedBudget.find({ userId, month, year }),
  ]);

  if (!profile) {
    await upsertCondition(userId, 'profile-incomplete', {
      title: 'Financial profile incomplete',
      message: 'Complete your financial profile to unlock dashboard insights.',
      type: 'info',
    });
  }

  const actualByCat = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  for (const budget of budgets) {
    const actual = actualByCat[budget.category] || 0;
    if (budget.plannedAmount > 0 && actual > budget.plannedAmount) {
      await upsertCondition(userId, `budget-${year}-${month}-${budget.category}`, {
        title: 'Budget exceeded',
        message: `${budget.category} spending is over the planned budget this month.`,
        type: 'warning',
      });
    }
  }

  const soon = new Date();
  soon.setDate(soon.getDate() + 30);

  for (const goal of goals) {
    const pct = goal.targetAmount > 0 ? Math.round((goal.currentSaved / goal.targetAmount) * 100) : 0;
    if (pct >= 50 && pct < 100) {
      await upsertCondition(userId, `goal-milestone-${goal._id}-50`, {
        title: 'Goal milestone reached',
        message: `${goal.goalName} is ${pct}% complete.`,
        type: 'success',
      });
    }
    if (pct >= 100) {
      await upsertCondition(userId, `goal-milestone-${goal._id}-100`, {
        title: 'Goal completed',
        message: `${goal.goalName} has reached its target amount.`,
        type: 'success',
      });
    }
    if (goal.status === 'Active' && goal.targetDate && new Date(goal.targetDate) <= soon) {
      await upsertCondition(userId, `goal-due-${goal._id}`, {
        title: 'Goal target date approaching',
        message: `${goal.goalName} is due by ${new Date(goal.targetDate).toLocaleDateString('en-IN')}.`,
        type: 'warning',
      });
    }
  }
};

const getNotifications = async (req, res, next) => {
  try {
    await syncNotifications(req.user.id);
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(40);
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    res.json({ success: true, unreadCount, notifications });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }
    res.json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user.id }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
