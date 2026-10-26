import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import { Field } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useAdmin } from '../../context/AdminContext';
import API from '../../services/api';

const emailOk = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export default function Login() {
  const { login, authBusy } = useAuth();
  const { login: adminLogin, authBusy: adminBusy } = useAdmin();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'admin' ? 'admin' : 'user';
  const [userForm, setUserForm] = useState({ email: '', password: '', rememberMe: true });
  const [adminForm, setAdminForm] = useState({ email: '', password: '', rememberMe: true });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const selectTab = (next) => {
    setErrors({});
    setMessage('');
    setParams(next === 'admin' ? { tab: 'admin' } : {}, { replace: true });
  };

  const onUserSubmit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!userForm.email.trim()) next.email = 'Email cannot be empty.';
    else if (!emailOk(userForm.email)) next.email = 'Enter a valid email address.';
    if (!userForm.password) next.password = 'Password cannot be empty.';
    setErrors(next);
    if (Object.keys(next).length) return;
    const result = await login(userForm);
    if (result.success) navigate('/dashboard');
    else setMessage(result.message);
  };

  const onAdminSubmit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!adminForm.email.trim()) next.email = 'Email cannot be empty.';
    else if (!emailOk(adminForm.email)) next.email = 'Enter a valid email address.';
    if (!adminForm.password) next.password = 'Password cannot be empty.';
    setErrors(next);
    if (Object.keys(next).length) return;
    const result = await adminLogin(adminForm);
    if (result.success) navigate('/admin/dashboard');
    else setMessage(result.message);
  };
  // Forgot Password handler
  const handleForgotPassword = async () => {
    if (!emailOk(userForm.email)) {
      setMessage('Enter a valid registered email address.');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await API.post('/auth/forgot-password', { email: userForm.email });
      if (res.data && res.data.message) {
        setMessage(res.data.message);
      } else {
        setMessage('A password has been sent to your registered email.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to send password. Please try again later.';
      setMessage(errMsg);
    } finally {
      setForgotLoading(false);
    }
  };


  const busy = tab === 'admin' ? adminBusy : authBusy;

  return (
    <AuthLayout oneImage heading="Plan Smarter for Your Financial Future" description="Understand inflation, manage your money, set financial goals, and track your progress—all in one place.">
      <h2 className="font-display text-2xl font-bold text-[#20205A]">InflationWise</h2>
      <div className="mb-6 mt-4 grid grid-cols-2 rounded-[10px] bg-[#F7FAFC] p-1">
        <button type="button" className={`rounded-[8px] px-3 py-2 text-sm font-semibold transition duration-300 ${tab === 'user' ? 'bg-[#16C7D9] text-white' : 'text-[#20205A]'}`} onClick={() => selectTab('user')}>User Login</button>
        <button type="button" className={`rounded-[8px] px-3 py-2 text-sm font-semibold transition duration-300 ${tab === 'admin' ? 'bg-[#16C7D9] text-white' : 'text-[#20205A]'}`} onClick={() => selectTab('admin')}>Admin Login</button>
      </div>

      {tab === 'user' ? (
        <form onSubmit={onUserSubmit} autoComplete="off">
          <Field label="Email Address" error={errors.email}>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input className="input pl-10" placeholder="Enter your email address" autoComplete="off" value={userForm.email} onChange={(event) => setUserForm({ ...userForm, email: event.target.value })} />
            </div>
          </Field>
          <Field label="Password" error={errors.password}>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input className="input pl-10 pr-10" type={show ? 'text' : 'password'} placeholder="Enter your password" autoComplete="off" value={userForm.password} onChange={(event) => setUserForm({ ...userForm, password: event.target.value })} />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]" onClick={() => setShow((value) => !value)} aria-label="Toggle password visibility">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>
          <div className="mb-4 flex items-center justify-between text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={userForm.rememberMe} onChange={(event) => setUserForm({ ...userForm, rememberMe: event.target.checked })} /> Remember Me            </label>


          <button type="button" className="font-medium text-[#3155C6]" onClick={handleForgotPassword} disabled={forgotLoading}>{forgotLoading ? 'Sending…' : 'Forgot Password'}</button>
          </div>
          {message && <p className="mb-3 text-sm text-[#DC2626]">{message}</p>}
          <button className="btn-primary w-full" disabled={busy} type="submit">{busy ? 'Signing in...' : 'Login as User'}</button>
          <p className="mt-5 text-center text-sm text-[#6B7280]">Don't have an account? <Link to="/register" className="font-semibold text-[#3155C6]">Register</Link></p>
        </form>
      ) : (
        <form onSubmit={onAdminSubmit} autoComplete="off">
          <Field label="Admin Email" error={errors.email}>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input className="input pl-10" placeholder="Enter admin email" autoComplete="email" value={adminForm.email} onChange={(event) => setAdminForm({ ...adminForm, email: event.target.value })} />
            </div>
          </Field>
          <Field label="Password" error={errors.password}>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input className="input pl-10 pr-10" type={show ? 'text' : 'password'} placeholder="Enter admin password" autoComplete="current-password" value={adminForm.password} onChange={(event) => setAdminForm({ ...adminForm, password: event.target.value })} />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]" onClick={() => setShow((value) => !value)} aria-label="Toggle password visibility">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>
          <div className="mb-4 flex items-center justify-between text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={adminForm.rememberMe} onChange={(event) => setAdminForm({ ...adminForm, rememberMe: event.target.checked })} /> Remember Me</label>
            <Link to="/admin/forgot-password" className="font-medium text-[#3155C6]">Forgot Password</Link>
          </div>
          {message && <p className="mb-3 text-sm text-[#DC2626]">{message}</p>}
          <button className="btn-primary w-full" disabled={busy} type="submit">{busy ? 'Signing in...' : 'Login as Admin'}</button>
          <p className="mt-5 text-center text-sm text-[#6B7280]">Don't have an Admin account? <Link to="/admin/register" className="font-semibold text-[#3155C6]">Admin Sign Up</Link></p>
        </form>
      )}
    </AuthLayout>
  );
}
