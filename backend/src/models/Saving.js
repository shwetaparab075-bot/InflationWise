const mongoose = require('mongoose');

const savingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    savingName: { type: String, required: true, trim: true },
    savingType: {
      type: String,
      required: true,
      enum: ['Cash Savings', 'Bank Savings', 'Recurring Deposit', 'Fixed Deposit', 'Emergency Savings', 'Other'],
    },
    amount: { type: Number, required: true, min: 0 },
    monthlyContribution: { type: Number, default: 0, min: 0 },
    startDate: { type: Date, required: true },
    linkedGoal: { type: mongoose.Schema.Types.ObjectId, ref: 'FinancialGoal', default: null },
    notes: { type: String, default: '', maxlength: 500 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Saving', savingSchema);
