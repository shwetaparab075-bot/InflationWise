const mongoose = require('mongoose');

const financialDetailsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    monthlyIncome: { type: Number, default: 0, min: 0 },
    monthlyExpenses: { type: Number, default: 0, min: 0 },
    currentSavings: { type: Number, default: 0, min: 0 },
    monthlySavings: { type: Number, default: 0, min: 0 },
    additionalIncome: { type: Number, default: 0, min: 0 },
    notes: { type: String, default: '', maxlength: 1000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FinancialDetails', financialDetailsSchema);
