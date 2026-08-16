import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

interface StatusDistributionProps {
  data?: { name: string; value: number; color: string }[];
}

const defaultStatusData = [
  { name: 'Pending', value: 142, color: '#F59E0B' },
  { name: 'In Progress', value: 164, color: '#3B82F6' },
  { name: 'Validated', value: 680, color: '#10B981' },
  { name: 'Rejected', value: 120, color: '#EF4444' },
  { name: 'Closed', value: 178, color: '#64748B' },
];

export const StatusDistribution: React.FC<StatusDistributionProps> = ({
  data = defaultStatusData,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="emc-card p-5 flex flex-col justify-between h-full">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-emc-primary">
          Status Breakdown
        </h3>
        <p className="text-xs text-slate-500 dark:text-emc-secondary">
          Case state distribution across all reports
        </p>
      </div>

      <div className="w-full h-[200px] my-2 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke={isDark ? 'var(--chart-pie-stroke)' : '#FFFFFF'} strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? 'var(--chart-tooltip-bg)' : '#FFFFFF',
                borderColor: isDark ? 'var(--chart-tooltip-border)' : '#E2E8F0',
                borderRadius: '8px',
                fontSize: '12px',
                color: isDark ? 'var(--chart-tooltip-text)' : '#0F172A',
                boxShadow: isDark ? '0 10px 15px -3px rgba(0, 0, 0, 0.4)' : undefined,
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total Count Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-extrabold text-slate-900 dark:text-emc-primary leading-none">
            {total}
          </span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">
            Cases
          </span>
        </div>
      </div>

      {/* Legend Grid */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-emc-border text-xs">
        {data.map((item, idx) => {
          const percent = ((item.value / total) * 100).toFixed(1);
          return (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-600 dark:text-emc-secondary truncate text-[11px]">
                  {item.name}
                </span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-emc-primary text-[11px] ml-1">
                {percent}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
