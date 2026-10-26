import React from 'react';
import { Info, AlertTriangle, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';

const typeMap = {
  info: {
    wrapper: 'insight-card insight-card-blue',
    icon:    <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />,
    title:   'text-blue-700',
    msg:     'text-slate-600',
  },
  warning: {
    wrapper: 'insight-card insight-card-orange',
    icon:    <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />,
    title:   'text-orange-700',
    msg:     'text-slate-600',
  },
  success: {
    wrapper: 'insight-card insight-card-emerald',
    icon:    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />,
    title:   'text-emerald-700',
    msg:     'text-slate-600',
  },
  error: {
    wrapper: 'insight-card insight-card-red',
    icon:    <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />,
    title:   'text-red-700',
    msg:     'text-slate-600',
  },
  insight: {
    wrapper: 'insight-card insight-card-purple',
    icon:    <Lightbulb className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />,
    title:   'text-purple-700',
    msg:     'text-slate-600',
  },
};

/**
 * AlertBanner — light theme insight/alert card
 * Props: type ('info' | 'warning' | 'success' | 'error' | 'insight'), title, message
 */
const AlertBanner = ({ type = 'info', title, message }) => {
  const t = typeMap[type] || typeMap.info;

  return (
    <div className={t.wrapper}>
      <div className="flex gap-3">
        {t.icon}
        <div className="min-w-0">
          {title && <p className={`text-[13px] font-semibold ${t.title} mb-0.5`}>{title}</p>}
          {message && <p className={`text-xs leading-relaxed ${t.msg}`}>{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default AlertBanner;
