import React from 'react';
import type { Priority } from '../../types';
import { AlertCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

interface PriorityBadgeProps {
  priority: Priority | string;
  showIcon?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, showIcon = true }) => {
  const getStyle = () => {
    switch (priority) {
      case 'URGENT':
        return {
          bg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
          label: 'Urgent',
          icon: AlertCircle,
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30',
          label: 'Élevée',
          icon: AlertTriangle,
        };
      case 'NORMAL':
      default:
        return {
          bg: 'bg-slate-500/10 text-slate-600 dark:text-emc-secondary border-slate-500/20',
          label: 'Normal',
          icon: ShieldCheck,
        };
    }
  };

  const style = getStyle();
  const IconComponent = style.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold tracking-wide border ${style.bg}`}
    >
      {showIcon && <IconComponent className="w-3 h-3" />}
      {style.label}
    </span>
  );
};
