import React from 'react';

/**
 * LoadingSkeleton — shimmer placeholder
 * Props: rows, height, className
 */
const shimmer = 'animate-pulse bg-slate-200 rounded-xl';

export const SkeletonLine = ({ width = 'w-full', height = 'h-4', className = '' }) => (
  <div className={`${shimmer} ${width} ${height} ${className}`} />
);

export const SkeletonCard = ({ className = '' }) => (
  <div className={`card p-5 space-y-3 ${className}`}>
    <SkeletonLine width="w-1/3" height="h-3" />
    <SkeletonLine width="w-2/3" height="h-7" />
    <SkeletonLine width="w-1/2" height="h-3" />
  </div>
);

export const SkeletonStatCards = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="card overflow-hidden">
    <div className="h-10 bg-slate-50 border-b border-slate-200 px-4 flex items-center gap-4">
      <SkeletonLine width="w-24" height="h-3" />
      <SkeletonLine width="w-20" height="h-3" />
      <SkeletonLine width="w-28" height="h-3" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="border-b border-slate-100 px-4 py-3 flex items-center gap-4">
        <SkeletonLine width="w-32" height="h-3" />
        <SkeletonLine width="w-24" height="h-3" />
        <SkeletonLine width="w-20" height="h-3" />
      </div>
    ))}
  </div>
);

const LoadingSkeleton = ({ type = 'card', ...props }) => {
  if (type === 'stat-cards') return <SkeletonStatCards />;
  if (type === 'table')      return <SkeletonTable {...props} />;
  return <SkeletonCard {...props} />;
};

export default LoadingSkeleton;
