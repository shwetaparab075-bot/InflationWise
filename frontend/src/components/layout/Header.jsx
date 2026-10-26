import React, { useEffect, useState } from 'react';
import { Bell, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';

export default function Header({ onMenu }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    API.get('/reports').then((response) => setAlerts(response.data.data.alerts || [])).catch(() => setAlerts([]));
  }, []);

  const initials = (user?.name || 'U').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-100 bg-[#F8FAFC]/90 px-4 py-4 backdrop-blur md:px-8">
      <div className="flex items-center gap-3">
        <button type="button" className="rounded-xl border border-slate-200 bg-white p-2 lg:hidden" onClick={onMenu} aria-label="Open menu">
          <Menu size={18} />
        </button>
        <div>
          <h2 className="font-display text-lg font-semibold md:text-xl">Welcome back, {user?.name || 'there'}</h2>
          <p className="text-sm text-[#64748B]">Here’s an overview of your financial journey.</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <button type="button" className="relative rounded-xl border border-slate-200 bg-white p-2" onClick={() => setOpen((value) => !value)} aria-label="Notifications">
            <Bell size={18} className="text-[#20205A]" />
            {alerts.length > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#16C7D9]" />}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-100 bg-white p-3 shadow-lift">
              {alerts.map((alert) => (
                <p key={alert.text} className="rounded-xl px-3 py-2 text-sm text-[#1E293B] hover:bg-[#F5F3FF]">{alert.text}</p>
              ))}
            </div>
          )}
        </div>
        {user?.avatar ? (
          <img src={user.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div className="gradient-brand flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white">{initials}</div>
        )}
      </div>
    </header>
  );
}
