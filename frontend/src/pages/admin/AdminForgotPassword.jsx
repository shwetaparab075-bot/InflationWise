import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import { Field } from '../../components/ui';
import adminApi from '../../services/adminApi';

export default function AdminForgotPassword() {
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const response = await adminApi.post('/admin/forgot-password', form);
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout singleImage accents heading="InflationWise Admin" description="Reset the password for an admin account.">
      <h2 className="font-display text-2xl font-bold text-[#20205A]">Forgot Password</h2>
      <p className="mb-4 mt-1 text-sm text-[#6B7280]">Enter the admin email and choose a new password.</p>
      <form onSubmit={onSubmit}>
        <Field label="Admin Email"><input className="input" placeholder="Enter admin email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field>
        <Field label="New Password"><input className="input" type="password" placeholder="Create a password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></Field>
        <Field label="Confirm Password"><input className="input" type="password" placeholder="Confirm your password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} /></Field>
        {error && <p className="mb-3 text-sm text-[#DC2626]">{error}</p>}
        {message && <p className="mb-3 text-sm text-[#20205A]">{message}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Updating...' : 'Update Password'}</button>
      </form>
      <p className="mt-5 text-center text-sm"><Link to="/admin/login" className="font-semibold text-[#3155C6]">Back to admin login</Link></p>
    </AuthLayout>
  );
}
