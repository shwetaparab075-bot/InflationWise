const mongoose = require('mongoose');

const financialProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    monthlyIncome: { type: Number, default: 0, min: 0 },
    additionalIncome: { type: Number, default: 0, min: 0 },
    fixedExpenses: { type: Number, default: 0, min: 0 },
    variableExpenses: { type: Number, default: 0, min: 0 },
    currentSavings: { type: Number, default: 0, min: 0 },
    currentInvestments: { type: Number, default: 0, min: 0 },
    existingEMI: { type: Number, default: 0, min: 0 },
    monthlySavingsTarget: { type: Number, default: 0, min: 0 },
    dependents: { type: Number, default: 0, min: 0 },
    inflationRate: { type: Number, default: 5.5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FinancialProfile', financialProfileSchema);
