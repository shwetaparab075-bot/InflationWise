const FinancialProfile = require('../models/FinancialProfile');
const FinancialGoal = require('../models/FinancialGoal');
const SavingPlan = require('../models/SavingPlan');

const EDUCATIONAL_OPTIONS = [
  {
    title: 'Savings Account',
    category: 'Savings Account',
    description: 'Example planning option for emergency liquidity. Returns vary by bank and are not guaranteed.',
    possibleAllocation: 'Short-term cash buffer',
  },
  {
    title: 'Fixed Deposit',
    category: 'Fixed Deposit',
    description: 'Example planning option for capital preservation over a fixed tenure. Actual rates change with the bank.',
    possibleAllocation: 'Near-term goals',
  },
  {
    title: 'Recurring Deposit',
    category: 'Recurring Deposit',
    description: 'Possible allocation for disciplined monthly deposits. This is for educational planning purposes only.',
    possibleAllocation: 'Monthly surplus',
  },
  {
    title: 'Public Provident Fund (PPF)',
    category: 'PPF',
    description: 'Example long-horizon government-backed option. Eligibility, lock-in, and notified rates apply.',
    possibleAllocation: 'Long-term goals',
  },
  {
    title: 'Mutual Fund (illustrative)',
    category: 'Mutual Fund',
    description: 'Possible allocation for long-term goals. Market-linked products can lose value. Not a recommendation.',
    possibleAllocation: 'Long-term growth goals',
  },
];

const getSavingPlan = async (req, res, next) => {
  try {
    const [profile, goals, savedPlan] = await Promise.all([
      FinancialProfile.findOne({ userId: req.user.id }),
      FinancialGoal.find({ userId: req.user.id, status: { $ne: 'Paused' } }),
      SavingPlan.findOne({ userId: req.user.id }),
    ]);

    const monthlyIncome = profile ? (profile.monthlyIncome || 0) + (profile.additionalIncome || 0) : 0;
    const monthlyExpenses = profile
      ? (profile.fixedExpenses || 0) + (profile.variableExpenses || 0) + (profile.existingEMI || 0)
      : 0;
    const availableMonthlySavings = monthlyIncome - monthlyExpenses;
    const targetSavings = profile?.monthlySavingsTarget || 0;

    const activeGoals = goals.filter((g) => g.status !== 'Completed');
    let requiredMonthlySaving = 0;
    const goalPlans = activeGoals.map((g) => {
      const remaining = Math.max(0, g.targetAmount - (g.currentSaved || 0));
      const monthsLeft = Math.max(
        1,
        Math.ceil((new Date(g.targetDate) - new Date()) / (1000 * 60 * 60 * 24 * 30))
      );
      const monthlyRequired = remaining / monthsLeft;
      requiredMonthlySaving += monthlyRequired;
      const estimatedMonths =
        availableMonthlySavings > 0 ? Math.ceil(remaining / (availableMonthlySavings / Math.max(activeGoals.length, 1))) : null;
      return {
        goalId: g._id,
        goalName: g.goalName,
        remaining,
        monthsLeft,
        monthlyRequired: Math.round(monthlyRequired),
        estimatedDurationMonths: estimatedMonths,
      };
    });

    const savingGap = Math.max(0, requiredMonthlySaving - Math.max(availableMonthlySavings, 0));

    res.json({
      success: true,
      hasProfile: Boolean(profile),
      availableMonthlySavings: Math.round(availableMonthlySavings),
      targetSavings,
      requiredMonthlySaving: Math.round(requiredMonthlySaving),
      savingGap: Math.round(savingGap),
      goalPlans,
      educationalOptions: EDUCATIONAL_OPTIONS,
      savedPlan,
      disclaimer:
        'These figures are calculated from your saved income, expenses, and goals. Planning options are for educational purposes only and are not guaranteed recommendations or assured returns.',
    });
  } catch (error) {
    next(error);
  }
};

const saveSavingPlan = async (req, res, next) => {
  try {
    const plan = await SavingPlan.findOneAndUpdate(
      { userId: req.user.id },
      {
        $set: {
          notes: req.body.notes || '',
          preferredOptions: Array.isArray(req.body.preferredOptions) ? req.body.preferredOptions : [],
        },
      },
      { new: true, upsert: true }
    );
    res.json({ success: true, savedPlan: plan });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSavingPlan, saveSavingPlan };
