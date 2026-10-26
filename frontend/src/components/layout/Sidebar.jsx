import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Wallet, Receipt, Calculator, Target, PiggyBank,
  TrendingUp, FileBarChart, UserRound, LogOut, X, MessageSquare,
} from 'lucide-react';
import { Brand } from '../Logo';

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/financial-details', label: 'Financial Details', icon: Wallet },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/inflation-calculator', label: 'Inflation Calculator', icon: Calculator },
  { to: '/goals', label: 'Financial Goals', icon: Target },
  { to: '/savings', label: 'Savings Plan', icon: PiggyBank },
  { to: '/assistant', label: 'AI Assistant', icon: MessageSquare },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/reports', label: 'Reports', icon: FileBarChart },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

export default function Sidebar({ open, onClose, onLogout }) {
  return (
    <>
      {open && <button type="button" className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={onClose} aria-label="Close menu" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-[#20205A] text-white transition-transform ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between px-5 py-5">
          <Brand light tagline />
          <button type="button" className="rounded-lg p-1 text-white lg:hidden" onClick={onClose} aria-label="Close sidebar"><X size={18} /></button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition duration-300 ${isActive ? 'bg-[#16C7D9] text-[#20205A]' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} className={isActive ? 'text-[#20205A]' : 'text-[#16C7D9]'} />
                    {item.label}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
        <div className="p-3">
          <button type="button" onClick={onLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 transition duration-300 hover:bg-white/10 hover:text-white">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
