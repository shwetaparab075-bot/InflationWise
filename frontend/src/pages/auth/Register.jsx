import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import { Field } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';

const emailOk = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const mobileOk = (value) => {
  const digits = value.replace(/\D/g, '');
  const normalized = digits.length === 12 && digits.startsWith('91')
    ? digits.slice(2)
    : digits.length === 11 && digits.startsWith('0')
      ? digits.slice(1)
      : digits;
  return /^[6-9]\d{9}$/.test(normalized);
};
const passwordError = (password) => {
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(password)) return 'Include an uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Include a lowercase letter.';
  if (!/\d/.test(password)) return 'Include a number.';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Include a special character.';
  return '';
};

export default function Register() {
  const { register, authBusy } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState({ password: false, confirm: false });
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '', confirmPassword: '', terms: false });
  const [errors, setErrors] = useState({});

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));

  const onSubmit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'Full name is required.';
    if (!form.email.trim()) next.email = 'Email is required.';
    else if (!emailOk(form.email)) next.email = 'Enter a valid email address.';
    if (!form.mobile.trim()) next.mobile = 'Mobile number is required.';
    else if (!mobileOk(form.mobile)) next.mobile = 'Enter a valid 10-digit mobile number.';
    const pw = passwordError(form.password);
    if (pw) next.password = pw;
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match.';
    if (!form.terms) next.terms = 'Please accept the Terms & Conditions and Privacy Policy.';
    setErrors(next);
    if (Object.keys(next).length) return;

    const result = await register({
      name: form.name.trim(),
      email: form.email.trim(),
      mobile: form.mobile,
      password: form.password,
      confirmPassword: form.confirmPassword,
    });
    if (!result.success) {
      setErrors({ form: result.message });
      return;
    }
    setSuccess('Account created successfully!');
    setTimeout(() => navigate('/login'), 1200);
  };

  return (
    <AuthLayout singleImage heading="Start Planning Your Financial Future" description="Create your account and use inflation-aware financial planning to manage your expenses, savings, and future financial goals.">
      <h2 className="font-display text-2xl font-bold">Create Your Account</h2>
      <p className="mb-6 mt-1 text-sm text-[#64748B]">Join InflationWise and start planning smarter.</p>
      <form onSubmit={onSubmit} autoComplete="off">
        <Field label="Full Name" error={errors.name}>
          <div className="relative"><User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" /><input className="input pl-10" placeholder="Enter your full name" autoComplete="name" value={form.name} onChange={set('name')} /></div>
        </Field>
        <Field label="Email Address" error={errors.email}>
          <div className="relative"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" /><input className="input pl-10" placeholder="Enter your email address" autoComplete="off" value={form.email} onChange={set('email')} /></div>
        </Field>
        <Field label="Mobile Number" error={errors.mobile}>
          <div className="relative"><Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" /><input className="input pl-10" placeholder="Enter your mobile number" autoComplete="off" value={form.mobile} onChange={set('mobile')} /></div>
        </Field>
        <Field label="Password" error={errors.password}>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input className="input pl-10 pr-10" type={show.password ? 'text' : 'password'} placeholder="Create a password" autoComplete="new-password" value={form.password} onChange={set('password')} />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]" onClick={() => setShow((value) => ({ ...value, password: !value.password }))} aria-label="Show password">{show.password ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </div>
        </Field>
        <Field label="Confirm Password" error={errors.confirmPassword}>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input className="input pl-10 pr-10" type={show.confirm ? 'text' : 'password'} placeholder="Confirm your password" autoComplete="new-password" value={form.confirmPassword} onChange={set('confirmPassword')} />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]" onClick={() => setShow((value) => ({ ...value, confirm: !value.confirm }))} aria-label="Show confirm password">{show.confirm ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </div>
        </Field>
        <label className="mb-4 flex items-start gap-2 text-sm text-[#64748B]">
          <input type="checkbox" className="mt-1" checked={form.terms} onChange={set('terms')} />
          <span>I agree to the <Link to="/terms" className="font-medium text-[#3155C6]">Terms & Conditions</Link> and <Link to="/privacy" className="font-medium text-[#3155C6]">Privacy Policy</Link>.</span>
        </label>
        {errors.terms && <p className="mb-3 text-xs text-[#DC2626]">{errors.terms}</p>}
        {errors.form && <p className="mb-3 text-sm text-[#DC2626]">{errors.form}</p>}
        {success && <p className="mb-3 text-sm font-medium text-[#16A34A]">{success}</p>}
        <button className="btn-primary w-full" disabled={authBusy || Boolean(success)} type="submit">{authBusy ? 'Creating account...' : 'Create Account'}</button>
      </form>
      <p className="mt-5 text-center text-sm text-[#6B7280]">Already have an account? <Link to="/login" className="font-semibold text-[#3155C6]">Login</Link></p>
    </AuthLayout>
  );
}
