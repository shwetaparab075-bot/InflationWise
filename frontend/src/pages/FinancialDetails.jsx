import React, { useEffect, useMemo, useState } from 'react';
import API from '../services/api';
import { formatINR, formatPercent } from '../utils/currency';
import { Disclaimer, PageHeader, Spinner } from '../components/ui';
import { useToast } from '../context/ToastContext';

const empty = {
  monthlyIncome: '', monthlyExpenses: '', currentSavings: '', monthlySavings: '',
  additionalIncome: '', notes: '',
};

export default function FinancialDetails() {
  const { push } = useToast();
  const [form, setForm] = useState(empty);
  const [saved, setSaved] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = () => API.get('/financial').then((response) => {
    if (response.data.data) {
      const data = response.data.data;
      setSaved(data);
      setForm({
        monthlyIncome: data.monthlyIncome,
        monthlyExpenses: data.monthlyExpenses,
        currentSavings: data.currentSavings,
        monthlySavings: data.monthlySavings,
        additionalIncome: data.additionalIncome,
        notes: data.notes || '',
      });
    }
  }).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    const income = Number(form.monthlyIncome || 0) + Number(form.additionalIncome || 0);
    const expenses = Number(form.monthlyExpenses || 0);
    const savings = Number(form.monthlySavings || 0);
    const pct = (part) => (income > 0 ? (part / income) * 100 : 0);
    return {
      income,
      disposable: income - expenses,
      remaining: income - expenses - savings,
      savingsPct: pct(savings),
      expensePct: pct(expenses),
    };
  }, [form]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await API[saved ? 'put' : 'post']('/financial', form);
      setSaved(response.data.data);
      push(response.data.message);
    } catch (error) {
      push(error.response?.data?.message || 'Could not save details.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    if (!saved) setForm(empty);
    else setForm({
      monthlyIncome: saved.monthlyIncome,
      monthlyExpenses: saved.monthlyExpenses,
      currentSavings: saved.currentSavings,
      monthlySavings: saved.monthlySavings,
      additionalIncome: saved.additionalIncome,
      notes: saved.notes || '',
    });
  };

  if (loading) return <Spinner />;

  const fields = [
    ['monthlyIncome', 'Monthly Income', '50000'],
    ['monthlyExpenses', 'Monthly Expenses', '30000'],
    ['currentSavings', 'Current Savings', '500000'],
    ['monthlySavings', 'Monthly Savings', '10000'],
    ['additionalIncome', 'Additional Income', '0'],
  ];

  return (
    <div>
      <PageHeader title="Financial Information" subtitle="These figures update your dashboard cards." />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <form className="card p-6" onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map(([key, label, placeholder]) => (
              <label key={key} className="block text-sm font-medium">
                {label}
                <input className="input mt-1" type="number" min="0" placeholder={placeholder} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
              </label>
            ))}
          </div>
          <label className="mt-4 block text-sm font-medium">Optional notes
            <textarea className="input mt-1" rows="3" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          </label>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="btn-primary" disabled={busy} type="submit">{busy ? 'Saving...' : saved ? 'Update Details' : 'Save Details'}</button>
            <button className="btn-secondary" type="button" onClick={reset}>Reset</button>
          </div>
        </form>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {[
            ['Income', stats.income],
            ['Disposable Income', stats.disposable],
            ['Remaining Balance', stats.remaining],
            ['Expense Percentage', formatPercent(stats.expensePct)],
            ['Savings Percentage', formatPercent(stats.savingsPct)],
          ].map(([label, value]) => (
            <article key={label} className="card p-4">
              <p className="text-sm text-[#64748B]">{label}</p>
              <p className="font-display text-xl font-bold">{typeof value === 'number' ? formatINR(value) : value}</p>
            </article>
          ))}
        </div>
      </div>
      <div className="mt-4"><Disclaimer /></div>
    </div>
  );
}
