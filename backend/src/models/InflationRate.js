const mongoose = require('mongoose');

const inflationRateSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: true,
    },
    inflationRate: {
      type: Number,
      required: true, // e.g. 5.5 for 5.5%
    },
    category: {
      type: String,
      enum: ['General', 'Food', 'Education', 'Healthcare', 'Housing', 'Transportation'],
      default: 'General',
    },
    source: {
      type: String,
      default: 'RBI CPI Data',
    },
    description: {
      type: String,
      default: '',
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('InflationRate', inflationRateSchema);
