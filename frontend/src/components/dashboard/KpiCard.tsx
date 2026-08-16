import React from 'react';

type ColorScheme = 'blue' | 'amber' | 'emerald' | 'rose' | 'violet';

interface KpiCardProps {
  label: string;
  value: string | number;
  trend?: number;
  trendText?: string;
  icon?: React.ElementType;
  colorScheme?: ColorScheme;
  subtitle?: string;
}

const schemeConfig: Record<ColorScheme, {
  accent: string;
  glow: string;
  iconBg: string;
  iconColor: string;
  trendUpBg: string;
  trendUpText: string;
  trendDownBg: string;
  trendDownText: string;
}> = {
  blue: {
    accent: 'kpi-accent-blue',
    glow: 'kpi-glow-blue',
    iconBg: 'bg-blue-50 dark:bg-blue-950/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
    trendUpBg: 'bg-blue-50 dark:bg-blue-950/40',
    trendUpText: 'text-blue-600 dark:text-blue-400',
    trendDownBg: 'bg-rose-50 dark:bg-rose-950/40',
    trendDownText: 'text-rose-600 dark:text-rose-400',
  },
  amber: {
    accent: 'kpi-accent-amber',
    glow: 'kpi-glow-amber',
    iconBg: 'bg-amber-50 dark:bg-amber-950/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
    trendUpBg: 'bg-amber-50 dark:bg-amber-950/40',
    trendUpText: 'text-amber-600 dark:text-amber-400',
    trendDownBg: 'bg-rose-50 dark:bg-rose-950/40',
    trendDownText: 'text-rose-600 dark:text-rose-400',
  },
  emerald: {
    accent: 'kpi-accent-emerald',
    glow: 'kpi-glow-emerald',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    trendUpBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    trendUpText: 'text-emerald-600 dark:text-emerald-400',
    trendDownBg: 'bg-rose-50 dark:bg-rose-950/40',
    trendDownText: 'text-rose-600 dark:text-rose-400',
  },
  rose: {
    accent: 'kpi-accent-rose',
    glow: 'kpi-glow-rose',
    iconBg: 'bg-rose-50 dark:bg-rose-950/40',
    iconColor: 'text-rose-600 dark:text-rose-400',
    trendUpBg: 'bg-rose-50 dark:bg-rose-950/40',
    trendUpText: 'text-rose-600 dark:text-rose-400',
    trendDownBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    trendDownText: 'text-emerald-600 dark:text-emerald-400',
  },
  violet: {
    accent: 'kpi-accent-violet',
    glow: 'kpi-glow-violet',
    iconBg: 'bg-violet-50 dark:bg-violet-950/40',
    iconColor: 'text-violet-600 dark:text-violet-400',
    trendUpBg: 'bg-violet-50 dark:bg-violet-950/40',
    trendUpText: 'text-violet-600 dark:text-violet-400',
    trendDownBg: 'bg-rose-50 dark:bg-rose-950/40',
    trendDownText: 'text-rose-600 dark:text-rose-400',
  },
};

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  trend,
  icon: Icon,
  colorScheme = 'blue',
  subtitle,
}) => {
  const cfg = schemeConfig[colorScheme];
  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;

  const getTrendBadge = () => {
    if (trend === undefined) return null;

    let bg: string, fg: string, label: string;
    if (isPositive) {
      bg = cfg.trendUpBg; fg = cfg.trendUpText; label = `↑ ${trend}%`;
    } else if (isNegative) {
      bg = cfg.trendDownBg; fg = cfg.trendDownText; label = `↓ ${Math.abs(trend)}%`;
    } else {
      bg = 'bg-slate-100 dark:bg-emc-elevated'; fg = 'text-slate-500 dark:text-emc-secondary'; label = '→ 0%';
    }

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${bg} ${fg}`}>
        {label}
      </span>
    );
  };

  return (
    <div
      className={`emc-card emc-card-hover ${cfg.accent} ${cfg.glow}
        p-5 flex flex-col justify-between h-full
        bg-white dark:bg-emc-surface rounded-xl
        transition-all duration-200 cursor-default select-none`}
    >
      {/* Top row: label + icon */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-xs font-semibold text-slate-500 dark:text-emc-muted-fg leading-tight">
          {label}
        </span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl ${cfg.iconBg} ${cfg.iconColor} flex items-center justify-center flex-shrink-0 shadow-sm`}>
            <Icon className="w-4.5 h-4.5" />
          </div>
        )}
      </div>

      {/* Value + Trend */}
      <div className="flex items-end justify-between gap-2">
        <span className="text-[28px] font-extrabold text-slate-900 dark:text-emc-primary tracking-tight leading-none">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {getTrendBadge()}
      </div>

      {/* Optional subtitle */}
      {subtitle && (
        <p className="mt-2 text-[11px] text-slate-400 dark:text-emc-muted-fg leading-tight">
          {subtitle}
        </p>
      )}
    </div>
  );
};
