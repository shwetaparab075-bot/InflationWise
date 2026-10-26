import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * Premium StatCard
 * Props: title, value, subtitle, icon (Lucide), accentColor, trend, trendUp
 */
const accentMap = {
  emerald: {
    icon:    'bg-emerald-50 text-emerald-600',
    value:   'text-emerald-600',
    border:  'border-t-emerald-500',
  },
  blue: {
    icon:    'bg-blue-50 text-blue-600',
    value:   'text-slate-900',
    border:  'border-t-blue-500',
  },
  purple: {
    icon:    'bg-purple-50 text-purple-600',
    value:   'text-slate-900',
    border:  'border-t-purple-500',
  },
  orange: {
    icon:    'bg-orange-50 text-orange-600',
    value:   'text-slate-900',
    border:  'border-t-orange-500',
  },
  red: {
    icon:    'bg-red-50 text-red-500',
    value:   'text-red-500',
    border:  'border-t-red-500',
  },
};

const StatCard = ({ title, value, subtitle, icon: Icon, accentColor = 'emerald', trend, trendUp }) => {
  const a = accentMap[accentColor] || accentMap.emerald;

  const TrendIcon = trendUp === true ? TrendingUp : trendUp === false ? TrendingDown : Minus;
  const trendClass = trendUp === true ? 'trend-up' : trendUp === false ? 'trend-down' : 'trend-flat';

  return (
    <div className={`card hover-lift p-5 border-t-[3px] ${a.border}`}>
      {/* Header: icon + title */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="stat-label">{title}</p>
        </div>
        {Icon && (
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${a.icon}`}>
            <Icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
          </div>
        )}
      </div>

      {/* Value */}
      <p className={`stat-number ${a.value} mb-1`}>{value}</p>

      {/* Subtitle / trend */}
      <div className="flex items-center gap-1.5 mt-2">
        {trendUp !== undefined && (
          <TrendIcon className={`h-3.5 w-3.5 ${trendClass}`} />
        )}
        <span className={`text-xs ${trendUp !== undefined ? trendClass : 'text-slate-500'}`}>
          {trend || subtitle}
        </span>
      </div>
      {subtitle && trend && (
        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
      )}
    </div>
  );
};

export default StatCard;
