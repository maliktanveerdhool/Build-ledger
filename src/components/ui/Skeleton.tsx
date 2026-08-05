import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 rounded ${className}`}
    />
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="space-y-3 p-4 bg-white rounded-xl border border-slate-200">
      <Skeleton className="h-8 w-1/4 mb-4" />
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex space-x-4 items-center py-2 border-b border-slate-100 last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={`h-5 flex-1 ${c === 0 ? 'w-1/3' : 'w-1/6'}`} />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-3 w-48" />
    </div>
  );
};
