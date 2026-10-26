import React, { useState } from 'react';
import API from '../services/api';
import { formatDate } from '../utils/currency';
import { PageHeader } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { push } = useToast();
  const [form, setForm] = useState({ name: user?.name || '', mobile: user?.mobile || '', avatar: user?.avatar || '' });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [busy, setBusy] = useState(false);

  const onPhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 500000) {
      push('Profile picture must be smaller than 500 KB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await API.put('/auth/profile', form);
      updateUser(response.data.user);
      push(response.data.message);
    } catch (error) {
      push(error.response?.data?.message || 'Could not update profile.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    try {
      const response = await API.put('/auth/password', password);
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
      push(response.data.message);
    } catch (error) {
      push(error.response?.data?.message || 'Could not change password.', 'error');
    }
  };

  const initials = (user?.name || 'U').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div>
      <PageHeader title="Profile" subtitle="Update your personal details and password." />
      <div className="grid gap-6 lg:grid-cols-2">
        <form className="card p-6" onSubmit={saveProfile}>
          <div className="mb-4 flex items-center gap-4">
            {form.avatar ? <img src={form.avatar} alt="" className="h-16 w-16 rounded-full object-cover" /> : <div className="gradient-brand flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white">{initials}</div>}
            <label className="text-sm font-medium text-[#3155C6]">Update Profile Picture
              <input className="mt-1 block text-xs" type="file" accept="image/*" onChange={onPhoto} />
            </label>
          </div>
          <label className="mb-3 block text-sm font-medium">Full Name<input className="input mt-1" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <label className="mb-3 block text-sm font-medium">Email<input className="input mt-1 bg-slate-50" value={user?.email || ''} disabled /></label>
          <label className="mb-3 block text-sm font-medium">Mobile Number<input className="input mt-1" value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} /></label>
          <p className="mb-4 text-sm text-[#64748B]">Account creation date: {formatDate(user?.createdAt)}</p>
          <button className="btn-primary" disabled={busy} type="submit">Save Changes</button>
        </form>
        <form className="card p-6" onSubmit={savePassword}>
          <h3 className="mb-4 font-display text-lg font-semibold">Change Password</h3>
          <label className="mb-3 block text-sm font-medium">Current Password<input className="input mt-1" type="password" value={password.currentPassword} onChange={(event) => setPassword({ ...password, currentPassword: event.target.value })} /></label>
          <label className="mb-3 block text-sm font-medium">New Password<input className="input mt-1" type="password" value={password.newPassword} onChange={(event) => setPassword({ ...password, newPassword: event.target.value })} /></label>
          <label className="mb-4 block text-sm font-medium">Confirm Password<input className="input mt-1" type="password" value={password.confirmPassword} onChange={(event) => setPassword({ ...password, confirmPassword: event.target.value })} /></label>
          <button className="btn-primary" type="submit">Change Password</button>
        </form>
      </div>
    </div>
  );
}
