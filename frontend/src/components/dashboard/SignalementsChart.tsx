import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import type { TimeSeriesData } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface SignalementsChartProps {
  data: TimeSeriesData[];
}

const SERIES = [
  { key: 'total',      name: 'Total',       color: '#3B82F6', gradId: 'colorTotal' },
  { key: 'validated',  name: 'Validés',     color: '#10B981', gradId: 'colorValidated' },
  { key: 'inProgress', name: 'En cours',    color: '#8B5CF6', gradId: 'colorInProgress' },
] as const;

// Pure chart component. Header and period selector should be rendered by the parent card.
export const SignalementsChart: React.FC<SignalementsChartProps> = ({ data }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const gridColor     = isDark ? 'var(--chart-grid)'         : '#E2E8F0';
  const tickColor     = isDark ? 'var(--chart-tick)'         : '#94A3B8';
  const tooltipBg     = isDark ? 'var(--chart-tooltip-bg)'   : '#FFFFFF';
  const tooltipBorder = isDark ? 'var(--chart-tooltip-border)' : '#E2E8F0';
  const tooltipText   = isDark ? 'var(--chart-tooltip-text)' : '#0F172A';

  return (
    <div className="w-full h-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 16, left: -8, bottom: 0 }}>
          <defs>
            {SERIES.map(({ gradId, color }) => (
              <linearGradient key={gradId} id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={color} stopOpacity={0.28} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke={gridColor}
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: tickColor }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: tickColor }}
            width={32}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              borderColor: tooltipBorder,
              borderRadius: '10px',
              fontSize: '12px',
              color: tooltipText,
              boxShadow: isDark
                ? '0 12px 24px -4px rgba(0,0,0,0.5)'
                : '0 12px 24px -4px rgba(0,0,0,0.12)',
              padding: '10px 14px',
            }}
            labelStyle={{ fontWeight: 700, marginBottom: 4 }}
            cursor={{ stroke: isDark ? '#353C46' : '#E2E8F0', strokeWidth: 1 }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
          />

          {SERIES.map(({ key, name, color, gradId }) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              name={name}
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${gradId})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, fill: color }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
