import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import { Field } from '../../components/ui';
import API from '../../services/api';

const emailOk = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!emailOk(cleanEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    setBusy(true);
    setError('');
    setMessage('');

    try {
      const response = await API.post('/auth/forgot-password', { email: cleanEmail });
      setMessage(response.data.message || 'If an account exists for this email, password-reset instructions will be sent.');
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send reset instructions. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      heading="Reset Your Password"
      description="Enter your registered email address and we'll send you a secure link to reset your account password."
    >
      <h2 className="font-display text-2xl font-bold">Forgot Password?</h2>
      <p className="mb-6 mt-1 text-sm text-[#64748B]">
        No worries! Enter your account email below and we will send you secure recovery instructions.
      </p>

      {submitted ? (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-lg bg-[#EBFBF7] p-4 text-[#065F46] border border-[#A7F3D0]">
            <CheckCircle2 size={20} className="mt-0.5 text-[#10B981] flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold">Check your inbox</p>
              <p className="mt-1 text-xs text-[#047857]">
                {message}
              </p>
              <p className="mt-2 text-xs text-[#065F46]">
                The reset link is valid for 20 minutes. If you don't see the email, be sure to check your spam or junk folder.
              </p>
            </div>
          </div>
          <Link
            to="/login"
            className="btn-primary w-full flex items-center justify-center gap-2 text-center"
          >
            <ArrowLeft size={16} /> Return to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} autoComplete="off">
          <Field label="Email Address" error={error}>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                className="input pl-10"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) setError('');
                }}
              />
            </div>
          </Field>

          {error && <p className="mb-3 text-sm text-[#DC2626]">{error}</p>}

          <button className="btn-primary w-full mt-2" disabled={busy} type="submit">
            {busy ? 'Sending Instructions...' : 'Send Password Reset Link'}
          </button>

          <p className="mt-5 text-center text-sm text-[#6B7280]">
            Remembered your password?{' '}
            <Link to="/login" className="font-semibold text-[#3155C6]">
              Back to Login
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
