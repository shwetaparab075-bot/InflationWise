import React, { useState, useEffect } from 'react';
import { Scale, CheckCircle2, AlertOctagon, Edit3, Save } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import API from '../services/api';
import Modal from '../components/common/Modal';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

const PlannedVsActual = () => {
  const [data, setData] = useState({
    totalPlanned: 58500,
    totalActual: 53000,
    difference: 5500,
    comparison: [],
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newPlannedAmount, setNewPlannedAmount] = useState('');

  const fetchPlannedVsActual = async () => {
    try {
      const res = await API.get('/expenses/planned-vs-actual');
      if (res.data.success && res.data.comparison) {
        setData({
          totalPlanned: res.data.totalPlanned,
          totalActual: res.data.totalActual,
          difference: res.data.difference,
          comparison: res.data.comparison,
        });
      }
    } catch (err) {
      console.warn('Using default comparison metrics');
      setData({
        totalPlanned: 58500,
        totalActual: 53000,
        difference: 5500,
        comparison: [
          { category: 'Housing', planned: 22000, actual: 22000, difference: 0, status: 'Within Budget' },
          { category: 'Food', planned: 10000, actual: 12500, difference: -2500, status: 'Over Budget' },
          { category: 'Transportation', planned: 5000, actual: 4500, difference: 500, status: 'Within Budget' },
          { category: 'Utilities', planned: 3500, actual: 3200, difference: 300, status: 'Within Budget' },
          { category: 'Healthcare', planned: 5000, actual: 4800, difference: 200, status: 'Within Budget' },
          { category: 'Entertainment', planned: 4000, actual: 3000, difference: 1000, status: 'Within Budget' },
          { category: 'Shopping', planned: 6000, actual: 3000, difference: 3000, status: 'Within Budget' },
        ],
      });
    }
  };

  useEffect(() => {
    fetchPlannedVsActual();
  }, []);

  const handleEditPlanned = (item) => {
    setSelectedCategory(item.category);
    setNewPlannedAmount(item.planned);
    setIsEditModalOpen(true);
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    try {
      await API.post('/expenses/planned-budget', {
        category: selectedCategory,
        plannedAmount: Number(newPlannedAmount),
      });
      fetchPlannedVsActual();
      setIsEditModalOpen(false);
    } catch (err) {
      setIsEditModalOpen(false);
    }
  };

  const formatINR = (val) => '₹' + Number(val || 0).toLocaleString('en-IN');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="page-title">Planned vs Actual Expenses</h1>
        <p className="section-subtitle">Compare budgeted spending caps against real recorded expenses.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Total Planned Budget"
          value={formatINR(data.totalPlanned)}
          subtitle="Sum of planned caps"
          icon={Scale}
          accentColor="blue"
        />
        <StatCard
          title="Total Actual Spending"
          value={formatINR(data.totalActual)}
          subtitle="Real logged expenses"
          icon={Scale}
          accentColor="purple"
        />
        <StatCard
          title="Budget Variance"
          value={formatINR(Math.abs(data.difference))}
          subtitle={data.difference >= 0 ? 'Under planned budget (Saved)' : 'Over planned budget'}
          icon={Scale}
          accentColor={data.difference >= 0 ? 'emerald' : 'red'}
        />
      </div>

      {/* Comparison Bar Chart */}
      <div className="card p-6 space-y-4">
        <h3 className="section-title">Planned vs Actual Comparison (Bar Chart)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.comparison}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="category" tickLine={false} />
              <YAxis tickFormatter={(v) => `₹${v / 1000}k`} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v) => [formatINR(v), '']} />
              <Legend />
              <Bar dataKey="planned" fill="#2478E8" radius={[6, 6, 0, 0]} name="Planned Cap" />
              <Bar dataKey="actual" fill="#67B7FF" radius={[6, 6, 0, 0]} name="Actual Spent" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table Section */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="section-title">Category Budget Performance Table</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="table-header">
                <th className="table-cell">Category</th>
                <th className="table-cell">Planned</th>
                <th className="table-cell">Actual</th>
                <th className="table-cell">Difference</th>
                <th className="table-cell">Status</th>
                <th className="table-cell text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.comparison.map((item) => (
                <tr key={item.category} className="table-row">
                  <td className="table-cell font-bold text-[#10233F]">{item.category}</td>
                  <td className="table-cell font-semibold text-[#10233F]">{formatINR(item.planned)}</td>
                  <td className="table-cell font-semibold text-[#10233F]">{formatINR(item.actual)}</td>
                  <td className={`table-cell font-semibold ${item.difference >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {item.difference >= 0 ? `+${formatINR(item.difference)}` : formatINR(item.difference)}
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${item.status === 'Within Budget' ? 'badge-emerald' : 'badge-red'}`}>
                      {item.status === 'Within Budget' ? (
                        <><CheckCircle2 className="h-3 w-3 inline mr-1" /> Within Budget</>
                      ) : (
                        <><AlertOctagon className="h-3 w-3 inline mr-1" /> Over Budget</>
                      )}
                    </span>
                  </td>
                  <td className="table-cell text-right">
                    <button
                      onClick={() => handleEditPlanned(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#2478E8] hover:bg-[#F4F9FF]"
                      title="Edit Planned Budget"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Planned Budget Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Set Planned Budget for ${selectedCategory}`}
      >
        <form onSubmit={handleSaveBudget} className="space-y-4">
          <div>
            <label className="input-label">Planned Monthly Budget Cap (₹)</label>
            <input
              type="number"
              required
              min="0"
              value={newPlannedAmount}
              onChange={(e) => setNewPlannedAmount(e.target.value)}
              className="input"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Save className="h-4 w-4" /> Save Budget Cap
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PlannedVsActual;
