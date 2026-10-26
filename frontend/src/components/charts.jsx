import React from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { compactINR, formatINR } from '../utils/currency';

const COLORS = ['#20205A', '#3155C6', '#16C7D9', '#4C6FE0', '#0E8F9C', '#8AA0E8', '#14306E', '#7FE3EC'];
const tooltipStyle = { borderRadius: 12, border: 'none', boxShadow: '0 10px 30px rgba(30,41,59,0.12)' };

function Axis({ dataKey = 'name' }) {
  return (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
      <XAxis dataKey={dataKey} tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
      <YAxis tickFormatter={compactINR} tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} width={64} />
      <Tooltip formatter={(value) => formatINR(value)} contentStyle={tooltipStyle} />
    </>
  );
}

export function ChartCard({ title, children, empty }) {
  return (
    <section className="card p-5">
      <h3 className="mb-4 font-display text-base font-semibold">{title}</h3>
      {empty ? <p className="py-16 text-center text-sm text-[#64748B]">{empty}</p> : <div className="h-72">{children}</div>}
    </section>
  );
}

export function IncomeExpenseChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <Axis />
        <Legend />
        <Bar dataKey="income" name="Income" fill="#20205A" radius={[6, 6, 0, 0]} />
        <Bar dataKey="expenses" name="Expenses" fill="#16C7D9" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SpendingChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <Axis dataKey="month" />
        <Bar dataKey="amount" name="Spending" fill="#3155C6" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SavingsGrowthChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Axis dataKey="month" />
        <Line type="monotone" dataKey="amount" name="Savings" stroke="#16C7D9" strokeWidth={3} dot={{ r: 4, fill: '#20205A' }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CategoryPie({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={90} paddingAngle={2}>
          {data.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(value) => formatINR(value)} contentStyle={tooltipStyle} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function GoalBars({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="goalName" width={110} tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} contentStyle={tooltipStyle} />
        <Bar dataKey="progress" name="Progress" fill="#16C7D9" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PlannedActualChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <Axis />
        <Legend />
        <Bar dataKey="planned" name="Planned" fill="#20205A" radius={[6, 6, 0, 0]} />
        <Bar dataKey="actual" name="Actual" fill="#16C7D9" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
