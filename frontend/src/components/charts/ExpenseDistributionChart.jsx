import React from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend
} from 'recharts';
import { formatINR } from '../../utils/financialCalculator';

const COLORS = ['#10B981','#3B82F6','#8B5CF6','#F59E0B','#EF4444','#06B6D4','#EC4899','#84CC16','#F97316','#6366F1','#14B8A6','#A78BFA'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-card-md text-xs">
      <p className="font-semibold text-slate-700 mb-1">{d.name}</p>
      <p className="text-slate-500">Amount: <span className="font-semibold text-slate-800">{formatINR(d.value)}</span></p>
      <p className="text-slate-500">Share: <span className="font-semibold text-slate-800">{d.payload.pct}%</span></p>
    </div>
  );
};

const renderCenterLabel = ({ cx, cy, total }) => (
  <g>
    <text x={cx} y={cy - 6} textAnchor="middle" fill="#0F172A" fontSize={18} fontWeight={700} fontFamily="Inter">
      {formatINR(total)}
    </text>
    <text x={cx} y={cy + 14} textAnchor="middle" fill="#94A3B8" fontSize={11} fontFamily="Inter">
      Monthly Total
    </text>
  </g>
);

const ExpenseDistributionChart = ({ expenses = [] }) => {
  const total = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const data = expenses
    .filter(e => e.amount > 0)
    .map(e => ({
      name: e.category,
      value: e.amount,
      pct: total > 0 ? ((e.amount / total) * 100).toFixed(1) : 0,
    }));

  if (!data.length) return <p className="text-sm text-slate-400 text-center py-8">No expense data</p>;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={72}
          outerRadius={108}
          paddingAngle={2}
          dataKey="value"
          label={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
          {renderCenterLabel({ cx: '50%', cy: '50%', total })}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, fontFamily: 'Inter', color: '#64748B', paddingTop: 8 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ExpenseDistributionChart;
