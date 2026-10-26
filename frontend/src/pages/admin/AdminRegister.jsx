import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Phone, UserRound } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import { Field } from '../../components/ui';
import adminApi from '../../services/adminApi';

export default function AdminRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', mobile: '', password: '', confirmPassword: '', accessCode: '',
  });
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const onSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const response = await adminApi.post('/admin/register', form);
      setMessage(response.data.message);
      navigate('/login?tab=admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create admin account.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout oneImage heading="Create Admin Account" description="An admin access code is required. This does not create a normal user account.">
      <h2 className="font-display text-2xl font-bold text-[#20205A]">Create Admin Account</h2>
      <p className="mb-6 mt-1 text-sm text-[#6B7280]">Only a valid admin access code can create an administrator.</p>
      <form onSubmit={onSubmit}>
        <Field label="Admin Full Name">
          <div className="relative">
            <UserRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input className="input pl-10" placeholder="Enter full name" value={form.name} onChange={set('name')} />
          </div>
        </Field>
        <Field label="Admin Email">
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input className="input pl-10" placeholder="Enter admin email" value={form.email} onChange={set('email')} />
          </div>
        </Field>
        <Field label="Mobile Number">
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input className="input pl-10" placeholder="10-digit mobile number" value={form.mobile} onChange={set('mobile')} />
          </div>
        </Field>
        <Field label="Password">
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input className="input pl-10 pr-10" type={show ? 'text' : 'password'} placeholder="Create a password" value={form.password} onChange={set('password')} />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]" onClick={() => setShow((value) => !value)} aria-label="Toggle password visibility">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>
        <Field label="Confirm Password">
          <input className="input" type={show ? 'text' : 'password'} placeholder="Confirm your password" value={form.confirmPassword} onChange={set('confirmPassword')} />
        </Field>
        <Field label="Admin Access Code">
          <input className="input" placeholder="Enter admin access code" value={form.accessCode} onChange={set('accessCode')} />
        </Field>
        {error && <p className="mb-3 text-sm text-[#DC2626]">{error}</p>}
        {message && <p className="mb-3 text-sm text-[#20205A]">{message}</p>}
        <button className="btn-primary w-full" disabled={busy} type="submit">{busy ? 'Creating...' : 'Create Admin Account'}</button>
      </form>
      <p className="mt-5 text-center text-sm text-[#6B7280]">Already have an Admin account? <Link to="/login?tab=admin" className="font-semibold text-[#3155C6]">Login</Link></p>
    </AuthLayout>
  );
}
