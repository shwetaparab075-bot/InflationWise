import React, { useEffect, useMemo, useState } from 'react';
import API from '../services/api';
import { EXPENSE_CATEGORIES, EXPENSE_TYPES, MONTHS } from '../utils/constants';
import { formatINR } from '../utils/currency';
import { ConfirmDialog, EmptyState, Modal, PageHeader, Spinner, StatCard } from '../components/ui';
import { CategoryPie, ChartCard, SpendingChart } from '../components/charts';
import { useToast } from '../context/ToastContext';

const blank = { expenseName: '', amount: '', category: 'Groceries', expenseType: 'Monthly', notes: '' };
const categoryTone = {
  Rent: 'bg-[#EEF2FF] text-[#20205A]',
  Electricity: 'bg-[#DDF8FB] text-[#20205A]',
  Groceries: 'bg-[#DDF8FB] text-[#0E8F9C]',
  Transport: 'bg-[#EEF2FF] text-[#3155C6]',
  Medical: 'bg-[#DDF8FB] text-[#20205A]',
  Education: 'bg-[#EEF2FF] text-[#20205A]',
  Shopping: 'bg-[#DDF8FB] text-[#3155C6]',
  Entertainment: 'bg-[#EEF2FF] text-[#3155C6]',
  EMI: 'bg-[#DDF8FB] text-[#20205A]',
  'Mobile Recharge': 'bg-[#EEF2FF] text-[#20205A]',
  Internet: 'bg-[#DDF8FB] text-[#0E8F9C]',
  Insurance: 'bg-[#EEF2FF] text-[#20205A]',
  Food: 'bg-[#DDF8FB] text-[#20205A]',
  Other: 'bg-[#F7FAFC] text-[#6B7280]',
};

export default function Expenses() {
  const { push } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [removeId, setRemoveId] = useState(null);
  const [filters, setFilters] = useState({ search: '', category: '', month: '', type: '' });

  const load = () => API.get('/expenses').then((response) => setRows(response.data.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => rows.filter((row) => {
    const created = new Date(row.createdAt);
    if (filters.search && !row.expenseName.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.category && row.category !== filters.category) return false;
    if (filters.type && row.expenseType !== filters.type) return false;
    if (filters.month && created.getMonth() + 1 !== Number(filters.month)) return false;
    return true;
  }), [rows, filters]);

  const daily = filtered.filter((row) => row.expenseType === 'Daily').reduce((sum, row) => sum + row.amount, 0);
  const monthly = filtered.filter((row) => row.expenseType === 'Monthly').reduce((sum, row) => sum + row.amount, 0);
  const byCategory = {};
  filtered.forEach((row) => { byCategory[row.category] = (byCategory[row.category] || 0) + row.amount; });
  const pie = Object.entries(byCategory).map(([name, value]) => ({ name, value }));
  const highest = pie.slice().sort((a, b) => b.value - a.value)[0];
  const byMonth = {};
  filtered.forEach((row) => {
    const label = new Date(row.createdAt).toLocaleString('en-IN', { month: 'short', year: 'numeric' });
    byMonth[label] = (byMonth[label] || 0) + row.amount;
  });
  const bars = Object.entries(byMonth).map(([month, amount]) => ({ month, amount }));

  const save = async (event) => {
    event.preventDefault();
    try {
      const response = editing ? await API.put(`/expenses/${editing}`, form) : await API.post('/expenses', form);
      push(response.data.message);
      setForm(blank);
      setEditing(null);
      load();
    } catch (error) {
      push(error.response?.data?.message || 'Could not save expense.', 'error');
    }
  };

  const startEdit = (row) => {
    setEditing(row._id);
    setForm({
      expenseName: row.expenseName,
      amount: row.amount,
      category: row.category,
      expenseType: row.expenseType,
      notes: row.notes || '',
    });
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Expense Management" subtitle="Add daily or monthly expenses and filter them anytime." />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Total Daily Expenses" value={formatINR(daily)} tone="purple" icon={<span>₹</span>} />
        <StatCard label="Total Monthly Expenses" value={formatINR(monthly)} tone="blue" icon={<span>₹</span>} />
        <StatCard label="Highest Expense Category" value={highest ? highest.name : '—'} hint={highest ? formatINR(highest.value) : ''} tone="deep" icon={<span>₹</span>} />
      </div>
      <form className="card mb-6 grid gap-4 p-6 md:grid-cols-2" onSubmit={save}>
        <label className="text-sm font-medium">Expense Name<input className="input mt-1" placeholder="House Rent" value={form.expenseName} onChange={(event) => setForm({ ...form, expenseName: event.target.value })} /></label>
        <label className="text-sm font-medium">Amount<input className="input mt-1" type="number" min="0" placeholder="10000" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></label>
        <label className="text-sm font-medium">Category<select className="input mt-1" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{EXPENSE_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="text-sm font-medium">Expense Type<select className="input mt-1" value={form.expenseType} onChange={(event) => setForm({ ...form, expenseType: event.target.value })}>{EXPENSE_TYPES.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="text-sm font-medium md:col-span-2">Notes<textarea className="input mt-1" rows="2" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>
        <div className="md:col-span-2"><button className="btn-primary" type="submit">{editing ? 'Update Expense' : 'Add Expense'}</button></div>
      </form>
      <div className="card mb-6 grid gap-3 p-4 md:grid-cols-4">
        <input className="input" placeholder="Search expenses" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} />
        <select className="input" value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}><option value="">All categories</option>{EXPENSE_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select>
        <select className="input" value={filters.month} onChange={(event) => setFilters({ ...filters, month: event.target.value })}><option value="">All months</option>{MONTHS.map((item, index) => <option key={item} value={index + 1}>{item}</option>)}</select>
        <select className="input" value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })}><option value="">All types</option>{EXPENSE_TYPES.map((item) => <option key={item}>{item}</option>)}</select>
      </div>
      {filtered.length === 0 ? <EmptyState title="No expenses added yet." text="Add your first expense using the form above." /> : (
        <div className="card overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#20205A] text-white"><tr>{['Expense Name', 'Category', 'Amount', 'Type', 'Notes', 'Actions'].map((head) => <th key={head} className="px-4 py-3 font-semibold">{head}</th>)}</tr></thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row._id} className="border-t">
                  <td className="px-4 py-3">{row.expenseName}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${categoryTone[row.category] || categoryTone.Other}`}>{row.category}</span></td>
                  <td className="px-4 py-3">{formatINR(row.amount)}</td>
                  <td className="px-4 py-3">{row.expenseType}</td>
                  <td className="px-4 py-3">{row.notes || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="text-[#3155C6]" type="button" onClick={() => setViewing(row)}>View</button>
                      <button className="text-[#20205A]" type="button" onClick={() => startEdit(row)}>Edit</button>
                      <button className="text-[#20205A]" type="button" onClick={() => setRemoveId(row._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Expense Category Pie Chart" empty={!pie.length ? 'No expenses added yet.' : ''}><CategoryPie data={pie} /></ChartCard>
        <ChartCard title="Monthly Expense Bar Chart" empty={!bars.length ? 'No expenses added yet.' : ''}><SpendingChart data={bars} /></ChartCard>
      </div>
      <Modal open={Boolean(viewing)} title="Expense details" onClose={() => setViewing(null)}>
        {viewing && (
          <div className="space-y-2 text-sm">
            <p><strong>{viewing.expenseName}</strong></p>
            <p>{viewing.category} · {viewing.expenseType}</p>
            <p>{formatINR(viewing.amount)}</p>
            <p className="text-[#64748B]">{viewing.notes || 'No notes'}</p>
          </div>
        )}
      </Modal>
      <ConfirmDialog open={Boolean(removeId)} title="Delete expense" message="Delete this expense record?" confirmText="Delete" danger onClose={() => setRemoveId(null)} onConfirm={async () => {
        await API.delete(`/expenses/${removeId}`);
        setRemoveId(null);
        push('Expense deleted successfully.');
        load();
      }} />
    </div>
  );
}
