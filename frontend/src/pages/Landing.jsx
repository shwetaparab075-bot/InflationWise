import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calculator, Receipt, Target, PiggyBank, TrendingUp, FileBarChart, ShieldCheck,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { Brand } from '../components/Logo';
import { Disclaimer } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/currency';
import { futureCost, inflationExplanation } from '../utils/finance';

const features = [
  [Calculator, 'Inflation Calculator', 'See how today’s costs grow over the years you care about.'],
  [Receipt, 'Expense Management', 'Record daily and monthly spending and understand where money goes.'],
  [Target, 'Financial Goal Planning', 'Plan education, a home, medical costs, retirement, and more.'],
  [PiggyBank, 'Savings Planning', 'Turn a future goal into a monthly saving target you can follow.'],
  [TrendingUp, 'Goal Progress Tracking', 'Compare planned savings with what you actually set aside.'],
  [FileBarChart, 'Financial Reports', 'Review income, expenses, goals, and inflation impact in one place.'],
  [ShieldCheck, 'Secure Account', 'Your password is hashed and your records stay private to you.'],
];

const steps = [
  'Create Account',
  'Enter Financial Details',
  'Record Expenses',
  'Set Financial Goal',
  'Calculate Future Cost',
  'Get Monthly Saving Target',
  'Track Goal Progress',
];

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState({ currentCost: 5000000, inflationRate: 6, years: 10 });
  const result = useMemo(() => futureCost(form.currentCost, form.inflationRate, form.years), [form]);
  const start = isAuthenticated ? '/dashboard' : '/register';

  return (
    <div id="home" className="min-h-screen bg-[#F7FAFC]">
      <Navbar />
      <section className="relative overflow-hidden text-white">
        <img src="/images/planning.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[#20205A]/80" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#16C7D9]">Smart Inflation-Based Financial Planning</p>
            <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">Plan Today. Stay Ahead of Inflation.</h1>
            <p className="mt-4 max-w-xl text-lg text-white/85">Manage your money, understand inflation, calculate future expenses, and create a smarter financial plan for your goals.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to={start} className="btn-primary">Get Started</Link>
              <a href="#calculator" className="rounded-[10px] border border-white px-5 py-2.5 text-center text-sm font-semibold text-white transition duration-300 hover:bg-white hover:text-[#20205A]">Calculate Future Cost</a>
            </div>
          </div>
          <img src="/images/family.jpg" alt="" className="hidden h-80 w-full rounded-xl object-cover shadow-lift lg:block" />
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-3xl font-bold">Everything you need to plan ahead</h2>
        <p className="mt-2 max-w-2xl text-[#64748B]">Simple tools for students and families, presented like a modern fintech dashboard.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(([Icon, title, text]) => (
            <article key={title} className="card p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#DDF8FB] text-[#20205A]"><Icon size={20} /></div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#64748B]">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="bg-[#20205A] py-16 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <p className="eyebrow">InflationWise</p>
          <h2 className="font-display text-3xl font-bold text-white">How it works</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <article key={step} className="card p-5 text-[#1C2340]">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#16C7D9] font-bold text-[#20205A]">{index + 1}</div>
                <h3 className="font-semibold">{step}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="calculator" className="bg-[#DDF8FB]">
        <div className="mx-auto grid max-w-6xl items-start gap-8 px-4 py-16 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl font-bold text-[#20205A]">See What Today’s Money Could Cost Tomorrow</h2>
          <p className="mt-2 text-[#6B7280]">Try a quick estimate. Save goals after you create an account.</p>
          <div className="card mt-6 space-y-4 p-6">
            <label className="block text-sm font-medium">Current Cost
              <input className="input mt-1" type="number" min="0" value={form.currentCost} onChange={(event) => setForm({ ...form, currentCost: event.target.value })} />
            </label>
            <label className="block text-sm font-medium">Inflation Rate (%)
              <input className="input mt-1" type="number" min="0" step="0.1" value={form.inflationRate} onChange={(event) => setForm({ ...form, inflationRate: event.target.value })} />
            </label>
            <label className="block text-sm font-medium">Number of Years
              <input className="input mt-1" type="number" min="1" value={form.years} onChange={(event) => setForm({ ...form, years: event.target.value })} />
            </label>
          </div>
        </div>
        <div className="flex flex-col justify-center rounded-xl bg-[#20205A] p-8 text-white shadow-lift">
          <p className="text-sm text-white/80">Estimated future cost</p>
          <p className="mt-2 font-display text-4xl font-bold">{formatINR(result)}</p>
          <p className="mt-4 text-sm leading-6 text-white/90">{inflationExplanation({ currentCost: form.currentCost, inflationRate: form.inflationRate, years: form.years, future: result })}</p>
          <p className="mt-4 text-xs text-white/75">This is an estimated value based on the entered inflation rate.</p>
          <Link to={start} className="btn-primary mt-6 w-fit">Save this plan</Link>
          <img src="/images/calculator.jpg" alt="" className="mt-6 h-40 w-full rounded-xl object-cover" />
        </div>
        </div>
      </section>

      <section id="about" className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 lg:grid-cols-2">
        <img src="/images/family.jpg" alt="" className="h-72 w-full rounded-xl object-cover" />
        <div className="card p-8">
          <p className="eyebrow">InflationWise</p>
          <h2 className="font-display text-3xl font-bold text-[#20205A]">About InflationWise</h2>
          <p className="mt-3 max-w-3xl leading-7 text-[#64748B]">InflationWise is a smart financial planning website that helps you manage income, expenses, savings, and future goals. It shows how inflation can change the cost of education, medical care, a house, a vehicle, retirement, an emergency fund, and other plans — then estimates the monthly amount to set aside.</p>
          <Disclaimer />
        </div>
      </section>

      <footer className="bg-[#20205A] px-4 py-8 text-sm text-white/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Brand light />
          <p>© {new Date().getFullYear()} InflationWise</p>
          <div className="flex gap-4">
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
