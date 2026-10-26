import React, { useId } from 'react';

export default function Logo({ className = 'h-9 w-9' }) {
  const rawId = useId().replace(/:/g, '');
  const gradientId = `iw-${rawId}`;

  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="InflationWise">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#20205A" />
          <stop offset="100%" stopColor="#3155C6" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill={`url(#${gradientId})`} />
      <text x="8" y="32" fill="#FFFFFF" fontSize="22" fontFamily="Arial, sans-serif" fontWeight="700">₹</text>
      <path d="M27 31c4-6 8-8 13-10" fill="none" stroke="#16C7D9" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M34 18h7v7" fill="none" stroke="#16C7D9" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Brand({ light = false, tagline = false, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Logo />
      <span className="flex flex-col leading-tight">
        <span className={`font-display text-lg font-bold ${light ? 'text-white' : 'text-[#20205A]'}`}>InflationWise</span>
        {tagline && (
          <span className={`text-[11px] font-medium ${light ? 'text-[#16C7D9]' : 'text-[#6B7280]'}`}>
            Smart Inflation-Based Financial Planning
          </span>
        )}
      </span>
    </span>
  );
}
