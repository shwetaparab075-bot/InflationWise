const { generateRecommendations } = require('../services/recommendationService');
const { calculatePlannedVsActual, calculateFutureExpense } = require('../utils/calculations');

const sampleTransactions = [
  { id: 'tx_1', category: 'Housing', amount: 26000, type: 'expense', date: '2026-08-01', source: 'UPI Bank Sync' },
  { id: 'tx_2', category: 'Food', amount: 13500, type: 'expense', date: '2026-08-03', source: 'UPI Bank Sync' },
  { id: 'tx_3', category: 'Transportation', amount: 6500, type: 'expense', date: '2026-08-07', source: 'UPI Bank Sync' },
  { id: 'tx_4', category: 'Healthcare', amount: 3800, type: 'expense', date: '2026-08-10', source: 'UPI Bank Sync' },
  { id: 'tx_5', category: 'Shopping', amount: 5200, type: 'expense', date: '2026-08-12', source: 'UPI Bank Sync' },
  { id: 'tx_6', category: 'Entertainment', amount: 4200, type: 'expense', date: '2026-08-14', source: 'UPI Bank Sync' }
];

const getPlannedVsActualComparison = async (req, res, next) => {
  try {
    const plannedMonthlyTotal = 75000;
    const actualMonthlyTotal = 79800;
    const yearlyPlanned = plannedMonthlyTotal * 12;
    const yearlyActual = actualMonthlyTotal * 12;

    const monthlyComparison = calculatePlannedVsActual(plannedMonthlyTotal, actualMonthlyTotal);
    const yearlyComparison = calculatePlannedVsActual(yearlyPlanned, yearlyActual);

    const categoryBreakdown = [
      { category: 'Housing', planned: 25000, actual: 26000, diff: 1000, isOver: true },
      { category: 'Food', planned: 12000, actual: 13500, diff: 1500, isOver: true },
      { category: 'Transportation', planned: 6000, actual: 6500, diff: 500, isOver: true },
      { category: 'Healthcare', planned: 4000, actual: 3800, diff: -200, isOver: false },
      { category: 'Education', planned: 5000, actual: 5000, diff: 0, isOver: false },
      { category: 'Utilities', planned: 4500, actual: 4800, diff: 300, isOver: true },
      { category: 'Entertainment', planned: 3500, actual: 4200, diff: 700, isOver: true },
      { category: 'Insurance', planned: 4000, actual: 4000, diff: 0, isOver: false },
      { category: 'Shopping', planned: 4000, actual: 5200, diff: 1200, isOver: true },
      { category: 'Travel', planned: 3000, actual: 2500, diff: -500, isOver: false },
      { category: 'Personal Care', planned: 2000, actual: 2200, diff: 200, isOver: true },
      { category: 'Other', planned: 2000, actual: 1800, diff: -200, isOver: false }
    ];

    const alerts = [];
    if (monthlyComparison.isOverBudget) {
      alerts.push({
        id: 'alt_01',
        type: 'WARNING',
        message: `Over-spending Alert: Actual spending (₹${actualMonthlyTotal.toLocaleString('en-IN')}) exceeds planned budget (₹${plannedMonthlyTotal.toLocaleString('en-IN')}) by ₹${monthlyComparison.difference.toLocaleString('en-IN')}!`,
        impactCategory: 'Food & Shopping'
      });
    }

    return res.json({
      success: true,
      monthlyComparison,
      yearlyComparison,
      categoryBreakdown,
      recentTransactions: sampleTransactions,
      alerts
    });
  } catch (error) {
    next(error);
  }
};

const getGoalProgressSummary = async (req, res, next) => {
  try {
    const goals = [
      { goalName: 'Emergency Reserve Fund', targetAmount: 300000, currentAmount: 210000, targetYear: 2027, progressPct: 70 },
      { goalName: 'Dream Home Downpayment', targetAmount: 2500000, currentAmount: 850000, targetYear: 2031, progressPct: 34 },
      { goalName: 'Child Higher Education Fund', targetAmount: 1500000, currentAmount: 350000, targetYear: 2034, progressPct: 23.3 },
      { goalName: 'Retirement Wealth Corpus', targetAmount: 10000000, currentAmount: 1850000, targetYear: 2046, progressPct: 18.5 }
    ];

    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const overallProgressPct = Math.round((totalSaved / totalTarget) * 1000) / 10;
    const totalRemaining = totalTarget - totalSaved;

    return res.json({
      success: true,
      overallProgressPct,
      totalTarget,
      totalSaved,
      totalRemaining,
      goalsCount: goals.length,
      goals
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardMetrics = async (req, res, next) => {
  try {
    const monthlyIncome = 85000;
    const currentSavings = 250000;
    const plannedMonthlyExpense = 75000;
    const actualMonthlyExpense = 79800;
    const currentInflationRate = 6.0;
    const projectionYears = 10;

    const futureMonthlyExpense = calculateFutureExpense(plannedMonthlyExpense, currentInflationRate, projectionYears);

    const goals = [
      { _id: 'g1', goalName: 'Emergency Reserve Fund', targetAmount: 300000, currentAmount: 210000, targetYear: 2027, inflationAdjustedTarget: 318000, progressPercentage: 70, status: 'On Track' },
      { _id: 'g2', goalName: 'Dream Home Downpayment', targetAmount: 2500000, currentAmount: 850000, targetYear: 2031, inflationAdjustedTarget: 3345500, progressPercentage: 34, status: 'In Progress' },
      { _id: 'g3', goalName: 'Child Higher Education Fund', targetAmount: 1500000, currentAmount: 350000, targetYear: 2034, inflationAdjustedTarget: 2407000, progressPercentage: 23.3, status: 'Behind Schedule' },
      { _id: 'g4', goalName: 'Retirement Wealth Corpus', targetAmount: 10000000, currentAmount: 1850000, targetYear: 2046, inflationAdjustedTarget: 32071350, progressPercentage: 18.5, status: 'In Progress' }
    ];

    const totalGoalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalGoalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const overallGoalProgressPct = Math.round((totalGoalSaved / totalGoalTarget) * 1000) / 10;

    const recommendations = generateRecommendations({
      monthlyIncome,
      currentSavings,
      monthlyExpenses: plannedMonthlyExpense,
      actualExpenses: actualMonthlyExpense,
      goals,
      inflationRate: currentInflationRate
    });

    return res.json({
      success: true,
      topCards: {
        currentMonthlyExpense: plannedMonthlyExpense,
        estimatedFutureExpense: futureMonthlyExpense,
        currentInflationRate,
        overallGoalProgressPct
      },
      userOverview: {
        monthlyIncome,
        currentSavings,
        selectedPlan: 'Bank Savings'
      },
      expenseDistribution: [
        { name: 'Housing', amount: 25000, color: '#3B82F6' },
        { name: 'Food', amount: 12000, color: '#10B981' },
        { name: 'Transportation', amount: 6000, color: '#F59E0B' },
        { name: 'Healthcare', amount: 4000, color: '#EF4444' },
        { name: 'Utilities & Insurance', amount: 8500, color: '#8B5CF6' },
        { name: 'Entertainment & Shopping', amount: 7500, color: '#EC4899' },
        { name: 'Education & Other', amount: 12000, color: '#06B6D4' }
      ],
      plannedVsActual: {
        planned: plannedMonthlyExpense,
        actual: actualMonthlyExpense,
        difference: actualMonthlyExpense - plannedMonthlyExpense,
        isOverBudget: actualMonthlyExpense > plannedMonthlyExpense
      },
      financialGoals: goals,
      smartInsights: recommendations.insights,
      recommendedPlan: recommendations.recommendedPlan,
      disclaimer: recommendations.disclaimer
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlannedVsActualComparison,
  getGoalProgressSummary,
  getDashboardMetrics
};
