import React from 'react';
import { DISCLAIMER } from '../utils/finance';

export function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-[#64748B]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#DDF8FB] border-t-[#16C7D9]" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function Disclaimer({ text = DISCLAIMER }) {
  return <p className="text-xs leading-5 text-[#64748B]">{text}</p>;
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#20205A] md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[#64748B]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, text }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#DDD6FE] bg-gradient-to-br from-[#F5F3FF] via-white to-[#ECFEFF] px-6 py-10 text-center">
      <svg viewBox="0 0 160 90" className="mx-auto mb-3 h-20 w-40" aria-hidden>
        <rect x="18" y="28" width="54" height="40" rx="12" fill="#EDE9FE" />
        <text x="45" y="54" textAnchor="middle" fontSize="22" fill="#20205A" fontFamily="Arial">₹</text>
        <ellipse cx="108" cy="58" rx="22" ry="12" fill="#CCFBF1" />
        <rect x="92" y="42" width="32" height="16" rx="8" fill="#14B8A6" />
        <path d="M120 34l14-12 6 5" fill="none" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <p className="font-semibold text-[#20205A]">{title}</p>
      {text && <p className="mt-1 text-sm text-[#64748B]">{text}</p>}
    </div>
  );
}

export function ProgressBar({ value }) {
  const width = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-[#EDE9FE]">
      <div className="h-full rounded-full bg-[#16C7D9] transition-all" style={{ width: `${width}%` }} />
    </div>
  );
}

export function StatusBadge({ status }) {
  const styles = {
    'On Track': 'bg-[#DDF8FB] text-[#20205A]',
    'Behind Target': 'bg-[#EEF2FF] text-[#3155C6]',
    'Ahead of Target': 'bg-[#DDF8FB] text-[#0E8F9C]',
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>;
}

export function Modal({ open, title, onClose, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 p-4 sm:items-center" onClick={onClose}>
      <div className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-lift ${wide ? 'max-w-2xl' : 'max-w-lg'}`} onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="font-display text-lg font-semibold">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-[#64748B] hover:bg-slate-100" aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, title, message, confirmText = 'Confirm', onConfirm, onClose, danger }) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p className="text-sm text-[#64748B]">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button type="button" className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>{confirmText}</button>
      </div>
    </Modal>
  );
}

export function Field({ label, error, children }) {
  return (
    <label className="mb-4 block">
      <span className="label">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-[#DC2626]">{error}</span>}
    </label>
  );
}

export function StatCard({ icon, label, value, hint, tone = 'purple' }) {
  const tones = {
    purple: 'bg-[#DDF8FB] text-[#20205A]',
    blue: 'bg-[#EEF2FF] text-[#3155C6]',
    deep: 'bg-[#20205A] text-white',
    sky: 'bg-[#DDF8FB] text-[#0E8F9C]',
    cyan: 'bg-[#DDF8FB] text-[#0E8F9C]',
    teal: 'bg-[#DDF8FB] text-[#20205A]',
    green: 'bg-[#EEF2FF] text-[#20205A]',
    orange: 'bg-[#DDF8FB] text-[#3155C6]',
    pink: 'bg-[#EEF2FF] text-[#20205A]',
    indigo: 'bg-[#20205A] text-[#16C7D9]',
  };
  return (
    <article className="card overflow-hidden p-5">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg ${tones[tone] || tones.purple}`}>{icon}</div>
      <p className="text-sm text-[#64748B]">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-[#1E293B]">{value}</p>
      {hint && <p className="mt-1 text-xs text-[#64748B]">{hint}</p>}
    </article>
  );
}
