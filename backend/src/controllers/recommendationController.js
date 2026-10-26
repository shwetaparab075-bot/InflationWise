const Recommendation = require('../models/Recommendation');
const FinancialProfile = require('../models/FinancialProfile');

// @desc Get Savings / Investment Recommendations
// @route GET /api/recommendations
const getRecommendations = async (req, res, next) => {
  try {
    const recommendations = await Recommendation.find({ status: 'Active' });
    let profile = null;
    if (req.user) {
      profile = await FinancialProfile.findOne({ userId: req.user.id });
    }

    const monthlyIncome = profile ? profile.monthlyIncome + profile.additionalIncome : 85000;
    const monthlyExpenses = profile ? profile.fixedExpenses + profile.variableExpenses + profile.existingEMI : 50000;
    const currentMonthlySaving = Math.max(0, monthlyIncome - monthlyExpenses);
    const targetSavings = profile ? profile.monthlySavingsTarget : 35000;
    const savingsGap = Math.max(0, targetSavings - currentMonthlySaving);

    res.json({
      success: true,
      currentMonthlySaving,
      targetSavings,
      savingsGap,
      disclaimer: 'Example planning option / Possible allocation based on user profile. Not guaranteed financial advice.',
      recommendations,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRecommendations };
