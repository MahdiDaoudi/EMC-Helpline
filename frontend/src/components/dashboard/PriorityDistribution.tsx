import React from 'react';
import { AlertCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export const PriorityDistribution: React.FC = () => {
  const priorities = [
    {
      level: 'URGENT',
      count: 37,
      percentage: 12,
      color: 'bg-red-500',
      textColor: 'text-red-600 dark:text-red-400',
      icon: AlertCircle,
    },
    {
      level: 'HIGH',
      count: 184,
      percentage: 38,
      color: 'bg-orange-500',
      textColor: 'text-orange-600 dark:text-orange-400',
      icon: AlertTriangle,
    },
    {
      level: 'NORMAL',
      count: 245,
      percentage: 50,
      color: 'bg-slate-400',
      textColor: 'text-slate-600 dark:text-emc-secondary',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="emc-card p-5 flex flex-col justify-between h-full">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-emc-primary">
          Priority Triage
        </h3>
        <p className="text-xs text-slate-500 dark:text-emc-secondary">
          Active cases categorized by urgency priority
        </p>
      </div>

      <div className="space-y-4 my-4">
        {priorities.map((p) => {
          const Icon = p.icon;
          return (
            <div key={p.level} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className={`flex items-center gap-1.5 font-bold ${p.textColor}`}>
                  <Icon className="w-3.5 h-3.5" />
                  {p.level}
                </span>
                <span className="text-slate-500 dark:text-emc-secondary font-mono text-[11px]">
                  {p.count} cases ({p.percentage}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-emc-elevated overflow-hidden">
                <div
                  className={`h-full rounded-full ${p.color} transition-all duration-500`}
                  style={{ width: `${p.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-[11px] text-blue-700 dark:text-blue-300">
        💡 <span className="font-semibold">Helpline SLA Notice:</span> Urgent cases trigger automatic notification to triage officers within 15 minutes.
      </div>
    </div>
  );
};
