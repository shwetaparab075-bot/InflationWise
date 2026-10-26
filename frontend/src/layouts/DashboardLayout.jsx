import React, { useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import FloatingChatbot from '../components/chatbot/FloatingChatbot';
import { ConfirmDialog, Spinner } from '../components/ui';

export default function DashboardLayout() {
  const { isAuthenticated, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const navigate = useNavigate();

  if (loading) return <div className="grid min-h-screen place-items-center"><Spinner label="Checking your session..." /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <Sidebar open={open} onClose={() => setOpen(false)} onLogout={() => setConfirm(true)} />
      <div className="lg:pl-72">
        <Header onMenu={() => setOpen(true)} />
        <main className="animate-fade px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>
      <FloatingChatbot />
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
