import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

export default function Legal() {
  const privacy = useLocation().pathname.includes('privacy');
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl font-bold">{privacy ? 'Privacy Policy' : 'Terms & Conditions'}</h1>
        {privacy ? (
          <div className="mt-4 space-y-3 text-sm leading-7 text-[#64748B]">
            <p>InflationWise stores your name, email, mobile number, and the financial records you enter so the dashboard can show your own plan.</p>
            <p>Passwords are hashed with bcrypt before they are saved. Each account can only read and change its own expenses, goals, savings, and reports.</p>
            <p>Profile photos stay in your account record. Do not upload images you do not have permission to store.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3 text-sm leading-7 text-[#64748B]">
            <p>InflationWise provides estimated calculations for planning and education. It does not provide regulated investment advice, and it does not guarantee inflation rates or investment returns.</p>
            <p>You are responsible for the accuracy of the income, expense, and goal figures you enter. Review important money decisions with a qualified adviser when you need one.</p>
          </div>
        )}
        <Link to="/" className="mt-6 inline-block text-sm font-semibold text-[#3155C6]">Back to home</Link>
      </main>
    </div>
  );
}
