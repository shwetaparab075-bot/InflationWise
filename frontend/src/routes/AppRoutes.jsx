import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import Landing from '../pages/Landing';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import Dashboard from '../pages/Dashboard';
import FinancialDetails from '../pages/FinancialDetails';
import Expenses from '../pages/Expenses';
import InflationCalculator from '../pages/InflationCalculator';
import Goals from '../pages/Goals';
import Savings from '../pages/Savings';
import Progress from '../pages/Progress';
import Reports from '../pages/Reports';
import Assistant from '../pages/Assistant';
import Profile from '../pages/Profile';
import Legal from '../pages/Legal';
import AdminLayout from '../layouts/AdminLayout';
import AdminRegister from '../pages/admin/AdminRegister';
import AdminForgotPassword from '../pages/admin/AdminForgotPassword';
import AdminUserDetail from '../pages/admin/AdminUserDetail';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminFinancial from '../pages/admin/AdminFinancial';
import AdminExpenses from '../pages/admin/AdminExpenses';
import AdminGoals from '../pages/admin/AdminGoals';
import AdminSavings from '../pages/admin/AdminSavings';
import AdminReports from '../pages/admin/AdminReports';
import AdminProfile from '../pages/admin/AdminProfile';
import { useAdmin } from '../context/AdminContext';
import { Spinner } from '../components/ui';

function AdminGuest({ children }) {
  const { isAuthenticated, loading } = useAdmin();
  if (loading) return <div className="grid min-h-screen place-items-center"><Spinner /></div>;
  if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />;
  return children;
}

function GuestOnly({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center"><Spinner /></div>;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/calculator" element={<InflationCalculator publicPage />} />
      <Route path="/terms" element={<Legal />} />
      <Route path="/privacy" element={<Legal />} />
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
      <Route path="/forgot-password" element={<GuestOnly><ForgotPassword /></GuestOnly>} />
      <Route path="/reset-password" element={<GuestOnly><ResetPassword /></GuestOnly>} />
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/financial-details" element={<FinancialDetails />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/inflation-calculator" element={<InflationCalculator />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/savings" element={<Savings />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/profile" element={<Profile />} />
          <Route path="/assistant" element={<Assistant />} />
      </Route>
      <Route path="/admin/login" element={<AdminGuest><Navigate to="/login?tab=admin" replace /></AdminGuest>} />
      <Route path="/admin/register" element={<AdminGuest><AdminRegister /></AdminGuest>} />
      <Route path="/admin/forgot-password" element={<AdminGuest><AdminForgotPassword /></AdminGuest>} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="users/:id" element={<AdminUserDetail />} />
        <Route path="financial-details" element={<AdminFinancial />} />
        <Route path="expenses" element={<AdminExpenses />} />
        <Route path="goals" element={<AdminGoals />} />
        <Route path="savings" element={<AdminSavings />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
