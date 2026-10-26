import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import { Disclaimer } from '../components/ui';
import { formatINR } from '../utils/currency';
import { futureCost, inflationExplanation } from '../utils/finance';

export default function InflationCalculator({ publicPage = false }) {
  const [form, setForm] = useState({ currentCost: '', inflationRate: '6', years: '10' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const calculate = (event) => {
    event.preventDefault();
    const current = Number(form.currentCost);
    const rate = Number(form.inflationRate);
    const years = Number(form.years);
    if (!Number.isFinite(current) || current < 0) return setError('Enter a valid current cost.');
    if (!Number.isFinite(rate) || rate < 0 || rate > 30) return setError('Enter an inflation rate between 0 and 30.');
    if (!Number.isFinite(years) || years < 1) return setError('Enter the number of years.');
    const future = futureCost(current, rate, years);
    setError('');
    setResult({ current, rate, years, future, increase: future - current });
  };

  return (
    <div className={publicPage ? 'min-h-screen bg-[#F8FAFC]' : ''}>
      {publicPage && <Navbar />}
      <div className={publicPage ? 'mx-auto max-w-5xl px-4 py-10' : ''}>
        <div className="mb-6 grid items-center gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="eyebrow">InflationWise</p>
            <h1 className="font-display text-2xl font-bold text-[#20205A] md:text-3xl">Inflation Calculator</h1>
            <p className="mt-1 text-sm text-[#6B7280]">See What Today’s Money Could Cost Tomorrow</p>
          </div>
          <img src="/images/calculator.jpg" alt="" className="hidden h-36 w-full rounded-xl object-cover md:block" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <form className="card p-6" onSubmit={calculate}>
            <label className="label">Current Cost</label>
            <input className="input mb-4" type="number" min="0" placeholder="5000000" value={form.currentCost} onChange={(event) => setForm({ ...form, currentCost: event.target.value })} />
            <label className="label">Inflation Rate (%)</label>
            <input className="input mb-3" type="number" min="0" step="0.1" placeholder="6" value={form.inflationRate} onChange={(event) => setForm({ ...form, inflationRate: event.target.value })} />
            <div className="mb-4 flex flex-wrap gap-2">
              {[4, 5, 6, 7].map((rate) => (
                <button type="button" key={rate} className="rounded-md bg-[#DDF8FB] px-3 py-1 text-xs font-semibold text-[#20205A]" onClick={() => setForm({ ...form, inflationRate: String(rate) })}>{rate}%</button>
              ))}
            </div>
            <label className="label">Number of Years</label>
            <input className="input mb-4" type="number" min="1" placeholder="10" value={form.years} onChange={(event) => setForm({ ...form, years: event.target.value })} />
            {error && <p className="mb-3 text-sm text-[#DC2626]">{error}</p>}
            <button className="btn-primary w-full" type="submit">Calculate Future Cost</button>
          </form>
          <div className="rounded-xl bg-[#20205A] p-6 text-white shadow-lift">
            {result ? (
              <>
                <p className="text-sm text-white/80">Present Cost</p>
                <p className="font-display text-2xl font-bold">{formatINR(result.current)}</p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-white/70">Inflation Rate</p><p className="font-semibold">{result.rate}%</p></div>
                  <div><p className="text-white/70">Time</p><p className="font-semibold">{result.years} Years</p></div>
                </div>
                <p className="mt-6 text-sm text-white/80">Estimated Future Cost</p>
                <p className="font-display text-4xl font-bold">{formatINR(result.future)}</p>
                <p className="mt-3 text-sm">Increase Due to Inflation: {formatINR(result.increase)}</p>
                <p className="mt-4 text-sm leading-6 text-white/90">{inflationExplanation({ currentCost: result.current, inflationRate: result.rate, years: result.years, future: result.future })}</p>
              </>
            ) : (
              <div className="flex h-full min-h-[240px] items-center">
                <p>Enter today’s cost, an inflation rate, and the number of years to estimate the future cost.</p>
              </div>
            )}
            <p className="mt-6 text-xs text-white/75">This is an estimated value based on the entered inflation rate.</p>
          </div>
        </div>
        <div className="mt-4"><Disclaimer /></div>
      </div>
    </div>
  );
}
