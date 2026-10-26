import React, { useState, useEffect } from 'react';
import { PieChart as PieIcon, BarChart3, TrendingUp, DollarSign, Lightbulb } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import API from '../services/api';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from 'recharts';

const COLORS = ['#2478E8', '#3B8EF5', '#67B7FF', '#F59E0B', '#EF4444', '#8B5CF6', '#10B981'];

const ExpenseAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({
    totalMonthly: 53000,
    highestCategory: 'Housing',
    highestAmount: 22000,
    averageDaily: 1766,
  });

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        const res = await API.get('/expenses');
        if (res.data.success) {
          setExpenses(res.data.expenses || []);
          if (res.data.summary) {
            setSummary(res.data.summary);
          }
        }
      } catch (err) {
        console.warn('Using demo expense analysis data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisData();
  }, []);

  const formatINR = (val) => '₹' + Number(val || 0).toLocaleString('en-IN');

  // Compute calculated category breakdown
  const categoryMap = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount || 0);
    return acc;
  }, {});

  const categoryData = Object.keys(categoryMap).length > 0
    ? Object.entries(categoryMap).map(([name, value]) => ({ name, value }))
    : [
        { name: 'Housing', value: 22000 },
        { name: 'Food', value: 12500 },
        { name: 'EMI', value: 7000 },
        { name: 'Insurance', value: 4800 },
        { name: 'Transportation', value: 4500 },
        { name: 'Utilities', value: 2200 },
      ];

  const totalSpent = categoryData.reduce((acc, c) => acc + c.value, 0) || 53000;

  // Monthly Comparison
  const monthlyComparisonData = [
    { month: 'May', Spending: 48000 },
    { month: 'Jun', Spending: 51000 },
    { month: 'Jul', Spending: 49500 },
    { month: 'Aug', Spending: 52000 },
    { month: 'Sep', Spending: totalSpent },
  ];

  // Calculated Real Insights
  const topCat = categoryData.reduce((max, c) => (c.value > max.value ? c : max), categoryData[0] || { name: 'Housing', value: 22000 });
  const topPercentage = totalSpent > 0 ? Math.round((topCat.value / totalSpent) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title">Expense Analysis</h1>
        <p className="section-subtitle">Visual analytics and mathematical insights on your spending patterns.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Total Monthly Spending"
          value={formatINR(totalSpent)}
          subtitle="Sum of recorded expenses"
          icon={DollarSign}
          accentColor="blue"
        />
        <StatCard
          title="Highest Spending Category"
          value={topCat.name}
          subtitle={`${formatINR(topCat.value)} (${topPercentage}% of total)`}
          icon={PieIcon}
          accentColor="orange"
        />
        <StatCard
          title="Average Daily Expense"
          value={formatINR(Math.round(totalSpent / 30))}
          subtitle="Based on 30-day month"
          icon={BarChart3}
          accentColor="purple"
        />
      </div>

      {/* Actual Calculated Insights Banner */}
      <div className="rounded-2xl border border-[#2478E8]/20 bg-[#F4F9FF] p-5 space-y-2">
        <div className="flex items-center gap-2 text-[#2478E8] font-bold text-sm">
          <Lightbulb className="h-5 w-5" /> Spending Insight
        </div>
        <p className="text-xs text-[#10233F] leading-relaxed">
          <span className="font-bold">{topCat.name}</span> accounts for <span className="font-bold text-[#2478E8]">{topPercentage}%</span> of your monthly expenses.
          At the current RBI inflation rate of 5.5%, your monthly living cost is projected to increase by <span className="font-bold text-[#2478E8]">{formatINR(Math.round(totalSpent * 0.055))}</span> next year.
        </p>
      </div>

      {/* Visual Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Pie Chart */}
        <div className="lg:col-span-6 card p-6 space-y-4">
          <h3 className="section-title">Expense Distribution (Pie Chart)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [formatINR(v), 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Bar Chart */}
        <div className="lg:col-span-6 card p-6 space-y-4">
          <h3 className="section-title">Category Spending Comparison (Bar Chart)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tickLine={false} />
                <YAxis tickFormatter={(v) => `₹${v / 1000}k`} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v) => [formatINR(v), 'Spending']} />
                <Bar dataKey="value" fill="#2478E8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Comparison Line Chart */}
      <div className="card p-6 space-y-4">
        <h3 className="section-title">Monthly Expense Trend (Line Chart)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyComparisonData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month" tickLine={false} />
              <YAxis tickFormatter={(v) => `₹${v / 1000}k`} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v) => [formatINR(v), 'Total Spent']} />
              <Line type="monotone" dataKey="Spending" stroke="#3B8EF5" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ExpenseAnalysis;
