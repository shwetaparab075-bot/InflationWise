const mongoose = require('mongoose');

const savingPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    notes: {
      type: String,
      default: '',
    },
    preferredOptions: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SavingPlan', savingPlanSchema);
