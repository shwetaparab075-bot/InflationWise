import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { EXPENSE_CATEGORIES, MONTHS } from '../utils/constants';
import { formatINR, formatPercent } from '../utils/currency';
import { Disclaimer, PageHeader, Spinner, StatCard, StatusBadge } from '../components/ui';
import { CategoryPie, ChartCard, GoalBars, IncomeExpenseChart, PlannedActualChart, SpendingChart } from '../components/charts';

export default function Reports() {
  const now = new Date();
  const [filters, setFilters] = useState({ month: '', year: String(now.getFullYear()), goalId: '', category: '' });
  const [data, setData] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key === 'goalId' ? 'goalId' : key, value); });
    setLoading(true);
    API.get(`/reports?${params.toString()}`).then((response) => setData(response.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { API.get('/goals').then((response) => setGoals(response.data.data)); }, []);
  useEffect(() => { load(); }, [filters]);

  return (
    <div>
      <PageHeader title="Financial Reports" subtitle="Figures come from the records saved on your account." />
      <div className="card mb-6 grid gap-3 p-4 md:grid-cols-4">
        <select className="input" value={filters.month} onChange={(event) => setFilters({ ...filters, month: event.target.value })}><option value="">All months</option>{MONTHS.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}</select>
        <select className="input" value={filters.year} onChange={(event) => setFilters({ ...filters, year: event.target.value })}>{[0, 1, 2, 3].map((offset) => { const year = now.getFullYear() - offset; return <option key={year}>{year}</option>; })}</select>
        <select className="input" value={filters.goalId} onChange={(event) => setFilters({ ...filters, goalId: event.target.value })}><option value="">All goals</option>{goals.map((goal) => <option key={goal._id} value={goal._id}>{goal.goalName}</option>)}</select>
        <select className="input" value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}><option value="">All expense categories</option>{EXPENSE_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select>
      </div>
      {loading || !data ? <Spinner /> : (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <StatCard label="Monthly Income" value={formatINR(data.cards.monthlyIncome)} tone="indigo" icon={<span>₹</span>} />
            <StatCard label="Monthly Expenses" value={formatINR(data.cards.monthlyExpenses)} tone="orange" icon={<span>₹</span>} />
            <StatCard label="Savings" value={formatINR(data.cards.monthlySavings)} tone="teal" icon={<span>₹</span>} />
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <ChartCard title="Income vs expenses"><IncomeExpenseChart data={data.incomeVsExpenses} /></ChartCard>
            <ChartCard title="Expense categories" empty={!data.expenseCategories.length ? 'No expenses for this filter.' : ''}><CategoryPie data={data.expenseCategories} /></ChartCard>
            <ChartCard title="Monthly spending"><SpendingChart data={data.monthlySpending} /></ChartCard>
            <ChartCard title="Goal progress" empty={!data.goalProgress.length ? 'No financial goals created yet.' : ''}><GoalBars data={data.goalProgress} /></ChartCard>
            <ChartCard title="Planned vs actual savings" empty={!data.plannedVsActual.length ? 'No goals yet.' : ''}><PlannedActualChart data={data.plannedVsActual} /></ChartCard>
          </div>
          <div className="card mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#20205A] text-white"><tr>{['Goal', 'Current cost', 'Future cost', 'Inflation impact', 'Progress', 'Status'].map((head) => <th key={head} className="px-4 py-3">{head}</th>)}</tr></thead>
              <tbody>
                {data.goalProgress.map((goal) => (
                  <tr key={goal.id} className="border-t">
                    <td className="px-4 py-3">{goal.goalName}</td>
                    <td className="px-4 py-3">{formatINR(goal.currentCost)}</td>
                    <td className="px-4 py-3">{formatINR(goal.futureCost)}</td>
                    <td className="px-4 py-3">{formatINR(goal.inflationIncrease)}</td>
                    <td className="px-4 py-3">{formatPercent(goal.progress)}</td>
                    <td className="px-4 py-3"><StatusBadge status={goal.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4"><Disclaimer /></div>
        </>
      )}
    </div>
  );
}
