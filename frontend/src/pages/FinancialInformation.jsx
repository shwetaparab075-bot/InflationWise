import React, { useState, useEffect } from 'react';
import { Wallet, Save, Edit3, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import API from '../services/api';

const FinancialInformation = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    monthlyIncome: 85000,
    additionalIncome: 12000,
    fixedExpenses: 32000,
    variableExpenses: 18000,
    currentSavings: 180000,
    currentInvestments: 250000,
    existingEMI: 12000,
    monthlySavingsTarget: 35000,
    dependents: 2,
  });

  const [summary, setSummary] = useState({
    totalIncome: 97000,
    totalExpenses: 62000,
    monthlySavings: 35000,
    savingsRate: 36,
  });

  useEffect(() => {
    const fetchFinancialProfile = async () => {
      try {
        const res = await API.get('/financial');
        if (res.data.success && res.data.profile) {
          const p = res.data.profile;
          setFormData({
            monthlyIncome: p.monthlyIncome || 0,
            additionalIncome: p.additionalIncome || 0,
            fixedExpenses: p.fixedExpenses || 0,
            variableExpenses: p.variableExpenses || 0,
            currentSavings: p.currentSavings || 0,
            currentInvestments: p.currentInvestments || 0,
            existingEMI: p.existingEMI || 0,
            monthlySavingsTarget: p.monthlySavingsTarget || 0,
            dependents: p.dependents || 0,
          });
          if (res.data.summary) {
            setSummary(res.data.summary);
          }
        }
      } catch (err) {
        console.warn('Using initial financial profile state');
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value) >= 0 ? Number(value) : 0,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await API.post('/financial', formData);
      if (res.data.success) {
        if (res.data.summary) setSummary(res.data.summary);
        setSuccessMsg('Financial information updated successfully!');
        setIsEditing(false);
      } else {
        setErrorMsg('Failed to update financial profile.');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to backend server. Saved locally.');
      // Local calculation fallback
      const totalInc = (formData.monthlyIncome || 0) + (formData.additionalIncome || 0);
      const totalExp = (formData.fixedExpenses || 0) + (formData.variableExpenses || 0) + (formData.existingEMI || 0);
      const sav = Math.max(0, totalInc - totalExp);
      const rate = totalInc > 0 ? Math.round((sav / totalInc) * 100) : 0;
      setSummary({
        totalIncome: totalInc,
        totalExpenses: totalExp,
        monthlySavings: sav,
        savingsRate: rate,
      });
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const formatINR = (val) => '₹' + Number(val || 0).toLocaleString('en-IN');

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Financial Information</h1>
          <p className="section-subtitle">Define your income, expenses, savings, and financial commitments.</p>
        </div>
        <div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary gap-2"
            >
              <Edit3 className="h-4 w-4" /> Edit Profile
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="btn-secondary text-xs py-2"
            >
              Cancel Editing
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-2.5 text-xs text-emerald-800">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-center gap-2.5 text-xs text-amber-800">
          <AlertCircle className="h-4.5 w-4.5 text-amber-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Monthly Income"
          value={formatINR(summary.totalIncome)}
          subtitle="Fixed + Additional Income"
          icon={Wallet}
          accentColor="blue"
        />
        <StatCard
          title="Total Monthly Expenses"
          value={formatINR(summary.totalExpenses)}
          subtitle="Fixed + Variable + EMI"
          icon={Wallet}
          accentColor="orange"
        />
        <StatCard
          title="Monthly Savings Surplus"
          value={formatINR(summary.monthlySavings)}
          subtitle="Calculated Net Surplus"
          icon={Wallet}
          accentColor="emerald"
        />
        <StatCard
          title="Savings Rate"
          value={`${summary.savingsRate}%`}
          subtitle="Target: 35%+"
          icon={Wallet}
          accentColor="purple"
        />
      </div>

      {/* Form Card */}
      <form onSubmit={handleSave} className="card p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="section-title">Income & Expense Inputs</h3>
          <p className="text-xs text-[#6B7A90] mt-0.5">Keep this updated to improve inflation predictions and goal plans.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Monthly Income */}
          <div>
            <label className="input-label">Monthly Income (₹)</label>
            <input
              type="number"
              name="monthlyIncome"
              disabled={!isEditing}
              value={formData.monthlyIncome}
              onChange={handleChange}
              className="input disabled:bg-slate-50 disabled:text-slate-600"
              required
            />
          </div>

          {/* Additional Income */}
          <div>
            <label className="input-label">Additional Income (₹)</label>
            <input
              type="number"
              name="additionalIncome"
              disabled={!isEditing}
              value={formData.additionalIncome}
              onChange={handleChange}
              className="input disabled:bg-slate-50 disabled:text-slate-600"
            />
          </div>

          {/* Fixed Expenses */}
          <div>
            <label className="input-label">Fixed Expenses (₹)</label>
            <input
              type="number"
              name="fixedExpenses"
              disabled={!isEditing}
              value={formData.fixedExpenses}
              onChange={handleChange}
              className="input disabled:bg-slate-50 disabled:text-slate-600"
            />
          </div>

          {/* Variable Expenses */}
          <div>
            <label className="input-label">Variable Expenses (₹)</label>
            <input
              type="number"
              name="variableExpenses"
              disabled={!isEditing}
              value={formData.variableExpenses}
              onChange={handleChange}
              className="input disabled:bg-slate-50 disabled:text-slate-600"
            />
          </div>

          {/* Existing EMI */}
          <div>
            <label className="input-label">Existing EMI / Loans (₹)</label>
            <input
              type="number"
              name="existingEMI"
              disabled={!isEditing}
              value={formData.existingEMI}
              onChange={handleChange}
              className="input disabled:bg-slate-50 disabled:text-slate-600"
            />
          </div>

          {/* Current Savings */}
          <div>
            <label className="input-label">Current Savings (₹)</label>
            <input
              type="number"
              name="currentSavings"
              disabled={!isEditing}
              value={formData.currentSavings}
              onChange={handleChange}
              className="input disabled:bg-slate-50 disabled:text-slate-600"
            />
          </div>

          {/* Current Investments */}
          <div>
            <label className="input-label">Current Investments (₹)</label>
            <input
              type="number"
              name="currentInvestments"
              disabled={!isEditing}
              value={formData.currentInvestments}
              onChange={handleChange}
              className="input disabled:bg-slate-50 disabled:text-slate-600"
            />
          </div>

          {/* Monthly Savings Target */}
          <div>
            <label className="input-label">Monthly Savings Target (₹)</label>
            <input
              type="number"
              name="monthlySavingsTarget"
              disabled={!isEditing}
              value={formData.monthlySavingsTarget}
              onChange={handleChange}
              className="input disabled:bg-slate-50 disabled:text-slate-600"
            />
          </div>

          {/* Dependents */}
          <div>
            <label className="input-label">Number of Dependents</label>
            <input
              type="number"
              name="dependents"
              disabled={!isEditing}
              value={formData.dependents}
              onChange={handleChange}
              className="input disabled:bg-slate-50 disabled:text-slate-600"
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" /> Saving…
                </span>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Financial Info
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default FinancialInformation;
