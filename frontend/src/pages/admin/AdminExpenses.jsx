import React, { useEffect, useMemo, useState } from 'react';
import adminApi from '../../services/adminApi';
import { EXPENSE_CATEGORIES, EXPENSE_TYPES } from '../../utils/constants';
import { formatINR } from '../../utils/currency';
import { ConfirmDialog, Modal, PageHeader, Spinner } from '../../components/ui';
import { useToast } from '../../context/ToastContext';

export default function AdminExpenses() {
  const { push } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', user: '', category: '', type: '' });
  const [viewing, setViewing] = useState(null);
  const [removeId, setRemoveId] = useState(null);

  const load = () => adminApi.get('/admin/expenses').then((response) => setRows(response.data.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const users = useMemo(() => [...new Set(rows.map((row) => row.userName))].sort(), [rows]);
  const filtered = useMemo(() => rows.filter((row) => {
    if (filters.search && !`${row.expenseName} ${row.notes}`.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.user && row.userName !== filters.user) return false;
    if (filters.category && row.category !== filters.category) return false;
    if (filters.type && row.expenseType !== filters.type) return false;
    return true;
  }), [rows, filters]);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Expenses" subtitle="Expense records across users." />
      <div className="card mb-6 grid gap-3 p-4 md:grid-cols-4">
        <input className="input" placeholder="Search expenses" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} />
        <select className="input" value={filters.user} onChange={(event) => setFilters({ ...filters, user: event.target.value })}>
          <option value="">All users</option>
          {users.map((name) => <option key={name}>{name}</option>)}
        </select>
        <select className="input" value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}>
          <option value="">All categories</option>
          {EXPENSE_CATEGORIES.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select className="input" value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })}>
          <option value="">All types</option>
          {EXPENSE_TYPES.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <div className="card overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#20205A] text-white">
            <tr>{['User', 'Expense Name', 'Amount', 'Category', 'Expense Type', 'Notes', 'Actions'].map((head) => <th key={head} className="px-4 py-3 font-semibold">{head}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="border-t border-[#E6EEF3]">
                <td className="px-4 py-3">{row.userName}</td>
                <td className="px-4 py-3">{row.expenseName}</td>
                <td className="px-4 py-3">{formatINR(row.amount)}</td>
                <td className="px-4 py-3">{row.category}</td>
                <td className="px-4 py-3">{row.expenseType}</td>
                <td className="px-4 py-3">{row.notes || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="text-[#3155C6]" type="button" onClick={() => setViewing(row)}>View</button>
                    <button className="text-[#20205A]" type="button" onClick={() => setRemoveId(row.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td className="px-4 py-6 text-[#6B7280]" colSpan="7">No expenses found.</td></tr>}
          </tbody>
        </table>
      </div>
      <Modal open={Boolean(viewing)} title="Expense details" onClose={() => setViewing(null)}>
        {viewing && (
          <div className="space-y-2 text-sm">
            <p><strong>{viewing.expenseName}</strong></p>
            <p>{viewing.userName}</p>
            <p>{viewing.category} · {viewing.expenseType}</p>
            <p>{formatINR(viewing.amount)}</p>
            <p className="text-[#6B7280]">{viewing.notes || 'No notes'}</p>
          </div>
        )}
      </Modal>
      <ConfirmDialog
        open={Boolean(removeId)}
        title="Delete expense"
        message="Delete this expense record?"
        confirmText="Delete"
        danger
        onClose={() => setRemoveId(null)}
        onConfirm={async () => {
          await adminApi.delete(`/admin/expenses/${removeId}`);
          setRemoveId(null);
          push('Expense deleted successfully.');
          load();
        }}
      />
    </div>
  );
}
