import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Trash2, Edit2, CreditCard, Calendar, Receipt, Tag, AlertCircle } from 'lucide-react';
import API from '../services/api';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';

const CATEGORIES = [
  'Food', 'Housing', 'Transportation', 'Education', 'Healthcare',
  'Shopping', 'Entertainment', 'Utilities', 'EMI', 'Insurance', 'Other'
];

const PAYMENT_METHODS = ['UPI / Net Banking', 'Credit Card', 'Debit Card', 'Cash', 'Other'];

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'UPI / Net Banking',
    description: '',
  });

  const fetchExpenses = async () => {
    try {
      const res = await API.get('/expenses');
      if (res.data.success && res.data.expenses) {
        setExpenses(res.data.expenses);
      }
    } catch (err) {
      console.warn('Using initial expense list fallback');
      setExpenses([
        { _id: '1', name: 'Apartment Rent', amount: 22000, category: 'Housing', date: '2026-09-02', paymentMethod: 'UPI / Net Banking', description: 'Monthly rent' },
        { _id: '2', name: 'Supermarket Groceries', amount: 8500, category: 'Food', date: '2026-09-05', paymentMethod: 'Credit Card', description: 'Pantry items' },
        { _id: '3', name: 'Car Petrol Refill', amount: 4500, category: 'Transportation', date: '2026-09-08', paymentMethod: 'UPI / Net Banking', description: 'Fuel' },
        { _id: '4', name: 'Electricity & Wifi', amount: 3200, category: 'Utilities', date: '2026-09-10', paymentMethod: 'UPI / Net Banking', description: 'Utility bills' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      amount: '',
      category: 'Food',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'UPI / Net Banking',
      description: '',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (exp) => {
    setEditingId(exp._id);
    setFormData({
      name: exp.name,
      amount: exp.amount,
      category: exp.category,
      date: exp.date ? new Date(exp.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      paymentMethod: exp.paymentMethod || 'UPI / Net Banking',
      description: exp.description || '',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await API.delete(`/expenses/${id}`);
      setExpenses((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setExpenses((prev) => prev.filter((item) => item._id !== id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      if (editingId) {
        const res = await API.put(`/expenses/${editingId}`, formData);
        if (res.data.success) {
          setExpenses((prev) => prev.map((item) => (item._id === editingId ? res.data.expense : item)));
        }
      } else {
        const res = await API.post('/expenses', formData);
        if (res.data.success) {
          setExpenses((prev) => [res.data.expense, ...prev]);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      // Fallback local update
      const newExp = {
        _id: editingId || 'local_' + Date.now(),
        ...formData,
        amount: Number(formData.amount),
      };
      if (editingId) {
        setExpenses((prev) => prev.map((item) => (item._id === editingId ? newExp : item)));
      } else {
        setExpenses((prev) => [newExp, ...prev]);
      }
      setIsModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch = exp.name.toLowerCase().includes(search.toLowerCase()) ||
                          exp.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || exp.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalAmount = filteredExpenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const formatINR = (val) => '₹' + Number(val || 0).toLocaleString('en-IN');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Expense Management</h1>
          <p className="section-subtitle">Track, filter, and organize your monthly transactions.</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn-primary gap-2">
          <Plus className="h-4 w-4" /> Add Expense
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by expense name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 text-xs"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7A90]">
            <Filter className="h-4 w-4 text-[#2478E8]" /> Category:
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input text-xs py-2 w-full md:w-48"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="text-right text-xs font-semibold text-[#10233F] whitespace-nowrap">
          Total Filtered: <span className="text-[#2478E8] text-sm font-extrabold">{formatINR(totalAmount)}</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="card overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No expenses added yet."
            description="Start logging your daily transactions to analyze inflation impact."
            actionLabel="Add Your First Expense"
            onAction={handleOpenAddModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="table-header">
                  <th className="table-cell">Expense Name</th>
                  <th className="table-cell">Category</th>
                  <th className="table-cell">Amount</th>
                  <th className="table-cell">Date</th>
                  <th className="table-cell">Payment Method</th>
                  <th className="table-cell text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((exp) => (
                  <tr key={exp._id} className="table-row">
                    <td className="table-cell font-semibold text-[#10233F]">
                      {exp.name}
                      {exp.description && <p className="text-[11px] text-slate-400 font-normal">{exp.description}</p>}
                    </td>
                    <td className="table-cell">
                      <span className="badge badge-blue">{exp.category}</span>
                    </td>
                    <td className="table-cell font-extrabold text-[#10233F]">
                      {formatINR(exp.amount)}
                    </td>
                    <td className="table-cell text-xs text-slate-500">
                      {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="table-cell text-xs text-slate-600">
                      {exp.paymentMethod || 'UPI'}
                    </td>
                    <td className="table-cell text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(exp)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#2478E8] hover:bg-[#F4F9FF] transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(exp._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Expense' : 'Add New Expense'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Expense Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="e.g. Supermarket Groceries"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Amount (₹)</label>
              <input
                type="number"
                required
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="input"
                placeholder="2500"
              />
            </div>

            <div>
              <label className="input-label">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="input-label">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="input"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>{pm}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="input-label">Description (Optional)</label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              placeholder="Add optional notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? 'Saving…' : (editingId ? 'Update Expense' : 'Save Expense')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExpenseManagement;
