import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, Cell
} from 'recharts';
import { formatINR } from '../../utils/financialCalculator';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-card-md text-xs">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: p.fill }}></span>
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-semibold text-slate-800">{formatINR(p.value)}</span>
        </div>
      ))}
      {payload.length === 2 && (
        <div className="border-t border-slate-100 mt-2 pt-2">
          <span className={`text-xs font-semibold ${payload[1].value > payload[0].value ? 'text-red-500' : 'text-emerald-600'}`}>
            {payload[1].value > payload[0].value
              ? `+${formatINR(payload[1].value - payload[0].value)} over budget`
              : `${formatINR(payload[0].value - payload[1].value)} under budget`}
          </span>
        </div>
      )}
    </div>
  );
};

const PlannedVsActualChart = ({ expenses = [] }) => {
  const data = expenses.slice(0, 8).map(e => ({
    name: e.category.length > 8 ? e.category.substring(0, 8) + '…' : e.category,
    Planned: e.amount || 0,
    Actual:  e.actualAmount || e.amount || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} barGap={3} margin={{ top: 4, right: 4, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'Inter' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
          tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'Inter' }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 10, fontFamily: 'Inter', color: '#64748B' }}
        />
        <Bar dataKey="Planned" fill="#3B82F6" radius={[4,4,0,0]} maxBarSize={24} />
        <Bar dataKey="Actual"  fill="#10B981" radius={[4,4,0,0]} maxBarSize={24}
          label={false}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.Actual > entry.Planned ? '#EF4444' : '#10B981'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PlannedVsActualChart;
