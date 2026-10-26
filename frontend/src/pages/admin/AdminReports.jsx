import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import adminApi from '../../services/adminApi';
import { PageHeader, Spinner, StatCard } from '../../components/ui';
import { ChartCard } from '../../components/charts';

const COLORS = ['#20205A', '#3155C6', '#16C7D9', '#4C6FE0', '#0E8F9C', '#8AA0E8'];

export default function AdminReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.get('/admin/reports').then((response) => setData(response.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return null;

  return (
    <div>
      <PageHeader title="Reports" subtitle="Overall InflationWise system reports." />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Users" value={String(data.totalUsers)} hint={`${data.activeUsers} active`} tone="deep" icon={<span>₹</span>} />
        <StatCard label="Total Expense Records" value={String(data.totalExpenses)} tone="cyan" icon={<span>₹</span>} />
        <StatCard label="Total Goals Created" value={String(data.totalGoals)} tone="blue" icon={<span>₹</span>} />
        <StatCard label="Savings Records" value={String(data.totalSavings)} tone="sky" icon={<span>₹</span>} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Expense Categories" empty={!data.expenseCategories.length ? 'No expenses yet.' : ''}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.expenseCategories}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 11 }} interval={0} angle={-25} height={70} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" name="Amount" fill="#16C7D9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Financial Goal Categories" empty={!data.goalCategories.length ? 'No goals yet.' : ''}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data.goalCategories} dataKey="value" nameKey="name" innerRadius={58} outerRadius={90}>
                {data.goalCategories.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="User Registration Summary" empty={!data.registrations.length ? 'No registrations yet.' : ''}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.registrations}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" name="Users" stroke="#3155C6" strokeWidth={3} dot={{ r: 4, fill: '#16C7D9' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
