import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { SAVING_TYPES } from '../utils/constants';
import { formatDate, formatINR, toInputDate, getTodayInput } from '../utils/currency';
import { ConfirmDialog, EmptyState, Modal, PageHeader, Spinner, StatCard } from '../components/ui';
import { ChartCard, SavingsGrowthChart } from '../components/charts';
import { useToast } from '../context/ToastContext';

const blank = { savingName: '', savingType: 'Bank Savings', amount: '', monthlyContribution: '', startDate: '', linkedGoal: '', notes: '' };

export default function Savings() {
  const { push } = useToast();
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({ total: 0, monthly: 0 });
  const [goals, setGoals] = useState([]);
  const [report, setReport] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [removeId, setRemoveId] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [savingsRes, goalsRes, reportRes] = await Promise.all([
      API.get('/savings'), API.get('/goals'), API.get('/reports'),
    ]);
    setRows(savingsRes.data.data);
    setSummary(savingsRes.data.summary);
    setGoals(goalsRes.data.data);
    setReport(reportRes.data.data.savingsGrowth || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...form, linkedGoal: form.linkedGoal || null };
      const response = editing ? await API.put(`/savings/${editing}`, payload) : await API.post('/savings', payload);
      push(response.data.message);
      setForm(blank);
      setEditing(null);
      load();
    } catch (error) {
      push(error.response?.data?.message || 'Could not save.', 'error');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Savings Plan" subtitle="Link a savings account to a goal to update its progress." />
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <StatCard label="Total Savings" value={formatINR(summary.total)} tone="purple" icon={<span>₹</span>} />
        <StatCard label="Monthly Contributions" value={formatINR(summary.monthly)} tone="blue" icon={<span>₹</span>} />
      </div>
      <form className="card mb-6 grid gap-4 p-6 md:grid-cols-2" onSubmit={save}>
        <label className="text-sm font-medium">Savings Name<input className="input mt-1" value={form.savingName} onChange={(event) => setForm({ ...form, savingName: event.target.value })} /></label>
        <label className="text-sm font-medium">Savings Type<select className="input mt-1" value={form.savingType} onChange={(event) => setForm({ ...form, savingType: event.target.value })}>{SAVING_TYPES.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="text-sm font-medium">Current Amount<input className="input mt-1" type="number" min="0" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></label>
        <label className="text-sm font-medium">Monthly Contribution<input className="input mt-1" type="number" min="0" value={form.monthlyContribution} onChange={(event) => setForm({ ...form, monthlyContribution: event.target.value })} /></label>
        <label className="text-sm font-medium">Start Date<input className="input mt-1" type="date" min={getTodayInput()} value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} /></label>
        <label className="text-sm font-medium">Goal Linked<select className="input mt-1" value={form.linkedGoal} onChange={(event) => setForm({ ...form, linkedGoal: event.target.value })}><option value="">None</option>{goals.map((goal) => <option key={goal._id} value={goal._id}>{goal.goalName}</option>)}</select></label>
        <label className="text-sm font-medium md:col-span-2">Notes<textarea className="input mt-1" rows="2" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>
        <div><button className="btn-primary" type="submit">{editing ? 'Update Savings' : 'Add Savings'}</button></div>
      </form>
      {rows.length === 0 ? <EmptyState title="No savings records yet." text="Add a savings account to start a plan." /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((row) => (
            <article key={row._id} className="card p-5">
              <p className="text-xs font-semibold text-[#16C7D9]">{row.savingType}</p>
              <h3 className="font-display text-lg font-bold">{row.savingName}</h3>
              <p className="mt-2 text-sm text-[#64748B]">Current {formatINR(row.amount)} · Monthly {formatINR(row.monthlyContribution)}</p>
              <p className="text-sm text-[#64748B]">Started {formatDate(row.startDate)} · {row.linkedGoal?.goalName || 'No linked goal'}</p>
              <div className="mt-3 flex gap-3 text-sm">
                <button type="button" className="text-[#3155C6]" onClick={() => setViewing(row)}>View</button>
                <button type="button" className="text-[#20205A]" onClick={() => { setEditing(row._id); setForm({ savingName: row.savingName, savingType: row.savingType, amount: row.amount, monthlyContribution: row.monthlyContribution, startDate: toInputDate(row.startDate), linkedGoal: row.linkedGoal?._id || '', notes: row.notes || '' }); }}>Edit</button>
                <button type="button" className="text-[#20205A]" onClick={() => setRemoveId(row._id)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
      <div className="mt-6">
        <ChartCard title="Savings growth" empty={!report.some((item) => item.amount) ? 'Add savings to see this chart.' : ''}><SavingsGrowthChart data={report} /></ChartCard>
      </div>
      <Modal open={Boolean(viewing)} title="Savings details" onClose={() => setViewing(null)}>
        {viewing && <div className="space-y-1 text-sm"><p className="font-semibold">{viewing.savingName}</p><p>{viewing.notes || 'No notes'}</p></div>}
      </Modal>
      <ConfirmDialog open={Boolean(removeId)} title="Delete savings" message="Delete this savings record?" confirmText="Delete" danger onClose={() => setRemoveId(null)} onConfirm={async () => { await API.delete(`/savings/${removeId}`); setRemoveId(null); push('Savings record deleted successfully.'); load(); }} />
    </div>
  );
}
