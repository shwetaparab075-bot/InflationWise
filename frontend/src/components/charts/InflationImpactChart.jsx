import React from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, Area, AreaChart
} from 'recharts';
import { formatINR } from '../../utils/financialCalculator';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-card-md text-xs">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: p.color }}></span>
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-semibold text-slate-800">{formatINR(Math.round(p.value))}</span>
        </div>
      ))}
    </div>
  );
};

const InflationImpactChart = ({ data = [] }) => {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="gradCurrent" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#10B981" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradFuture" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis
          dataKey="year"
          tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'Inter' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
          tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'Inter' }}
          axisLine={false}
          tickLine={false}
          width={52}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 12, fontFamily: 'Inter', color: '#64748B' }}
          iconType="circle"
          iconSize={8}
        />
        <Area
          type="monotone"
          dataKey="currentValue"
          name="Today's Value"
          stroke="#10B981"
          strokeWidth={2}
          fill="url(#gradCurrent)"
          dot={false}
          activeDot={{ r: 4, fill: '#10B981' }}
        />
        <Area
          type="monotone"
          dataKey="futureValue"
          name="Inflation-Adjusted"
          stroke="#F59E0B"
          strokeWidth={2}
          fill="url(#gradFuture)"
          dot={false}
          activeDot={{ r: 4, fill: '#F59E0B' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default InflationImpactChart;
