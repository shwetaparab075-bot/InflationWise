const FinancialDetails = require('../models/FinancialDetails');
const asyncHandler = require('../middleware/asyncHandler');

const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

const pick = (body) => {
  const fields = [
    'monthlyIncome', 'monthlyExpenses', 'currentSavings', 'monthlySavings', 'additionalIncome',
  ];
  const data = {};
  fields.forEach((field) => {
    const value = num(body[field]);
    if (value === null) {
      data.error = 'Enter valid amounts. Values cannot be negative.';
    } else {
      data[field] = value;
    }
  });
  data.notes = String(body.notes || '').slice(0, 1000);
  return data;
};

const getFinancial = asyncHandler(async (req, res) => {
  const details = await FinancialDetails.findOne({ userId: req.user._id });
  res.json({ success: true, data: details });
});

const saveFinancial = asyncHandler(async (req, res) => {
  const data = pick(req.body);
  if (data.error) return res.status(400).json({ success: false, message: data.error });
  delete data.error;

  const existing = await FinancialDetails.findOne({ userId: req.user._id });
  if (existing) {
    Object.assign(existing, data);
    await existing.save();
    return res.json({ success: true, message: 'Financial details updated successfully.', data: existing });
  }
  const created = await FinancialDetails.create({ ...data, userId: req.user._id });
  return res.status(201).json({ success: true, message: 'Financial details saved successfully.', data: created });
});

module.exports = { getFinancial, saveFinancial };
