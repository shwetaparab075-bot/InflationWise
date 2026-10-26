import React, { useEffect, useMemo, useState } from 'react';
import adminApi from '../../services/adminApi';
import { GOAL_CATEGORIES } from '../../utils/constants';
import { formatINR, formatPercent } from '../../utils/currency';
import { Modal, PageHeader, Spinner } from '../../components/ui';

export default function AdminGoals() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    adminApi.get('/admin/goals').then((response) => setRows(response.data.data)).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => rows.filter((row) => {
    if (search && !`${row.goalName} ${row.userName}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (category && row.goalCategory !== category) return false;
    return true;
  }), [rows, search, category]);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Financial Goals" subtitle="Goals created by InflationWise users." />
      <div className="card mb-6 grid gap-3 p-4 md:grid-cols-2">
        <input className="input" placeholder="Search goals" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select className="input" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">All categories</option>
          {GOAL_CATEGORIES.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <div className="card overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#20205A] text-white">
            <tr>{['User', 'Goal Name', 'Category', 'Current Cost', 'Inflation Rate', 'Years', 'Future Cost', 'Goal Savings', 'Monthly Saving', 'Progress', 'Actions'].map((head) => <th key={head} className="px-3 py-3 font-semibold">{head}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="border-t border-[#E6EEF3]">
                <td className="px-3 py-3">{row.userName}</td>
                <td className="px-3 py-3">{row.goalName}</td>
                <td className="px-3 py-3">{row.goalCategory}</td>
                <td className="px-3 py-3">{formatINR(row.currentCost)}</td>
                <td className="px-3 py-3">{row.inflationRate}%</td>
                <td className="px-3 py-3">{row.years}</td>
                <td className="px-3 py-3">{formatINR(row.futureCost)}</td>
                <td className="px-3 py-3">{formatINR(row.currentGoalSavings)}</td>
                <td className="px-3 py-3">{formatINR(row.requiredMonthlySaving)}</td>
                <td className="px-3 py-3">{formatPercent(row.progress)}</td>
                <td className="px-3 py-3"><button className="text-[#3155C6]" type="button" onClick={() => setViewing(row)}>View</button></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td className="px-3 py-6 text-[#6B7280]" colSpan="11">No goals found.</td></tr>}
          </tbody>
        </table>
      </div>
      <Modal open={Boolean(viewing)} title="Goal details" onClose={() => setViewing(null)}>
        {viewing && (
          <div className="space-y-2 text-sm">
            <p><strong>{viewing.goalName}</strong> · {viewing.userName}</p>
            <p>{viewing.goalCategory}</p>
            <p>Current cost: {formatINR(viewing.currentCost)}</p>
            <p>Inflation rate: {viewing.inflationRate}%</p>
            <p>Years: {viewing.years}</p>
            <p>Future estimated cost: {formatINR(viewing.futureCost)}</p>
            <p>Current goal savings: {formatINR(viewing.currentGoalSavings)}</p>
            <p>Required monthly saving: {formatINR(viewing.requiredMonthlySaving)}</p>
            <p>Goal progress: {formatPercent(viewing.progress)}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
