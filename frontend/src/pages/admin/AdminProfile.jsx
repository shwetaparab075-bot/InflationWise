import React, { useState } from 'react';
import adminApi from '../../services/adminApi';
import { PageHeader } from '../../components/ui';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';

export default function AdminProfile() {
  const { admin, updateAdmin } = useAdmin();
  const { push } = useToast();
  const [form, setForm] = useState({ name: admin?.name || '', avatar: admin?.avatar || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

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

  const saveName = async (event) => {
    event.preventDefault();
    try {
      const response = await adminApi.put('/admin/profile', form);
      updateAdmin(response.data.admin);
      push(response.data.message);
    } catch (error) {
      push(error.response?.data?.message || 'Could not update profile.', 'error');
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    try {
      const response = await adminApi.put('/admin/password', passwords);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      push(response.data.message);
    } catch (error) {
      push(error.response?.data?.message || 'Could not update password.', 'error');
    }
  };

  const initials = (admin?.name || 'A').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div>
      <PageHeader title="Profile" subtitle="Admin account details." />
      <div className="grid gap-6 lg:grid-cols-2">
        <form className="card space-y-4 p-6" onSubmit={saveName}>
          <div className="flex items-center gap-4">
            {form.avatar ? <img src={form.avatar} alt="" className="h-16 w-16 rounded-full object-cover" /> : <div className="gradient-brand flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white">{initials}</div>}
            <label className="text-sm font-medium text-[#3155C6]">Update Profile Picture
              <input className="mt-1 block text-xs" type="file" accept="image/*" onChange={onPhoto} />
            </label>
          </div>
          <label className="block text-sm font-medium">Admin Name
            <input className="input mt-1" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>
          <label className="block text-sm font-medium">Admin Email
            <input className="input mt-1" value={admin?.email || ''} readOnly />
          </label>
          <button className="btn-primary" type="submit">Save Profile</button>
        </form>
        <form className="card space-y-4 p-6" onSubmit={savePassword}>
          <h3 className="font-display text-lg font-bold text-[#20205A]">Change Password</h3>
          <label className="block text-sm font-medium">Current Password
            <input className="input mt-1" type="password" value={passwords.currentPassword} onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })} />
          </label>
          <label className="block text-sm font-medium">New Password
            <input className="input mt-1" type="password" value={passwords.newPassword} onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} />
          </label>
          <label className="block text-sm font-medium">Confirm Password
            <input className="input mt-1" type="password" value={passwords.confirmPassword} onChange={(event) => setPasswords({ ...passwords, confirmPassword: event.target.value })} />
          </label>
          <button className="btn-primary" type="submit">Update Password</button>
        </form>
      </div>
    </div>
  );
}
