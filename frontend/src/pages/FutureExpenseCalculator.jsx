import React, { useState } from 'react';
import { TrendingUp, Category, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

const CATEGORY_RATES = {
  Food: 6.8,
  Housing: 5.5,
  Transportation: 6.0,
  Education: 8.5,
  Healthcare: 9.2,
  Shopping: 5.0,
  Entertainment: 4.5,
  Utilities: 5.2,
  Other: 5.5,
};

const FutureExpenseCalculator = () => {
  const [category, setCategory]             = useState('Education');
  const [currentExpense, setCurrentExpense] = useState(15000);
  const [inflationRate, setInflationRate]   = useState(8.5);
  const [futureYear, setFutureYear]         = useState(2031);

  const currentYear = 2026;
  const yearsVal    = Math.max(1, Number(futureYear) - currentYear);
  const expenseVal  = Number(currentExpense) || 0;
  const rateVal     = Number(inflationRate) || 5.5;

  const rateDecimal = rateVal / 100;
  const projectedExpense = Math.round(expenseVal * Math.pow(1 + rateDecimal, yearsVal));
  const additionalCost   = projectedExpense - expenseVal;

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    if (CATEGORY_RATES[cat]) {
      setInflationRate(CATEGORY_RATES[cat]);
    }
  };

  const chartData = [
    {
      name: category,
      Today: expenseVal,
      Future: projectedExpense,
      InflationCost: additionalCost,
    },
  ];

  const formatINR = (val) => '₹' + Number(val || 0).toLocaleString('en-IN');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="page-title">Future Expense Prediction</h1>
        <p className="section-subtitle">Project category-wise future expenses adjusted for sector-specific CPI inflation rates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="lg:col-span-4 card p-6 space-y-5">
          <h3 className="section-title">Prediction Parameters</h3>

          <div>
            <label className="input-label">Expense Category</label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="input text-xs"
            >
              {Object.keys(CATEGORY_RATES).map((cat) => (
                <option key={cat} value={cat}>{cat} (RBI CPI ~{CATEGORY_RATES[cat]}%)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="input-label">Current Monthly Expense (₹)</label>
            <input
              type="number"
              min="0"
              value={currentExpense}
              onChange={(e) => setCurrentExpense(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="input-label">Sector Inflation Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={inflationRate}
              onChange={(e) => setInflationRate(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="input-label">Target Future Year</label>
            <select
              value={futureYear}
              onChange={(e) => setFutureYear(e.target.value)}
              className="input text-xs"
            >
              {[2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2040].map((y) => (
                <option key={y} value={y}>{y} ({y - currentYear} years later)</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Today's Expense"
              value={formatINR(expenseVal)}
              subtitle={`Base Year (${currentYear})`}
              icon={DollarSign}
              accentColor="blue"
            />
            <StatCard
              title="Projected Expense"
              value={formatINR(projectedExpense)}
              subtitle={`Target Year (${futureYear})`}
              icon={TrendingUp}
              accentColor="orange"
            />
            <StatCard
              title="Additional Cost"
              value={formatINR(additionalCost)}
              subtitle="Due to inflation"
              icon={AlertCircle}
              accentColor="red"
            />
          </div>

          {/* Comparison Bar Chart */}
          <div className="card p-6 space-y-4">
            <h3 className="section-title">Today vs Projected Expense ({category})</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tickLine={false} />
                  <YAxis tickFormatter={(v) => `₹${v / 1000}k`} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v) => [formatINR(v), 'Amount']} />
                  <Legend />
                  <Bar dataKey="Today" fill="#2478E8" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Future" fill="#67B7FF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FutureExpenseCalculator;
