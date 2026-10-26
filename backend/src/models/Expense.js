const mongoose = require('mongoose');

const CATEGORIES = [
  'Rent', 'Electricity', 'Groceries', 'Transport', 'Medical', 'Education',
  'Shopping', 'Entertainment', 'EMI', 'Mobile Recharge', 'Internet',
  'Insurance', 'Food', 'Other',
];

const expenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    expenseName: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, enum: CATEGORIES },
    expenseType: { type: String, required: true, enum: ['Daily', 'Monthly'] },
    notes: { type: String, default: '', maxlength: 500 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
