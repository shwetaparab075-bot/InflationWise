/**
 * Financial Goal Calculation Utilities
 */

import { calculateFutureExpense } from './inflationCalculator';

export const calculateGoalProgress = (currentAmount, targetAmount) => {
  const current = Number(currentAmount) || 0;
  const target = Number(targetAmount) || 0;
  if (target <= 0) return 0;
  const pct = (current / target) * 100;
  return Math.min(100, Math.round(pct * 10) / 10);
};

export const calculateRemainingGoal = (currentAmount, targetAmount) => {
  const current = Number(currentAmount) || 0;
  const target = Number(targetAmount) || 0;
  const remaining = target - current;
  return remaining > 0 ? Math.round(remaining * 100) / 100 : 0;
};

export const calculateInflationAdjustedTarget = (targetAmount, inflationRatePct, targetYear) => {
  const currentYear = new Date().getFullYear();
  const years = Math.max(0, (Number(targetYear) || currentYear) - currentYear);
  return calculateFutureExpense(targetAmount, inflationRatePct, years);
};
