import React, { useEffect, useMemo, useState } from 'react';
import adminApi from '../../services/adminApi';
import { SAVING_TYPES } from '../../utils/constants';
import { formatINR } from '../../utils/currency';
import { Modal, PageHeader, Spinner } from '../../components/ui';

export default function AdminSavings() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    adminApi.get('/admin/savings').then((response) => setRows(response.data.data)).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => rows.filter((row) => {
    if (search && !`${row.savingName} ${row.userName} ${row.linkedGoal}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (type && row.savingType !== type) return false;
    return true;
  }), [rows, search, type]);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Savings" subtitle="Savings records across users." />
      <div className="card mb-6 grid gap-3 p-4 md:grid-cols-2">
        <input className="input" placeholder="Search savings" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select className="input" value={type} onChange={(event) => setType(event.target.value)}>
          <option value="">All types</option>
          {SAVING_TYPES.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <div className="card overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#20205A] text-white">
            <tr>{['User', 'Savings Name', 'Savings Type', 'Current Amount', 'Monthly Saving', 'Linked Goal', 'Actions'].map((head) => <th key={head} className="px-4 py-3 font-semibold">{head}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="border-t border-[#E6EEF3]">
                <td className="px-4 py-3">{row.userName}</td>
                <td className="px-4 py-3">{row.savingName}</td>
                <td className="px-4 py-3">{row.savingType}</td>
                <td className="px-4 py-3">{formatINR(row.amount)}</td>
                <td className="px-4 py-3">{formatINR(row.monthlyContribution)}</td>
                <td className="px-4 py-3">{row.linkedGoal}</td>
                <td className="px-4 py-3"><button className="text-[#3155C6]" type="button" onClick={() => setViewing(row)}>View</button></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td className="px-4 py-6 text-[#6B7280]" colSpan="7">No savings found.</td></tr>}
          </tbody>
        </table>
      </div>
      <Modal open={Boolean(viewing)} title="Savings details" onClose={() => setViewing(null)}>
        {viewing && (
          <div className="space-y-2 text-sm">
            <p><strong>{viewing.savingName}</strong></p>
            <p>{viewing.userName}</p>
            <p>{viewing.savingType}</p>
            <p>Current amount: {formatINR(viewing.amount)}</p>
            <p>Monthly saving: {formatINR(viewing.monthlyContribution)}</p>
            <p>Linked goal: {viewing.linkedGoal}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
