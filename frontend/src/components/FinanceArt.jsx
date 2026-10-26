import React, { useId } from 'react';

export default function FinanceArt() {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 640 420" className="w-full" role="img" aria-label="Savings, rupee, house, and growth illustration">
      <defs>
        <linearGradient id={`${id}-card`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F5F3FF" />
        </linearGradient>
      </defs>
      <rect x="36" y="28" width="560" height="360" rx="32" fill="rgba(255,255,255,0.12)" />
      <rect x="70" y="70" width="230" height="250" rx="28" fill={`url(#${id}-card)`} />
      <text x="185" y="170" textAnchor="middle" fontSize="78" fontFamily="Arial" fill="#7C3AED">₹</text>
      <rect x="118" y="210" width="134" height="36" rx="18" fill="#ECFEFF" />
      <text x="185" y="233" textAnchor="middle" fontSize="14" fontFamily="Inter, Arial" fill="#0E7490">Savings</text>
      <ellipse cx="185" cy="280" rx="42" ry="22" fill="#CCFBF1" />
      <rect x="152" y="252" width="66" height="28" rx="14" fill="#14B8A6" />
      <rect x="330" y="64" width="230" height="140" rx="24" fill="#FFFFFF" />
      <polyline points="356,168 400,140 438,150 490,104 528,86" fill="none" stroke="#2563EB" strokeWidth="6" strokeLinecap="round" />
      <circle cx="528" cy="86" r="7" fill="#EC4899" />
      <path d="M500 78l28-18 8 10" fill="none" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" />
      <rect x="348" y="224" width="92" height="78" rx="8" fill="#EEF2FF" />
      <polygon points="348,224 394,186 440,224" fill="#4F46E5" />
      <rect x="378" y="252" width="24" height="50" fill="#FFFFFF" />
      <rect x="456" y="236" width="96" height="86" rx="18" fill="#FFF7ED" />
      <circle cx="504" cy="268" r="16" fill="#F97316" />
      <rect x="478" y="286" width="52" height="18" rx="9" fill="#FB923C" />
      <circle cx="132" cy="108" r="28" fill="#FDF2F8" />
      <circle cx="132" cy="108" r="16" fill="none" stroke="#EC4899" strokeWidth="5" />
      <circle cx="132" cy="108" r="3" fill="#7C3AED" />
    </svg>
  );
}
