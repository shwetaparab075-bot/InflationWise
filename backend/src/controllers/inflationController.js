const InflationRate = require('../models/InflationRate');

// @desc Get inflation rates
// @route GET /api/inflation/rates
const getRates = async (req, res, next) => {
  try {
    const rates = await InflationRate.find().sort({ year: -1, category: 1 });
    res.json({ success: true, rates });
  } catch (error) {
    next(error);
  }
};

// @desc Calculate Inflation Compound Future Value
// @route POST /api/inflation/calculate
const calculateInflation = async (req, res, next) => {
  try {
    const { currentExpense, inflationRate, years } = req.body;

    const expense = Number(currentExpense) || 0;
    const rate = Number(inflationRate) || 5.5; // default 5.5%
    const numYears = Number(years) || 1;

    const rateDecimal = rate / 100;
    const futureCost = Math.round(expense * Math.pow(1 + rateDecimal, numYears));
    const increaseAmount = futureCost - expense;
    const percentageIncrease = expense > 0 ? Math.round((increaseAmount / expense) * 100) : 0;

    // Generate year-by-year trajectory
    const trajectory = [];
    for (let y = 0; y <= numYears; y++) {
      const yearCost = Math.round(expense * Math.pow(1 + rateDecimal, y));
      trajectory.push({
        year: `Year ${y}`,
        yearNumber: y,
        cost: yearCost,
        increase: yearCost - expense,
      });
    }

    res.json({
      success: true,
      currentCost: expense,
      inflationRate: rate,
      years: numYears,
      futureCost,
      increaseAmount,
      percentageIncrease,
      trajectory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Predict Category Future Expense
// @route POST /api/inflation/predict
const predictFutureExpenses = async (req, res, next) => {
  try {
    const { category, currentExpense, inflationRate, futureYear } = req.body;

    const expense = Number(currentExpense) || 0;
    const rate = Number(inflationRate) || 6.0;
    const currentYear = new Date().getFullYear();
    const targetYear = Number(futureYear) || (currentYear + 5);
    const years = Math.max(1, targetYear - currentYear);

    const rateDecimal = rate / 100;
    const projectedExpense = Math.round(expense * Math.pow(1 + rateDecimal, years));
    const additionalCost = projectedExpense - expense;

    res.json({
      success: true,
      category: category || 'General',
      currentYear,
      targetYear,
      years,
      todaysExpense: expense,
      projectedExpense,
      additionalCost,
      inflationRate: rate,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRates,
  calculateInflation,
  predictFutureExpenses,
};
