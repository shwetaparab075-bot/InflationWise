import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Brand } from '../Logo';

const links = [
  { href: '/#home', label: 'Home' },
  { href: '/#features', label: 'Features' },
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/calculator', label: 'Inflation Calculator' },
  { href: '/#about', label: 'About' },
];

export default function Navbar() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center"><Brand tagline /></Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-[#64748B] lg:flex">
          {links.map((link) => (
            <a key={link.label} href={link.href} className={location.pathname === link.href ? 'text-[#16C7D9]' : 'text-[#20205A] hover:text-[#16C7D9]'}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-[#20205A] hover:text-[#16C7D9]">Login</Link>
              <Link to="/register" className="btn-primary">Get Started</Link>
            </>
          )}
        </div>
        <button type="button" className="rounded-xl p-2 lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Open menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="space-y-3 border-t bg-white px-4 py-4 lg:hidden">
          {links.map((link) => (
            <a key={link.label} href={link.href} onClick={() => setOpen(false)} className="block text-sm font-medium text-[#20205A]">{link.label}</a>
          ))}
          {isAuthenticated ? <Link to="/dashboard" className="btn-primary w-full">Dashboard</Link> : (
            <div className="flex gap-3">
              <Link to="/login" className="btn-secondary flex-1">Login</Link>
              <Link to="/register" className="btn-primary flex-1">Register</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
