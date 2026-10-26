const mongoose = require('mongoose');

const plannedBudgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    month: {
      type: Number,
      min: 1,
      max: 12,
      default: () => new Date().getMonth() + 1,
    },
    year: {
      type: Number,
      default: () => new Date().getFullYear(),
    },
    category: {
      type: String,
      required: true,
    },
    plannedAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

plannedBudgetSchema.index({ userId: 1, month: 1, year: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('PlannedBudget', plannedBudgetSchema);
