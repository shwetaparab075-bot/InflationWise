import React from 'react';

const EmptyState = ({ icon: Icon, title, subtitle, description, action, actionLabel, onAction }) => {
  const sub = subtitle || description;
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F4F9FF] text-[#2478E8] mb-4">
          <Icon className="h-7 w-7" />
        </div>
      )}
      <h3 className="text-base font-semibold text-[#10233F] mb-1">{title}</h3>
      {sub && <p className="text-sm text-[#6B7A90] max-w-sm leading-relaxed mb-5">{sub}</p>}
      {action}
      {!action && actionLabel && onAction && (
        <button type="button" className="btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
