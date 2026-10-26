import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import { Field } from '../../components/ui';
import { useAdmin } from '../../context/AdminContext';

const emailOk = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export default function AdminLogin() {
  const { login, authBusy } = useAdmin();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', rememberMe: true });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!form.email.trim()) next.email = 'Email cannot be empty.';
    else if (!emailOk(form.email)) next.email = 'Enter a valid email address.';
    if (!form.password) next.password = 'Password cannot be empty.';
    setErrors(next);
    if (Object.keys(next).length) return;
    const result = await login(form);
    if (result.success) navigate('/admin/dashboard');
    else setMessage(result.message);
  };

  return (
    <AuthLayout singleImage accents heading="InflationWise Admin" description="Sign in to manage the InflationWise system.">
      <h2 className="font-display text-2xl font-bold text-[#20205A]">InflationWise Admin</h2>
      <p className="mb-6 mt-1 text-sm text-[#6B7280]">Sign in to manage the InflationWise system.</p>
      <form onSubmit={onSubmit}>
        <Field label="Admin Email" error={errors.email}>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input className="input pl-10" placeholder="Enter admin email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </div>
        </Field>
        <Field label="Password" error={errors.password}>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input className="input pl-10 pr-10" type={show ? 'text' : 'password'} placeholder="Enter admin password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]" onClick={() => setShow((value) => !value)} aria-label="Toggle password visibility">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>
        <div className="mb-4 flex items-center justify-between text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.rememberMe} onChange={(event) => setForm({ ...form, rememberMe: event.target.checked })} /> Remember Me</label>
          <Link to="/admin/forgot-password" className="font-medium text-[#3155C6]">Forgot Password</Link>
        </div>
        {message && <p className="mb-3 text-sm text-[#DC2626]">{message}</p>}
        <button className="btn-primary w-full" disabled={authBusy} type="submit">{authBusy ? 'Signing in...' : 'Admin Login'}</button>
      </form>
      <div className="mt-4 rounded-lg bg-[#DDF8FB] p-3 text-xs text-[#20205A]">
        Admin account: admin@inflationwise.com · Admin@1234
      </div>
      <p className="mt-5 text-center text-sm text-[#6B7280]">
        <Link to="/" className="font-semibold text-[#3155C6]">Back to InflationWise</Link>
      </p>
    </AuthLayout>
  );
}
