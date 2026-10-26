/**
 * Client-Side Inflation Calculation Utilities
 */

// Compound Inflation Formula: Future = Current * (1 + rate)^years
export const calculateFutureExpense = (currentExpense, inflationRatePct, years) => {
  const expense = Number(currentExpense) || 0;
  const rate = (Number(inflationRatePct) || 0) / 100;
  const period = Number(years) || 0;

  if (expense <= 0 || period <= 0) return expense;
  const futureValue = expense * Math.pow(1 + rate, period);
  return Math.round(futureValue * 100) / 100;
};

// Inflation Impact Amount
export const calculateInflationImpact = (currentExpense, inflationRatePct, years) => {
  const future = calculateFutureExpense(currentExpense, inflationRatePct, years);
  const impact = future - (Number(currentExpense) || 0);
  return Math.round(impact * 100) / 100;
};

// Multi-year Inflation Curve Generator
export const generateInflationProjectionTimeline = (currentExpense, inflationRatePct, maxYears = 20) => {
  const exp = Number(currentExpense) || 0;
  const rate = Number(inflationRatePct) || 0;
  const timeline = [];
  const currentYear = new Date().getFullYear();

  for (let y = 0; y <= maxYears; y++) {
    const futureVal = calculateFutureExpense(exp, rate, y);
    const impact = Math.round((futureVal - exp) * 100) / 100;
    timeline.push({
      year: currentYear + y,
      yearsAhead: y,
      currentValue: exp,
      futureValue: futureVal,
      inflationImpact: impact
    });
  }

  return timeline;
};
