import React from 'react';
import type { SignalementStatus } from '../../types';

interface StatusBadgeProps {
  status: SignalementStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'PENDING':
        return {
          bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          dot: 'bg-amber-500',
          label: 'En attente',
        };
      case 'IN_PROGRESS':
        return {
          bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
          dot: 'bg-blue-500 animate-pulse',
          label: 'En cours',
        };
      case 'VALIDATED':
        return {
          bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          dot: 'bg-emerald-500',
          label: 'Validé',
        };
      case 'REJECTED':
        return {
          bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
          dot: 'bg-rose-500',
          label: 'Rejeté',
        };
      case 'CLOSED':
        return {
          bg: 'bg-slate-500/10 text-slate-600 dark:text-emc-secondary border-slate-500/20',
          dot: 'bg-slate-400',
          label: 'Clôturé',
        };
      case 'ASSIGNED':
        return {
          bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          dot: 'bg-amber-500',
          label: 'En attente',
        };
      case 'ON_HOLD':
        return {
          bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          dot: 'bg-amber-500',
          label: 'En attente',
        };
      case 'COMPLETED':
        return {
          bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          dot: 'bg-emerald-500',
          label: 'Traité',
        };
      default:
        return {
          bg: 'bg-slate-500/10 text-slate-600 dark:text-emc-secondary border-slate-500/20',
          dot: 'bg-slate-400',
          label: status,
        };
    }
  };

  const style = getBadgeStyle();
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${padding} ${style.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
};
