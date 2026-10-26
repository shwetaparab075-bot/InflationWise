const mongoose = require('mongoose');

const savingsPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    planType: {
      type: String,
      enum: ['Cash Savings', 'Bank Savings', 'Investment'],
      required: true,
    },
    monthlyAmount: {
      type: Number,
      default: 0,
    },
    recommended: {
      type: Boolean,
      default: false,
    },
    connectedAccount: {
      type: String,
      default: 'Mock High Yield Savings Account',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SavingsPlan', savingsPlanSchema);
