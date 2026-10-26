import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useNavigate } from 'react-router-dom';
import InflationImpactChart from '../components/charts/InflationImpactChart';
import { generateInflationProjectionTimeline } from '../utils/inflationCalculator';
import { formatINR } from '../utils/financialCalculator';
import { TrendingUp, Sliders, ShieldAlert, ArrowRight, Save, CheckCircle2 } from 'lucide-react';

const InflationAnalysis = () => {
  const { profile, updateProfile, totalPlannedExpense } = useFinancial();
  const navigate = useNavigate();

  const [rate, setRate] = useState(profile.inflationRate);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({ inflationRate: Number(rate) });
    setSaved(true);
    setTimeout(() => {
      navigate('/future-expense');
    }, 1000);
  };

  const timelineData = generateInflationProjectionTimeline(totalPlannedExpense, rate, 15);

  const sectorBreakdown = [
    { category: 'Education Inflation (India)', rate: 11.0, impact: 'Critical Surge' },
    { category: 'Healthcare Inflation (India)', rate: 10.5, impact: 'High Surge' },
    { category: 'Housing & Rent Inflation', rate: 7.5, impact: 'Elevated' },
    { category: 'Food & Groceries Index', rate: 6.8, impact: 'Moderate' },
    { category: 'Utilities & Power Index', rate: 6.2, impact: 'Moderate' },
    { category: 'Transportation Index', rate: 5.5, impact: 'Standard' }
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 glass-card shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Step 4 of 10 Workflow</span>
            <h1 className="text-2xl font-black text-white">Inflation Rate Setup & RBI Benchmark (India)</h1>
            <p className="text-xs text-slate-400">Set national CPI vs custom inflation parameters for Indian future cost projections.</p>
          </div>
        </div>
      </div>

      {saved && (
        <div className="flex items-center space-x-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-400 text-sm font-semibold">
          <CheckCircle2 className="h-5 w-5" />
          <span>Inflation rate configured! Advancing to Step 5: Future Expense Calculator...</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Rate Configuration Panel */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 glass-card shadow-xl space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="h-5 w-5 text-orange-400" />
            Set Custom Inflation Rate
          </h2>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Selected Rate APY</span>
                <span className="text-orange-400 text-lg font-black">{rate}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="18"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>1% (Low)</span>
                <span>6% (RBI Target)</span>
                <span>18% (Hyper)</span>
              </div>
            </div>

            <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4 space-y-2">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4" /> Inflation Impact Notice
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                At <strong>{rate}% annual CPI inflation</strong>, cost of living doubles in India approximately every <strong>{(72 / (rate || 1)).toFixed(1)} years</strong> (Rule of 72).
              </p>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-orange-500/20 hover:from-orange-400 hover:to-amber-400 transition"
            >
              <Save className="h-4 w-4" />
              <span>Apply Rate & Proceed to Calculator</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Multi-Year Impact Projection Chart */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 glass-card shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white">Projected Monthly Expense Growth Curve</h3>
          <p className="text-xs text-slate-400">Comparing base monthly budget ({formatINR(totalPlannedExpense)}) against inflation decay over 15 years.</p>
          <InflationImpactChart data={timelineData} />
        </div>
      </div>

      {/* Sector Specific Rates */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 glass-card shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white">Sector-Specific Indian CPI Inflation Indices</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {sectorBreakdown.map((s) => (
            <div key={s.category} className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4 space-y-1 text-center">
              <span className="text-[11px] font-semibold text-slate-400 block truncate">{s.category}</span>
              <p className="text-xl font-extrabold text-orange-400">{s.rate}%</p>
              <span className="text-[10px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">{s.impact}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InflationAnalysis;
