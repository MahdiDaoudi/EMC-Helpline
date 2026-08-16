import React from 'react';
import type { RecentActivityItem } from '../../types';
import { ShieldAlert, Building2, Share2, CheckCircle2, RefreshCw } from 'lucide-react';

interface RecentActivityProps {
  activities?: RecentActivityItem[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities = [] }) => {
  const safeActivities = Array.isArray(activities) ? activities : [];

  const getIcon = (type: RecentActivityItem['type']) => {
    switch (type) {
      case 'CREATED':
        return { icon: ShieldAlert, color: 'text-amber-500 bg-amber-500/10' };
      case 'ASSIGNED':
        return { icon: Building2, color: 'text-blue-500 bg-blue-500/10' };
      case 'PLATFORM_REPORT':
        return { icon: Share2, color: 'text-indigo-500 bg-indigo-500/10' };
      case 'VALIDATED':
        return { icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10' };
      case 'STATUS_CHANGE':
      default:
        return { icon: RefreshCw, color: 'text-purple-500 bg-purple-500/10' };
    }
  };

  return (
    <div className="emc-card p-5 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-emc-primary">
            Audit Activity Log
          </h3>
          <p className="text-xs text-slate-500 dark:text-emc-secondary">
            Real-time helpline case lifecycle events
          </p>
        </div>
      </div>

      <div className="relative pl-6 space-y-4 my-2 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {safeActivities.length > 0 ? (
          safeActivities.map((act) => {
            const { icon: Icon, color } = getIcon(act.type);
            return (
              <div key={act.id} className="relative flex items-start gap-3 text-xs">
                <div
                  className={`absolute -left-[27px] top-0 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-emc-page ${color}`}
                >
                  <Icon className="w-3 h-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-emc-primary truncate">
                      {act.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono ml-2 flex-shrink-0">
                      {act.timestamp}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-emc-secondary text-[11px] mt-0.5">
                    {act.description}
                  </p>
                  {act.user && (
                    <span className="inline-block mt-1 text-[10px] font-medium text-slate-400">
                      by {act.user.name}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-slate-500">No recent activity recorded.</p>
        )}
      </div>
    </div>
  );
};
