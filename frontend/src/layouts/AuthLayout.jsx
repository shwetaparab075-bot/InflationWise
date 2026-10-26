import React from 'react';
import { Link } from 'react-router-dom';
import { Brand } from '../components/Logo';

export default function AuthLayout({ heading, description, children, singleImage = false, accents = false, oneImage = false }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className={`relative overflow-hidden text-white ${oneImage ? 'flex min-h-[320px] flex-col justify-between' : 'hidden lg:flex lg:flex-col lg:justify-between'}`}>
        <img src="/images/planning.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[#20205A]/82" />
        {accents && (
          <div className="pointer-events-none absolute inset-0 z-[1] text-[#16C7D9]" aria-hidden="true">
            <span className="absolute right-10 top-24 text-5xl font-bold opacity-80">₹</span>
            <svg className="absolute bottom-16 right-12 h-16 w-28" viewBox="0 0 112 64" fill="none">
              <path d="M4 52 L28 36 L48 44 L76 18 L108 8" stroke="#16C7D9" strokeWidth="4" strokeLinecap="round" />
              <circle cx="108" cy="8" r="4" fill="#16C7D9" />
            </svg>
          </div>
        )}
        <div className="relative z-10 flex h-full flex-col justify-between p-10">
          <Link to="/"><Brand light tagline /></Link>
          <div>
            <h1 className="font-display text-4xl font-bold leading-tight">{heading}</h1>
            <p className="mt-4 max-w-md text-white/85">{description}</p>
            {!oneImage && !singleImage && <img src="/images/savings.jpg" alt="" className="mt-8 h-52 w-full rounded-xl object-cover" />}
          </div>
          <p className="text-sm text-[#16C7D9]">Smart Inflation-Based Financial Planning</p>
        </div>
      </section>
      <section className="flex items-center justify-center bg-[#F7FAFC] px-4 py-10">
        <div className="w-full max-w-md">
          {!oneImage && <div className="relative mb-6 overflow-hidden rounded-xl p-5 text-white lg:hidden">
            <img src="/images/planning.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[#20205A]/82" />
            <div className="relative">
              <Brand light tagline />
              <p className="mt-3 font-display text-xl font-bold">{heading}</p>
              <p className="mt-2 text-sm text-white/85">{description}</p>
            </div>
          </div>}
          <div className="card p-6 sm:p-8">{children}</div>
        </div>
      </section>
    </div>
  );
}
