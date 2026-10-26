const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    goalName: { type: String, required: true, trim: true },
    goalCategory: {
      type: String,
      required: true,
      enum: ['Education', 'Medical', 'House', 'Vehicle', 'Retirement', 'Emergency Fund', 'Marriage', 'Travel', 'Business', 'Other'],
    },
    currentCost: { type: Number, required: true, min: 0 },
    years: { type: Number, required: true, min: 1, max: 80 },
    inflationRate: { type: Number, required: true, min: 0, max: 30 },
    futureCost: { type: Number, required: true, min: 0 },
    currentGoalSavings: { type: Number, default: 0, min: 0 },
    requiredMonthlySaving: { type: Number, default: 0, min: 0 },
    estimatedMonthlyInvestment: { type: Number, default: null },
    targetDate: { type: Date, required: true },
    expectedReturn: { type: Number, default: null },
    notes: { type: String, default: '', maxlength: 1000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FinancialGoal', goalSchema);
