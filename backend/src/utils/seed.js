const bcrypt = require('bcryptjs');
const User = require('../models/User');
const FinancialDetails = require('../models/FinancialDetails');
const Expense = require('../models/Expense');
const FinancialGoal = require('../models/FinancialGoal');
const Saving = require('../models/Saving');
const { calculateGoal, targetDateFromYears } = require('./calculations');

const DEMO_EMAIL = 'demo@inflationwise.com';

const monthDate = (monthsAgo, day) => {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() - monthsAgo);
  date.setDate(day);
  return date;
};

const seedDatabase = async () => {
  const adminPassword = await bcrypt.hash('Admin@1234', 12);
  const existingAdmin = await User.findOne({ email: 'admin@inflationwise.com' });
  if (!existingAdmin) {
    await User.create({
      name: 'InflationWise Admin',
      email: 'admin@inflationwise.com',
      mobile: '9123456780',
      password: adminPassword,
      role: 'admin',
      isActive: true,
    });
    console.log('[Seed] Admin account created: admin@inflationwise.com / Admin@1234');
  }

  const password = await bcrypt.hash('Demo@1234', 12);
  let user = await User.findOne({ email: DEMO_EMAIL }).select('+password');

  if (!user) {
    user = await User.create({
      name: 'Aanya Sharma',
      email: DEMO_EMAIL,
      mobile: '9876543210',
      password,
      role: 'user',
      isActive: true,
    });
    console.log('[Seed] Demo account created: demo@inflationwise.com / Demo@1234');
  }

  const hasDetails = await FinancialDetails.findOne({ userId: user._id });
  if (hasDetails) return;

  await FinancialDetails.create({
    userId: user._id,
    monthlyIncome: 50000,
    monthlyExpenses: 30000,
    currentSavings: 500000,
    monthlySavings: 10000,
    additionalIncome: 0,
    notes: 'Sample household plan used to explore InflationWise.',
  });

  const currentExpenses = [
    ['House Rent', 10000, 'Rent', 'Monthly', 2],
    ['Groceries', 5000, 'Groceries', 'Monthly', 5],
    ['Electricity Bill', 2000, 'Electricity', 'Monthly', 7],
    ['Transport', 3000, 'Transport', 'Monthly', 8],
    ['Medical Checkup', 1500, 'Medical', 'Monthly', 10],
    ['Food', 3500, 'Food', 'Daily', 12],
    ['Internet', 1000, 'Internet', 'Monthly', 14],
    ['Shopping', 2000, 'Shopping', 'Monthly', 16],
    ['Entertainment', 1000, 'Entertainment', 'Monthly', 18],
    ['Mobile Recharge', 500, 'Mobile Recharge', 'Monthly', 20],
    ['Health Insurance', 500, 'Insurance', 'Monthly', 22],
  ];

  const expenseDocs = currentExpenses.map(([expenseName, amount, category, expenseType, day]) => ({
    userId: user._id,
    expenseName,
    amount,
    category,
    expenseType,
    notes: '',
    createdAt: monthDate(0, day),
    updatedAt: monthDate(0, day),
  }));

  for (let ago = 1; ago <= 5; ago += 1) {
    currentExpenses.forEach(([expenseName, amount, category, expenseType, day], index) => {
      const factor = 0.9 + ((index + ago) % 5) * 0.03;
      const createdAt = monthDate(ago, day);
      expenseDocs.push({
        userId: user._id,
        expenseName,
        amount: Math.round(amount * factor),
        category,
        expenseType,
        notes: '',
        createdAt,
        updatedAt: createdAt,
      });
    });
  }
  await Expense.insertMany(expenseDocs);

  const calc = calculateGoal({
    currentCost: 5000000,
    inflationRate: 6,
    years: 10,
    currentGoalSavings: 500000,
  });

  const goal = await FinancialGoal.create({
    userId: user._id,
    goalName: 'Dream House',
    goalCategory: 'House',
    currentCost: 5000000,
    years: 10,
    inflationRate: 6,
    futureCost: calc.futureCost,
    currentGoalSavings: 500000,
    requiredMonthlySaving: calc.requiredMonthlySaving,
    estimatedMonthlyInvestment: null,
    targetDate: targetDateFromYears(10),
    expectedReturn: null,
    notes: 'Buy a home without underestimating future prices.',
  });

  const start = monthDate(6, 1);
  await Saving.create({
    userId: user._id,
    savingName: 'Salary Savings Account',
    savingType: 'Bank Savings',
    amount: 300000,
    monthlyContribution: 6000,
    startDate: start,
    linkedGoal: null,
    notes: 'General monthly savings.',
  });
  await Saving.create({
    userId: user._id,
    savingName: 'Dream House RD',
    savingType: 'Recurring Deposit',
    amount: 200000,
    monthlyContribution: 4000,
    startDate: start,
    linkedGoal: goal._id,
    notes: 'Linked to the Dream House goal.',
  });

  console.log('[Seed] Example financial plan added for the demo account.');
};

module.exports = { seedDatabase, DEMO_EMAIL };
