import { formatINR } from './currency';

export function futureCost(presentCost, inflationRate, years) {
  const present = Number(presentCost) || 0;
  const rate = Number(inflationRate) || 0;
  const time = Number(years) || 0;
  return Math.round(present * Math.pow(1 + rate / 100, time));
}

export function monthlySavingTarget(future, currentSavings, years) {
  const remaining = Math.max(0, Math.round(future) - (Number(currentSavings) || 0));
  const months = Math.max(1, Math.round(Number(years) * 12));
  return {
    remaining,
    months,
    required: Math.round(remaining / months),
  };
}

export function inflationExplanation({ currentCost, inflationRate, years, future }) {
  return `At a ${inflationRate}% annual inflation rate, something costing ${formatINR(currentCost)} today may cost approximately ${formatINR(future)} after ${years} years.`;
}

export const DISCLAIMER = 'InflationWise provides estimated financial calculations for planning and educational purposes. Actual inflation rates, investment returns, and future costs may vary.';

export const INVESTMENT_DISCLAIMER = 'Actual investment returns may vary. This calculation is only for financial planning and educational purposes.';
