import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import { Field } from '../../components/ui';
import API from '../../services/api';

const passwordError = (password) => {
  if (!password || password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(password)) return 'Include an uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Include a lowercase letter.';
  if (!/\d/.test(password)) return 'Include a number.';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Include a special character.';
  return '';
};

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const id = searchParams.get('id');

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [show, setShow] = useState({ password: false, confirm: false });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const isInvalidLink = !token || !id;

  const onSubmit = async (event) => {
    event.preventDefault();
    setServerError('');
    const nextErrors = {};

    const pwErr = passwordError(form.password);
    if (pwErr) nextErrors.password = pwErr;
    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setBusy(true);
    try {
      const response = await API.post('/auth/reset-password', {
        token,
        id,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      setSuccess(response.data.message || 'Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setServerError(
        err.response?.data?.message || 'Failed to reset password. The link may have expired.'
      );
    } finally {
      setBusy(false);
    }
  };

  if (isInvalidLink) {
    return (
      <AuthLayout
        heading="Invalid Reset Link"
        description="This password reset link is invalid or incomplete."
      >
        <div className="text-center py-4 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-[#DC2626]">
            <AlertCircle size={28} />
          </div>
          <h2 className="font-display text-2xl font-bold">Invalid Reset Link</h2>
          <p className="text-sm text-[#64748B]">
            This link is missing required verification parameters or has expired. Please request a new password-reset link.
          </p>
          <div className="pt-2">
            <Link to="/forgot-password" className="btn-primary inline-block">
              Request New Reset Link
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      heading="Set a New Password"
      description="Create a strong, unique password to secure your InflationWise account."
    >
      <h2 className="font-display text-2xl font-bold">Reset Password</h2>
      <p className="mb-6 mt-1 text-sm text-[#64748B]">
        Enter your new password below. Make sure it is at least 8 characters long with numbers and symbols.
      </p>

      {success ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg bg-[#EBFBF7] p-4 text-[#065F46] border border-[#A7F3D0]">
            <CheckCircle2 size={20} className="mt-0.5 text-[#10B981] flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold">Password Updated!</p>
              <p className="mt-1 text-xs text-[#047857]">
                {success} Redirecting you to login...
              </p>
            </div>
          </div>
          <Link to="/login" className="btn-primary w-full block text-center">
            Go to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} autoComplete="off">
          <Field label="New Password" error={errors.password}>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                className="input pl-10 pr-10"
                type={show.password ? 'text' : 'password'}
                placeholder="Enter new password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                onClick={() => setShow((v) => ({ ...v, password: !v.password }))}
                aria-label="Toggle password visibility"
              >
                {show.password ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>

          <Field label="Confirm New Password" error={errors.confirmPassword}>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                className="input pl-10 pr-10"
                type={show.confirm ? 'text' : 'password'}
                placeholder="Confirm new password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                onClick={() => setShow((v) => ({ ...v, confirm: !v.confirm }))}
                aria-label="Toggle confirm password visibility"
              >
                {show.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>

          {serverError && <p className="mb-3 text-sm text-[#DC2626]">{serverError}</p>}

          <button className="btn-primary w-full mt-2" disabled={busy} type="submit">
            {busy ? 'Resetting Password...' : 'Reset Password'}
          </button>

          <p className="mt-5 text-center text-sm text-[#6B7280]">
            Remember your password?{' '}
            <Link to="/login" className="font-semibold text-[#3155C6]">
              Login
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
