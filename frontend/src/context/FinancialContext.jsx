import React, { createContext, useState, useContext } from 'react';
import { calculateFutureExpense, calculateInflationImpact } from '../utils/inflationCalculator';
import { calculateRealReturn, formatINR } from '../utils/financialCalculator';
import { calculateInflationAdjustedTarget, calculateGoalProgress } from '../utils/goalCalculator';

const FinancialContext = createContext();

export const FinancialProvider = ({ children }) => {
  // Financial Profile State - India Baseline
  const [profile, setProfile] = useState({
    monthlyIncome: 85000, // ₹85,000 / month
    currentSavings: 250000, // ₹2,50,000
    age: 32,
    inflationRate: 6.0, // RBI Target CPI Average
    selectedPlan: 'Bank Savings',
    riskTolerance: 'moderate'
  });

  // Expense Categories in INR (12 standard categories)
  const [expenses, setExpenses] = useState([
    { category: 'Housing', amount: 25000, actualAmount: 26000 },
    { category: 'Food', amount: 12000, actualAmount: 13500 },
    { category: 'Transportation', amount: 6000, actualAmount: 6500 },
    { category: 'Healthcare', amount: 4000, actualAmount: 3800 },
    { category: 'Education', amount: 5000, actualAmount: 5000 },
    { category: 'Utilities', amount: 4500, actualAmount: 4800 },
    { category: 'Entertainment', amount: 3500, actualAmount: 4200 },
    { category: 'Insurance', amount: 4000, actualAmount: 4000 },
    { category: 'Shopping', amount: 4000, actualAmount: 5200 },
    { category: 'Travel', amount: 3000, actualAmount: 2500 },
    { category: 'Personal Care', amount: 2000, actualAmount: 2200 },
    { category: 'Other', amount: 2000, actualAmount: 1800 }
  ]);

  // Goals State in INR
  const [goals, setGoals] = useState([
    {
      id: 'g1',
      goalName: 'Emergency Reserve Fund',
      targetAmount: 300000, // ₹3 Lakhs
      currentAmount: 210000,
      targetYear: 2027,
      status: 'On Track'
    },
    {
      id: 'g2',
      goalName: 'Dream Home Downpayment',
      targetAmount: 2500000, // ₹25 Lakhs
      currentAmount: 850000,
      targetYear: 2031,
      status: 'In Progress'
    },
    {
      id: 'g3',
      goalName: 'Child Higher Education Fund',
      targetAmount: 1500000, // ₹15 Lakhs
      currentAmount: 350000,
      targetYear: 2034,
      status: 'Behind Schedule'
    },
    {
      id: 'g4',
      goalName: 'Retirement Wealth Corpus',
      targetAmount: 10000000, // ₹1 Crore
      currentAmount: 1850000,
      targetYear: 2046,
      status: 'In Progress'
    }
  ]);

  // Investments Portfolio State in INR
  const [investments, setInvestments] = useState([
    {
      id: 'inv_1',
      investmentType: 'Nifty 50 Index Mutual Fund',
      amount: 150000, // ₹1,50,000
      expectedReturn: 12.5,
      brokerName: 'Zerodha Kite / Groww API'
    },
    {
      id: 'inv_2',
      investmentType: 'Sovereign Gold Bond (SGB) / PPF',
      amount: 80000, // ₹80,000
      expectedReturn: 8.2,
      brokerName: 'SBI / ICICI Direct API'
    },
    {
      id: 'inv_3',
      investmentType: 'Embassy Office Parks Indian REIT',
      amount: 50000, // ₹50,000
      expectedReturn: 10.0,
      brokerName: 'Groww API'
    }
  ]);

  const totalPlannedExpense = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalActualExpense = expenses.reduce((sum, e) => sum + (Number(e.actualAmount) || 0), 0);
  const futureMonthlyExpense = calculateFutureExpense(totalPlannedExpense, profile.inflationRate, 10);
  const inflationImpact10Yr = calculateInflationImpact(totalPlannedExpense, profile.inflationRate, 10);

  const enrichedGoals = goals.map(goal => {
    const adjustedTarget = calculateInflationAdjustedTarget(goal.targetAmount, profile.inflationRate, goal.targetYear);
    const progressPct = calculateGoalProgress(goal.currentAmount, goal.targetAmount);
    return {
      ...goal,
      inflationAdjustedTarget: adjustedTarget,
      progressPercentage: progressPct,
      remainingAmount: Math.max(0, goal.targetAmount - goal.currentAmount),
      remainingAdjusted: Math.max(0, adjustedTarget - goal.currentAmount)
    };
  });

  const totalGoalTarget = enrichedGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalGoalSaved = enrichedGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallGoalProgressPct = totalGoalTarget > 0 ? Math.round((totalGoalSaved / totalGoalTarget) * 1000) / 10 : 0;

  const enrichedInvestments = investments.map(inv => {
    const realReturn = calculateRealReturn(inv.expectedReturn, profile.inflationRate);
    return {
      ...inv,
      realReturn,
      annualReturnAmount: Math.round(inv.amount * (inv.expectedReturn / 100)),
      realReturnAmount: Math.round(inv.amount * (realReturn / 100))
    };
  });

  const getSmartRecommendations = () => {
    const recs = [];
    const monthlyBurn = totalPlannedExpense > 0 ? totalPlannedExpense : 45000;
    const recommendedEmergencyFund = monthlyBurn * 3;
    const isSavingsLow = profile.currentSavings < recommendedEmergencyFund;

    let recPlan = 'Cash Savings';
    if (isSavingsLow) {
      recPlan = 'Cash Savings';
      recs.push({
        id: 'rec_plan',
        type: 'PLAN',
        badge: 'Emergency Focus',
        title: 'Strategy Recommendation: Cash Savings',
        description: `Your liquid reserves (${formatINR(profile.currentSavings)}) are below the 3-month safety mark (${formatINR(recommendedEmergencyFund)}). Focus on building cash reserves.`,
        recommendedPlan: 'Cash Savings'
      });
    } else if (profile.currentSavings >= recommendedEmergencyFund && profile.currentSavings < monthlyBurn * 12) {
      recPlan = 'Bank Savings';
      recs.push({
        id: 'rec_plan',
        type: 'PLAN',
        badge: 'High Yield FDs',
        title: 'Strategy Recommendation: High-Yield Bank Savings & FDs',
        description: `You have an established emergency buffer. Transfer surplus cash into High-Yield Bank FDs/Savings (7.1%+ APY) to protect liquidity against CPI inflation.`,
        recommendedPlan: 'Bank Savings'
      });
    } else {
      recPlan = 'Investment';
      recs.push({
        id: 'rec_plan',
        type: 'PLAN',
        badge: 'Inflation Beating Growth',
        title: 'Strategy Recommendation: Investment Portfolio',
        description: `Your strong liquid savings (${formatINR(profile.currentSavings)}) enable you to allocate capital into Nifty 50 Index Funds & Sovereign Gold Bonds to achieve real positive returns above ${profile.inflationRate}% CPI inflation.`,
        recommendedPlan: 'Investment'
      });
    }

    if (totalActualExpense > totalPlannedExpense) {
      const over = totalActualExpense - totalPlannedExpense;
      recs.push({
        id: 'rec_alert_budget',
        type: 'ALERT',
        badge: 'Spending Warning',
        title: 'Actual Expenses Exceed Planned Budget',
        description: `Your actual spending (${formatINR(totalActualExpense)}) is ${formatINR(over)} higher than your planned budget (${formatINR(totalPlannedExpense)}). Consider cutting discretionary items in Food & Shopping.`
      });
    }

    if (enrichedGoals.length > 0) {
      const highestGoal = enrichedGoals.reduce((max, g) => (g.targetAmount > max.targetAmount ? g : max), enrichedGoals[0]);
      if (highestGoal && highestGoal.inflationAdjustedTarget > highestGoal.targetAmount) {
        const delta = highestGoal.inflationAdjustedTarget - highestGoal.targetAmount;
        recs.push({
          id: 'rec_goal_inf',
          type: 'GOAL',
          badge: 'Inflation Target Surge',
          title: `Inflation Target Shift for "${highestGoal.goalName}"`,
          description: `Due to projected ${profile.inflationRate}% annual CPI inflation, your target corpus increases by ${formatINR(Math.round(delta))} to ${formatINR(Math.round(highestGoal.inflationAdjustedTarget))}. Increase your monthly automated SIPs.`
        });
      }
    }

    return { recommendedPlan: recPlan, insights: recs };
  };

  const updateProfile = (newFields) => {
    setProfile(prev => ({ ...prev, ...newFields }));
  };

  const updateExpenseCategory = (category, amount, actualAmount) => {
    setExpenses(prev => prev.map(e => e.category === category ? { ...e, amount: Number(amount), actualAmount: Number(actualAmount) } : e));
  };

  const updateAllExpenses = (newExpenses) => {
    setExpenses(newExpenses);
  };

  const addGoal = (goalData) => {
    const newG = { id: 'g_' + Date.now(), status: 'In Progress', currentAmount: 0, ...goalData };
    setGoals(prev => [...prev, newG]);
  };

  const updateGoalItem = (id, goalData) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...goalData } : g));
  };

  const deleteGoalItem = (id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const addInvestmentItem = (invData) => {
    const newInv = { id: 'inv_' + Date.now(), brokerName: 'Zerodha / Custom Integration', ...invData };
    setInvestments(prev => [...prev, newInv]);
  };

  return (
    <FinancialContext.Provider
      value={{
        profile,
        updateProfile,
        expenses,
        updateExpenseCategory,
        updateAllExpenses,
        goals: enrichedGoals,
        addGoal,
        updateGoalItem,
        deleteGoalItem,
        investments: enrichedInvestments,
        addInvestmentItem,
        totalPlannedExpense,
        totalActualExpense,
        futureMonthlyExpense,
        inflationImpact10Yr,
        overallGoalProgressPct,
        totalGoalTarget,
        totalGoalSaved,
        getSmartRecommendations
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => useContext(FinancialContext);
