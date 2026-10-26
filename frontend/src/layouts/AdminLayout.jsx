import React, { useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import AdminSidebar from '../components/layout/AdminSidebar';
import { ConfirmDialog, Spinner } from '../components/ui';

export default function AdminLayout() {
  const { admin, isAuthenticated, loading, logout } = useAdmin();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const navigate = useNavigate();

  if (loading) return <div className="grid min-h-screen place-items-center"><Spinner label="Checking admin session..." /></div>;
  if (!isAuthenticated) return <Navigate to="/login?tab=admin" replace />;

  const handleLogout = async () => {
    await logout();
    navigate('/login?tab=admin');
  };

  const initials = (admin?.name || 'A').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <AdminSidebar open={open} onClose={() => setOpen(false)} onLogout={() => setConfirm(true)} />
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-100 bg-[#F7FAFC]/90 px-4 py-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button type="button" className="rounded-xl border border-slate-200 bg-white p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu size={18} />
            </button>
            <div>
              <h2 className="font-display text-lg font-semibold text-[#20205A] md:text-xl">Admin Dashboard</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-semibold text-[#20205A] sm:inline">{admin?.name}</span>
            {admin?.avatar ? (
              <img src={admin.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="gradient-brand flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white">{initials}</div>
            )}
          </div>
        </header>
        <main className="animate-fade px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>
      <ConfirmDialog
        open={confirm}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        danger
        onClose={() => setConfirm(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
