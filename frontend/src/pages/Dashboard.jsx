import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IndianRupee, PiggyBank, Receipt, Wallet } from 'lucide-react';
import API from '../services/api';
import { formatINR, formatPercent } from '../utils/currency';
import { StatCard, Spinner, Disclaimer, EmptyState } from '../components/ui';
import { CategoryPie, ChartCard, GoalBars, IncomeExpenseChart, PlannedActualChart, SavingsGrowthChart, SpendingChart } from '../components/charts';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/reports').then((response) => setData(response.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return <EmptyState title="Could not load your dashboard." text="Please refresh the page." />;

  const cards = [
    ['Monthly Income', data.cards.monthlyIncome, IndianRupee, 'indigo'],
    ['Monthly Expenses', data.cards.monthlyExpenses, Receipt, 'orange'],
    ['Monthly Savings', data.cards.monthlySavings, PiggyBank, 'teal'],
    ['Available Balance', data.cards.availableBalance, Wallet, 'green'],
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-xl bg-[#20205A] p-6 text-white">
        <img src="/images/savings.jpg" alt="" className="absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover opacity-30 md:block" />
        <div className="relative z-10 max-w-xl">
          <p className="text-sm font-semibold text-[#16C7D9]">Your plan at a glance</p>
          <h2 className="mt-1 font-display text-2xl font-bold">Stay ahead of rising costs</h2>
          <p className="mt-2 text-sm text-white/85">Income, expenses, savings, and goals stay together so the monthly target stays clear.</p>
        </div>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon, tone]) => (
          <StatCard key={label} label={label} value={formatINR(value)} icon={<Icon size={20} />} tone={tone} />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Income vs Expenses"><IncomeExpenseChart data={data.incomeVsExpenses} /></ChartCard>
        <ChartCard title="Monthly Spending" empty={data.monthlySpending.every((item) => !item.amount) ? 'No expenses added yet.' : ''}><SpendingChart data={data.monthlySpending} /></ChartCard>
        <ChartCard title="Savings Growth" empty={!data.savingsGrowth.some((item) => item.amount) ? 'Add a savings record to see growth.' : ''}><SavingsGrowthChart data={data.savingsGrowth} /></ChartCard>
        <ChartCard title="Expense Categories" empty={!data.expenseCategories.length ? 'No expenses added yet.' : ''}><CategoryPie data={data.expenseCategories} /></ChartCard>
        <ChartCard title="Goal Progress" empty={!data.goalProgress.length ? 'No financial goals created yet.' : ''}><GoalBars data={data.goalProgress} /></ChartCard>
        <ChartCard title="Planned Savings vs Actual Savings" empty={!data.plannedVsActual.length ? 'Start by creating your first financial goal.' : ''}><PlannedActualChart data={data.plannedVsActual} /></ChartCard>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/goals" className="card p-5 font-semibold text-[#20205A]">Create a financial goal</Link>
        <Link to="/expenses" className="card p-5 font-semibold text-[#20205A]">Add an expense</Link>
        <Link to="/inflation-calculator" className="card p-5 font-semibold text-[#20205A]">Open inflation calculator</Link>
      </div>
      {!!data.goalProgress[0] && (
        <p className="text-sm text-[#64748B]">Top goal progress: {data.goalProgress[0].goalName} · {formatPercent(data.goalProgress[0].progress)}</p>
      )}
      <Disclaimer />
    </div>
  );
}
