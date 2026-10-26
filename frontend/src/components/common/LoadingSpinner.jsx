import React from 'react';

const Spinner = ({ label = 'Loading…' }) => (
  <div className="flex min-h-[240px] items-center justify-center">
    <div className="flex items-center gap-3 text-sm font-semibold text-[#2478E8]">
      <span className="h-5 w-5 rounded-full border-2 border-[#2478E8]/30 border-t-[#2478E8] animate-spin" />
      {label}
    </div>
  </div>
);

export default Spinner;
