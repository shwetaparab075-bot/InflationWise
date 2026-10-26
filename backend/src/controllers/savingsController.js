const SavingsPlan = require('../models/SavingsPlan');
const { syncBankAccounts } = require('../services/bankService');
const { generateRecommendations } = require('../services/recommendationService');
const { getDBMode } = require('../config/database');

const planDefinitions = [
  {
    type: 'Cash Savings',
    name: 'Cash Savings / Physical Emergency Fund',
    liquidity: 'Instant (100% Liquid)',
    expectedAPY: '0.5% - 1.5%',
    riskProfile: 'Zero Nominal Risk, High Inflation Decay',
    description: 'Keep liquid cash in emergency physical reserves or standard checking for immediate access within 24 hours.'
  },
  {
    type: 'Bank Savings',
    name: 'High-Yield Bank Savings Account',
    liquidity: 'High (1-2 Days)',
    expectedAPY: '4.5% - 5.2%',
    riskProfile: 'FDIC Insured up to $250k',
    description: 'Deposit funds into high-yielding bank accounts providing risk-free returns near current short-term benchmark rates.'
  },
  {
    type: 'Investment',
    name: 'Inflation-Protected Multi-Asset Portfolio',
    liquidity: 'Moderate (3-5 Days)',
    expectedAPY: '8.5% - 12.0%',
    riskProfile: 'Market Risk, High Long-Term Real Growth',
    description: 'Invest across broad equities, index funds, REITs, and TIPS to outpace inflation and compound wealth over multi-year horizons.'
  }
];

// @desc Get Savings Plans & Recommendation
// @route GET /api/savings
const getSavingsPlans = async (req, res, next) => {
  try {
    // Generate recommendation engine output based on financial metrics
    const recommendation = generateRecommendations({
      monthlyIncome: 8500,
      currentSavings: 24000,
      monthlyExpenses: 4400,
      actualExpenses: 4615,
      inflationRate: 6.0
    });

    return res.json({
      success: true,
      plans: planDefinitions,
      recommendedPlan: recommendation.recommendedPlan,
      recommendationDetails: recommendation.insights.find(i => i.type === 'PLAN_RECOMMENDATION'),
      disclaimer: recommendation.disclaimer
    });
  } catch (error) {
    next(error);
  }
};

// @desc Connect Bank Account (Mock API Integration)
// @route POST /api/savings/connect-bank
const connectBankAccount = async (req, res, next) => {
  try {
    const syncData = await syncBankAccounts(req.user ? req.user.id : 'demo_user');
    return res.json({
      success: true,
      message: 'Bank account connected via Open Banking Aggregator API',
      connectionStatus: 'CONNECTED',
      accountDetails: syncData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSavingsPlans,
  connectBankAccount
};
