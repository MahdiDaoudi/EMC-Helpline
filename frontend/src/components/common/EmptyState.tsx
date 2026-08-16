import React from 'react';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ElementType;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No data available',
  description = 'There are currently no records to display.',
  actionLabel,
  onAction,
  icon: Icon = FolderOpen,
}) => {
  return (
    <div className="emc-card p-8 text-center flex flex-col items-center justify-center my-4">
      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-emc-elevated flex items-center justify-center text-slate-400 mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-semibold text-slate-900 dark:text-emc-primary mb-1">{title}</h4>
      <p className="text-xs text-slate-500 dark:text-emc-secondary max-w-sm mb-4">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
