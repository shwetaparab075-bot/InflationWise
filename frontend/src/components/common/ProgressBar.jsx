import React from 'react';

const colorMap = {
  emerald: 'bg-emerald-500',
  blue: 'bg-[#2478E8]',
  purple: 'bg-violet-500',
  orange: 'bg-amber-500',
  red: 'bg-red-500',
  slate: 'bg-slate-400',
};

const ProgressBar = ({
  progress,
  percentage,
  color = 'blue',
  height = 'h-2',
  showLabel = false,
  animated = true,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, percentage ?? progress ?? 0));
  const barColor = colorMap[color] || colorMap.blue;

  return (
    <div className="w-full space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs font-medium text-[#6B7A90]">
          <span>Progress</span>
          <span className="font-semibold text-[#10233F]">{clampedProgress}%</span>
        </div>
      )}
      <div className={`w-full ${height} rounded-full bg-slate-100 overflow-hidden`}>
        <div
          className={`${height} rounded-full ${barColor} ${animated ? 'transition-all duration-700 ease-out' : ''}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
