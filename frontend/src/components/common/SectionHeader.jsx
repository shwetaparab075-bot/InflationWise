import React from 'react';

/**
 * SectionHeader — consistent page/section heading block
 * Props: title, subtitle, children (right-side actions)
 */
const SectionHeader = ({ title, subtitle, children, className = '' }) => (
  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}>
    <div>
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
    {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
  </div>
);

export default SectionHeader;
