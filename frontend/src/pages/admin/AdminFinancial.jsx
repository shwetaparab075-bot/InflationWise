import React, { useEffect, useMemo, useState } from 'react';
import adminApi from '../../services/adminApi';
import { formatINR } from '../../utils/currency';
import { Modal, PageHeader, Spinner } from '../../components/ui';

export default function AdminFinancial() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    adminApi.get('/admin/financial').then((response) => setRows(response.data.data)).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => rows.filter((row) => {
    const text = `${row.userName} ${row.email}`.toLowerCase();
    return !search || text.includes(search.toLowerCase());
  }), [rows, search]);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Financial Details" subtitle="Income and savings figures submitted by users." />
      <div className="card mb-6 p-4">
        <input className="input" placeholder="Search by user" value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>
      <div className="card overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#20205A] text-white">
            <tr>{['User Name', 'Monthly Income', 'Monthly Expenses', 'Current Savings', 'Monthly Savings', 'Actions'].map((head) => <th key={head} className="px-4 py-3 font-semibold">{head}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="border-t border-[#E6EEF3]">
                <td className="px-4 py-3">{row.userName}</td>
                <td className="px-4 py-3">{formatINR(row.monthlyIncome)}</td>
                <td className="px-4 py-3">{formatINR(row.monthlyExpenses)}</td>
                <td className="px-4 py-3">{formatINR(row.currentSavings)}</td>
                <td className="px-4 py-3">{formatINR(row.monthlySavings)}</td>
                <td className="px-4 py-3"><button className="text-[#3155C6]" type="button" onClick={() => setViewing(row)}>View Details</button></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td className="px-4 py-6 text-[#6B7280]" colSpan="6">No financial details found.</td></tr>}
          </tbody>
        </table>
      </div>
      <Modal open={Boolean(viewing)} title="Financial details" onClose={() => setViewing(null)}>
        {viewing && (
          <div className="space-y-2 text-sm">
            <p><strong>{viewing.userName}</strong></p>
            <p>{viewing.email}</p>
            <p>Monthly income: {formatINR(viewing.monthlyIncome)}</p>
            <p>Additional income: {formatINR(viewing.additionalIncome)}</p>
            <p>Monthly expenses: {formatINR(viewing.monthlyExpenses)}</p>
            <p>Current savings: {formatINR(viewing.currentSavings)}</p>
            <p>Monthly savings: {formatINR(viewing.monthlySavings)}</p>
            <p className="text-[#6B7280]">{viewing.notes || 'No notes'}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
