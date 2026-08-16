import React from 'react';

export const KpiSkeleton: React.FC = () => (
  <div className="emc-card p-5 animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="h-3 bg-slate-200 dark:bg-emc-elevated rounded w-24"></div>
      <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-emc-elevated"></div>
    </div>
    <div className="h-7 bg-slate-200 dark:bg-emc-elevated rounded w-20 mb-2"></div>
    <div className="h-3 bg-slate-200 dark:bg-emc-elevated rounded w-32"></div>
  </div>
);

export const ChartSkeleton: React.FC = () => (
  <div className="emc-card p-5 animate-pulse min-h-[320px] flex flex-col justify-between">
    <div className="flex items-center justify-between mb-4">
      <div className="h-4 bg-slate-200 dark:bg-emc-elevated rounded w-36"></div>
      <div className="h-7 bg-slate-200 dark:bg-emc-elevated rounded w-48"></div>
    </div>
    <div className="flex-1 bg-slate-100 dark:bg-emc-elevated/50 rounded-lg min-h-[220px]"></div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="emc-card overflow-hidden animate-pulse">
    <div className="p-4 border-b border-slate-200 dark:border-emc-border flex justify-between">
      <div className="h-4 bg-slate-200 dark:bg-emc-elevated rounded w-40"></div>
      <div className="h-8 bg-slate-200 dark:bg-emc-elevated rounded w-64"></div>
    </div>
    <div className="divide-y divide-slate-100 dark:divide-emc-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex items-center justify-between">
          <div className="h-4 bg-slate-200 dark:bg-emc-elevated rounded w-28"></div>
          <div className="h-4 bg-slate-200 dark:bg-emc-elevated rounded w-48"></div>
          <div className="h-4 bg-slate-200 dark:bg-emc-elevated rounded w-20"></div>
          <div className="h-4 bg-slate-200 dark:bg-emc-elevated rounded w-16"></div>
        </div>
      ))}
    </div>
  </div>
);
