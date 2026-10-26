function roundRupee(value) {
  return Math.round(Number(value) || 0);
}

function futureCost(presentCost, inflationRate, years) {
  const present = Number(presentCost) || 0;
  const rate = Number(inflationRate) || 0;
  const time = Number(years) || 0;
  return roundRupee(present * Math.pow(1 + rate / 100, time));
}

function monthsForYears(years) {
  return Math.max(1, Math.round(Number(years) * 12));
}

function pmt(targetFuture, currentSavings, annualReturnPercent, years) {
  const remainingAfterGrowth = (() => {
    const annual = Number(annualReturnPercent) / 100;
    const grown = (Number(currentSavings) || 0) * Math.pow(1 + annual, Number(years));
    return Math.max(0, targetFuture - grown);
  })();

  const n = monthsForYears(years);
  const monthlyRate = Number(annualReturnPercent) / 100 / 12;
  if (monthlyRate === 0) return roundRupee(remainingAfterGrowth / n);
  const factor = (Math.pow(1 + monthlyRate, n) - 1) / monthlyRate;
  if (!factor) return 0;
  return roundRupee(remainingAfterGrowth / factor);
}

function calculateGoal({
  currentCost,
  inflationRate,
  years,
  currentGoalSavings = 0,
  linkedSavings = 0,
  expectedReturn,
}) {
  const future = futureCost(currentCost, inflationRate, years);
  const saved = (Number(currentGoalSavings) || 0) + (Number(linkedSavings) || 0);
  const remaining = Math.max(0, future - saved);
  const months = monthsForYears(years);
  const requiredMonthlySaving = roundRupee(remaining / months);
  const hasReturn = expectedReturn !== undefined && expectedReturn !== null && expectedReturn !== '';
  const estimatedMonthlyInvestment = hasReturn
    ? pmt(future, saved, expectedReturn, years)
    : null;

  return {
    futureCost: future,
    savedAmount: roundRupee(saved),
    remainingAmount: remaining,
    monthsRemaining: months,
    yearsRemaining: Number(years),
    requiredMonthlySaving,
    estimatedMonthlyInvestment,
    inflationIncrease: Math.max(0, future - roundRupee(currentCost)),
  };
}

function targetDateFromYears(years, from = new Date()) {
  const date = new Date(from);
  date.setFullYear(date.getFullYear() + Number(years || 0));
  return date;
}

function yearsFromTargetDate(targetDate, from = new Date()) {
  const end = new Date(targetDate);
  const ms = end.getTime() - new Date(from).getTime();
  const years = ms / (365.25 * 24 * 60 * 60 * 1000);
  return Math.max(1, Math.round(years));
}

module.exports = {
  roundRupee,
  futureCost,
  calculateGoal,
  targetDateFromYears,
  yearsFromTargetDate,
};
