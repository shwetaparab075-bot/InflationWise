const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Savings Account', 'Fixed Deposit', 'Recurring Deposit', 'Mutual Funds', 'PPF', 'Sovereign Gold Bond', 'Index Funds', 'Other'],
      default: 'Fixed Deposit',
    },
    description: {
      type: String,
      required: true,
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Moderate', 'High'],
      default: 'Low',
    },
    minimumAmount: {
      type: Number,
      default: 500,
    },
    expectedReturn: {
      type: String,
      default: '6.5% - 7.5% p.a.',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Recommendation', recommendationSchema);
