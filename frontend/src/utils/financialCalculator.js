/**
 * Financial Calculation Utilities - India Format
 */

export const formatINR = (val) => {
  const num = Number(val) || 0;
  return '₹' + num.toLocaleString('en-IN');
};

export const calculatePlannedVsActual = (planned, actual) => {
  const p = Number(planned) || 0;
  const a = Number(actual) || 0;
  const difference = a - p;
  const percentVariance = p > 0 ? ((a - p) / p) * 100 : 0;

  return {
    planned: p,
    actual: a,
    difference: Math.round(difference * 100) / 100,
    percentVariance: Math.round(percentVariance * 10) / 10,
    isOverBudget: a > p
  };
};

export const calculateRealReturn = (nominalReturnPct, inflationRatePct) => {
  const nominal = (Number(nominalReturnPct) || 0) / 100;
  const inflation = (Number(inflationRatePct) || 0) / 100;

  const realReturnRatio = ((1 + nominal) / (1 + inflation)) - 1;
  return Math.round(realReturnRatio * 10000) / 100;
};
