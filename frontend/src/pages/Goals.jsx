import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { GOAL_CATEGORIES } from '../utils/constants';
import { formatDate, formatINR, formatPercent, toInputDate, getTodayInput, getTomorrowInput } from '../utils/currency';
import { ConfirmDialog, Disclaimer, EmptyState, PageHeader, ProgressBar, Spinner } from '../components/ui';
const goalPhotos = {
  Education: '/images/education.jpg',
  House: '/images/house.jpg',
  Vehicle: '/images/vehicle.jpg',
  Medical: '/images/medical.jpg',
  Retirement: '/images/retirement.jpg',
  'Emergency Fund': '/images/savings.jpg',
  Marriage: '/images/family.jpg',
  Travel: '/images/family.jpg',
  Business: '/images/planning.jpg',
  Other: '/images/savings.jpg',
};
import { INVESTMENT_DISCLAIMER } from '../utils/finance';
import { useToast } from '../context/ToastContext';

const blank = {
  goalName: '', goalCategory: 'House', currentCost: '', years: '10', inflationRate: '6',
  currentGoalSavings: '', expectedReturn: '', targetDate: '', notes: '',
};

const dateFromYears = (years) => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + Number(years || 0));
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

export default function Goals() {
  const { push } = useToast();
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({ ...blank, targetDate: dateFromYears(10) });
  const [editing, setEditing] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removeId, setRemoveId] = useState(null);

  const load = () => API.get('/goals').then((response) => setGoals(response.data.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const setYears = (years) => setForm((current) => ({ ...current, years, targetDate: dateFromYears(years) }));

  const calculate = async (event) => {
    event.preventDefault();
    if (form.targetDate && form.targetDate < getTodayInput()) {
      push('Target date cannot be in the past.', 'error');
      return;
    }
    try {
      const response = await API.post('/goals/preview', form);
      setPreview({ ...response.data.goal, ...response.data.data });
    } catch (error) {
      push(error.response?.data?.message || 'Check the goal details.', 'error');
    }
  };

  const save = async () => {
    if (form.targetDate && form.targetDate < getTodayInput()) {
      push('Target date cannot be in the past.', 'error');
      return;
    }
    try {
      const response = editing ? await API.put(`/goals/${editing}`, form) : await API.post('/goals', form);
      push(response.data.message);
      setPreview(null);
      setEditing(null);
      setForm({ ...blank, targetDate: dateFromYears(10) });
      load();
    } catch (error) {
      push(error.response?.data?.message || 'Could not save goal.', 'error');
    }
  };

  const edit = (goal) => {
    setEditing(goal._id);
    setPreview(null);
    setForm({
      goalName: goal.goalName,
      goalCategory: goal.goalCategory,
      currentCost: goal.currentCost,
      years: goal.years,
      inflationRate: goal.inflationRate,
      currentGoalSavings: goal.currentGoalSavings,
      expectedReturn: goal.expectedReturn ?? '',
      targetDate: toInputDate(goal.targetDate),
      notes: goal.notes || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="mb-6 grid items-center gap-4 rounded-xl bg-[#DDF8FB] p-5 md:grid-cols-[1fr_240px]">
        <PageHeader title="My Financial Goals" subtitle="Inflation changes the future cost. InflationWise estimates the monthly amount to set aside." />
        <img src="/images/house.jpg" alt="" className="hidden h-28 w-full rounded-lg object-cover md:block" />
      </div>
      <form className="card grid gap-4 p-6 md:grid-cols-2" onSubmit={calculate}>
        <label className="text-sm font-medium">Goal Name<input className="input mt-1" placeholder="Dream House" value={form.goalName} onChange={(event) => setForm({ ...form, goalName: event.target.value })} /></label>
        <label className="text-sm font-medium">Goal Category<select className="input mt-1" value={form.goalCategory} onChange={(event) => setForm({ ...form, goalCategory: event.target.value })}>{GOAL_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="text-sm font-medium">Current Cost<input className="input mt-1" type="number" min="0" placeholder="5000000" value={form.currentCost} onChange={(event) => setForm({ ...form, currentCost: event.target.value })} /></label>
        <label className="text-sm font-medium">Target Years<input className="input mt-1" type="number" min="1" value={form.years} onChange={(event) => setYears(event.target.value)} /></label>
        <label className="text-sm font-medium">Inflation Rate (%)<input className="input mt-1" type="number" min="0" step="0.1" value={form.inflationRate} onChange={(event) => setForm({ ...form, inflationRate: event.target.value })} /></label>
        <label className="text-sm font-medium">Current Savings for Goal<input className="input mt-1" type="number" min="0" placeholder="500000" value={form.currentGoalSavings} onChange={(event) => setForm({ ...form, currentGoalSavings: event.target.value })} /></label>
        <label className="text-sm font-medium">Expected Investment Return - Optional<input className="input mt-1" type="number" min="0" step="0.1" placeholder="12" value={form.expectedReturn} onChange={(event) => setForm({ ...form, expectedReturn: event.target.value })} /></label>
        <label className="text-sm font-medium">Target Date<input className="input mt-1" type="date" min={getTodayInput()} value={form.targetDate} onChange={(event) => setForm({ ...form, targetDate: event.target.value, years: '' })} /></label>
        <label className="text-sm font-medium md:col-span-2">Notes<textarea className="input mt-1" rows="2" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>
        <div className="md:col-span-2"><button className="btn-primary" type="submit">Calculate Goal</button></div>
      </form>

      {preview && (
        <section className="card mt-6 bg-[#20205A] p-6 text-white">
          <p className="text-sm text-white/80">Goal</p>
          <h3 className="font-display text-2xl font-bold">{preview.goalName}</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <p>Current Cost<br /><strong>{formatINR(preview.currentCost)}</strong></p>
            <p>Inflation Rate<br /><strong>{preview.inflationRate}%</strong></p>
            <p>Time<br /><strong>{preview.years} Years</strong></p>
            <p>Future Estimated Cost<br /><strong>{formatINR(preview.futureCost)}</strong></p>
            <p>Current Goal Savings<br /><strong>{formatINR(preview.currentGoalSavings)}</strong></p>
            <p>Required Monthly Saving<br /><strong>{formatINR(preview.requiredMonthlySaving)}</strong></p>
            <p>Remaining Amount<br /><strong>{formatINR(preview.remainingAmount)}</strong></p>
            <p>Months Remaining<br /><strong>{preview.monthsRemaining}</strong></p>
            <p>Target Date<br /><strong>{formatDate(preview.targetDate)}</strong></p>
          </div>
          <p className="mt-4 text-sm">You should save approximately {formatINR(preview.requiredMonthlySaving)} per month to achieve this goal.</p>
          {preview.estimatedMonthlyInvestment !== null && preview.estimatedMonthlyInvestment !== undefined && (
            <p className="mt-2 text-sm">Estimated monthly investment: {formatINR(preview.estimatedMonthlyInvestment)}. {INVESTMENT_DISCLAIMER}</p>
          )}
          <p className="mt-3 text-xs text-white/75">This is an estimated value based on the entered inflation rate.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="btn-primary" type="button" onClick={save}>{editing ? 'Update Goal' : 'Save Goal'}</button>
            <button className="rounded-[10px] border border-white px-4 py-2 text-sm" type="button" onClick={() => setPreview(null)}>Edit Goal</button>
          </div>
        </section>
      )}

      <div className="mt-8 grid gap-4">
        {goals.length === 0 && <EmptyState title="No financial goals created yet." text="Start by creating your first financial goal." />}
        {goals.map((goal) => (
          <article key={goal._id} className="card overflow-hidden p-0">
            <img src={goalPhotos[goal.goalCategory] || '/images/savings.jpg'} alt="" className="h-32 w-full object-cover" />
            <div className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#16C7D9]">{goal.goalCategory}</p>
                <h3 className="font-display text-xl font-bold text-[#20205A]">{goal.goalName}</h3>
              </div>
              <p className="text-sm font-semibold text-[#3155C6]">{formatPercent(goal.progress)}</p>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-[#64748B] sm:grid-cols-2 lg:grid-cols-4">
              <p>Future cost: <span className="font-semibold text-[#1E293B]">{formatINR(goal.futureCost)}</span></p>
              <p>Saved: <span className="font-semibold text-[#1E293B]">{formatINR(goal.savedAmount)}</span></p>
              <p>Monthly target: <span className="font-semibold text-[#1E293B]">{formatINR(goal.requiredMonthlySaving)}</span></p>
              <p>Target date: <span className="font-semibold text-[#1E293B]">{formatDate(goal.targetDate)}</span></p>
            </div>
            <div className="mt-4"><ProgressBar value={goal.progress} /></div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="btn-secondary" type="button" onClick={() => edit(goal)}>Edit Goal</button>
              <button className="btn-secondary" type="button" onClick={() => setRemoveId(goal._id)}>Delete Goal</button>
              <button className="btn-primary" type="button" onClick={() => navigate('/savings')}>View Savings Plan</button>
            </div>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-4"><Disclaimer /></div>
      <ConfirmDialog open={Boolean(removeId)} title="Delete goal" message="Delete this financial goal?" confirmText="Delete" danger onClose={() => setRemoveId(null)} onConfirm={async () => {
        await API.delete(`/goals/${removeId}`);
        setRemoveId(null);
        push('Goal deleted successfully.');
        load();
      }} />
    </div>
  );
}
