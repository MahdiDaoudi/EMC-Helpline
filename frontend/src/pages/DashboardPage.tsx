import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  RotateCw,
  Image as ImageIcon,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Users,
  TrendingUp,
  PlusCircle,
  Shield,
  CheckSquare,
  AlertCircle,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { DashboardService } from '../services/dashboard.service';
import { useAuth } from '../context/AuthContext';
import type { TimeSeriesData, Signalement, DashboardStats } from '../types';
import { KpiCard } from '../components/dashboard/KpiCard';
import { SignalementsChart } from '../components/dashboard/SignalementsChart';
import { RecentSignalementsTable } from '../components/dashboard/RecentSignalementsTable';
import { StatusDistribution } from '../components/dashboard/StatusDistribution';
import { KpiSkeleton, ChartSkeleton, TableSkeleton } from '../components/common/LoadingState';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

type PlatformSummary = { id: number; name: string; icon?: string | null; count: number };

// ─── Platform Bar Row ───────────────────────────────────────────────────────
const PlatformBar: React.FC<{ platform: PlatformSummary; max: number }> = ({ platform, max }) => {
  const [showImage, setShowImage] = useState<boolean>(Boolean(platform.icon));
  const pct = max > 0 ? Math.round((platform.count / max) * 100) : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {showImage && platform.icon ? (
            <img
              src={platform.icon}
              alt={platform.name}
              className="w-6 h-6 rounded-md object-contain bg-slate-100 dark:bg-emc-elevated p-0.5 flex-shrink-0"
              onError={() => setShowImage(false)}
            />
          ) : (
            <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-emc-elevated flex items-center justify-center flex-shrink-0">
              <ImageIcon className="w-3.5 h-3.5 text-slate-400 dark:text-emc-secondary" />
            </div>
          )}
          <span className="text-xs font-semibold text-slate-700 dark:text-emc-primary truncate">
            {platform.name}
          </span>
        </div>
        <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-emc-secondary flex-shrink-0">
          {platform.count}
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-emc-elevated overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ─── Priority Triage Bar ─────────────────────────────────────────────────────
const PriorityTriage: React.FC<{ stats: DashboardStats }> = ({ stats }) => {
  const total = stats.totalSignalements || 1;
  const urgentCount = stats.highPriorityCases ?? 0;
  const pendingCount = stats.pendingSignalements ?? 0;
  const resolvedCount = stats.resolvedSignalements ?? 0;

  const priorities = [
    {
      level: 'Urgent / Haute',
      count: urgentCount,
      pct: Math.round((urgentCount / total) * 100),
      barColor: 'bg-rose-500',
      textColor: 'text-rose-600 dark:text-rose-400',
      Icon: AlertCircle,
    },
    {
      level: 'En attente',
      count: pendingCount,
      pct: Math.round((pendingCount / total) * 100),
      barColor: 'bg-amber-400',
      textColor: 'text-amber-600 dark:text-amber-400',
      Icon: AlertTriangle,
    },
    {
      level: 'Résolus / Validés',
      count: resolvedCount,
      pct: Math.round((resolvedCount / total) * 100),
      barColor: 'bg-emerald-500',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      Icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-4">
      {priorities.map((p) => {
        const Icon = p.Icon;
        return (
          <div key={p.level} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className={`flex items-center gap-1.5 font-semibold ${p.textColor}`}>
                <Icon className="w-3.5 h-3.5" />
                {p.level}
              </span>
              <span className="text-slate-400 dark:text-emc-muted-fg font-mono">
                {p.count} <span className="opacity-60">({p.pct}%)</span>
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-emc-elevated overflow-hidden">
              <div
                className={`h-full rounded-full ${p.barColor} transition-all duration-700`}
                style={{ width: `${p.pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Quick Action Button ─────────────────────────────────────────────────────
const QuickActionBtn: React.FC<{
  to: string;
  icon: React.ElementType;
  label: string;
  primary?: boolean;
}> = ({ to, icon: Icon, label, primary }) => (
  <Link
    to={to}
    className={`
      flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150
      ${primary
        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20'
        : 'bg-white dark:bg-emc-elevated border border-slate-200 dark:border-emc-border text-slate-700 dark:text-emc-primary hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20'
      }
    `}
  >
    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
    <span className="whitespace-nowrap">{label}</span>
  </Link>
);

// ─── Greeting Helper ─────────────────────────────────────────────────────────
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

function formatNow(): string {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

// ─── Dashboard Page ──────────────────────────────────────────────────────────
export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const fullName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Utilisateur';

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartRange, setChartRange] = useState<'7d' | '30d'>('7d');
  const [chartData, setChartData] = useState<TimeSeriesData[]>([]);
  const [recentSignalements, setRecentSignalements] = useState<Signalement[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, chartRes, recentRes] = await Promise.all([
        DashboardService.getDashboardStats(),
        DashboardService.getTimeSeriesData(chartRange),
        DashboardService.getRecentSignalements(),
      ]);
      setStats(statsRes ?? null);
      setChartData(Array.isArray(chartRes) ? chartRes : []);
      setRecentSignalements(Array.isArray(recentRes) ? recentRes : []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Dashboard load failed', err);
    } finally {
      setLoading(false);
    }
  }, [chartRange]);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  const treatedCount = stats ? Math.max(0, stats.totalSignalements - stats.pendingSignalements) : 0;
  const topPlatforms = stats?.topPlatforms ?? [];
  const maxPlatformCount = topPlatforms.length > 0 ? Math.max(...topPlatforms.map((p) => p.count)) : 1;

  // Build status donut data from real stats
  const statusDonutData = stats
    ? [
        { name: 'En attente',  value: stats.pendingSignalements,  color: '#F59E0B' },
        { name: 'Validés',     value: stats.resolvedSignalements, color: '#10B981' },
        { name: 'En cours',    value: Math.max(0, stats.totalSignalements - stats.pendingSignalements - stats.resolvedSignalements), color: '#3B82F6' },
      ].filter((d) => d.value > 0)
    : undefined;

  return (
    <ErrorBoundary>
      <div className="space-y-5 max-w-7xl mx-auto pb-10">

        {/* ─── Hero Header ──────────────────────────────────────────────────── */}
        <div className="animate-slide-up">
          {/* Gradient accent banner */}
          <div className="relative overflow-hidden rounded-2xl dashboard-hero-gradient p-6 text-white shadow-xl shadow-blue-900/20">
            {/* decorative circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Left */}
              <div>
                <p className="text-white/70 text-xs font-medium flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatNow()}
                </p>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                  {getGreeting()} {fullName} 👋
                </h1>
                <p className="text-white/70 text-sm mt-1">
                  Vue d'ensemble de l'activité des signalements EMCS
                </p>
              </div>

              {/* Right: controls */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Range Pill */}
                <div className="inline-flex items-center rounded-full bg-white/15 backdrop-blur-sm p-1 gap-0.5">
                  {(['7d', '30d'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setChartRange(r)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        chartRange === r
                          ? 'bg-white text-blue-700 shadow'
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      {r === '7d' ? '7 jours' : '30 jours'}
                    </button>
                  ))}
                </div>

                {/* Refresh */}
                <button
                  onClick={() => { void handleRefresh(); }}
                  disabled={refreshing}
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center
                    text-white backdrop-blur-sm transition-colors disabled:opacity-50"
                  title="Actualiser"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions Strip */}
          <div className="flex items-center gap-2 flex-wrap mt-3">
            <QuickActionBtn to="/signalements/nouveau" icon={PlusCircle} label="Nouveau signalement" primary />
            <QuickActionBtn to="/signalements" icon={FileText} label="Tous les signalements" />
            <QuickActionBtn to="/victims" icon={Shield} label="Registre victimes" />
            <QuickActionBtn to="/validates" icon={CheckSquare} label="Validations" />
          </div>
        </div>

        {/* ─── KPI Cards ────────────────────────────────────────────────────── */}
        {loading || !stats ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="animate-slide-up animate-slide-up-delay-1">
              <KpiCard
                label="Total des signalements"
                value={stats.totalSignalements}
                trend={stats.trends?.total}
                icon={FileText}
                colorScheme="blue"
                subtitle="Tous statuts confondus"
              />
            </div>
            <div className="animate-slide-up animate-slide-up-delay-2">
              <KpiCard
                label="En attente"
                value={stats.pendingSignalements}
                trend={stats.trends?.pending}
                icon={AlertTriangle}
                colorScheme="amber"
                subtitle="Nécessitent une action"
              />
            </div>
            <div className="animate-slide-up animate-slide-up-delay-3">
              <KpiCard
                label="Validés"
                value={stats.resolvedSignalements}
                trend={stats.trends?.resolved}
                icon={CheckCircle2}
                colorScheme="emerald"
                subtitle="Traités avec succès"
              />
            </div>
            <div className="animate-slide-up animate-slide-up-delay-4">
              <KpiCard
                label="Haute priorité"
                value={stats.highPriorityCases ?? treatedCount}
                trend={stats.trends?.highPriority}
                icon={Users}
                colorScheme="rose"
                subtitle="Cas urgents actifs"
              />
            </div>
          </div>
        )}

        {/* ─── Analytics Row: Chart + Status Donut ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Area Chart — 2/3 */}
          <div className="lg:col-span-2 emc-card p-5 flex flex-col animate-slide-up animate-slide-up-delay-2">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-emc-primary flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  Évolution des signalements
                </h3>
                <p className="text-xs text-slate-500 dark:text-emc-secondary mt-0.5">
                  Nombre de signalements reçus sur la période sélectionnée
                </p>
              </div>
            </div>
            <div className="flex-1 h-[260px] min-w-0">
              {loading ? <ChartSkeleton /> : <SignalementsChart data={chartData} />}
            </div>
          </div>

          {/* Status Donut — 1/3 */}
          <div className="animate-slide-up animate-slide-up-delay-3">
            {loading || !stats ? (
              <div className="emc-card p-5 h-full skeleton-shimmer min-h-[300px]" />
            ) : (
              <StatusDistribution data={statusDonutData} />
            )}
          </div>
        </div>

        {/* ─── Platforms: full width, 2-column grid of bars ───────────────────── */}
        <div className="emc-card p-5 animate-slide-up animate-slide-up-delay-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-emc-primary">
                Signalements par plateforme
              </h3>
              <p className="text-xs text-slate-500 dark:text-emc-secondary mt-0.5">
                Données en temps réel depuis la base de données
              </p>
            </div>
            <a
              href="/platforms"
              className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline flex-shrink-0"
            >
              Voir tout →
            </a>
          </div>

          {loading || !stats ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3 w-28 rounded skeleton-shimmer" />
                  <div className="h-1.5 w-full rounded-full skeleton-shimmer" />
                </div>
              ))}
            </div>
          ) : topPlatforms.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-emc-muted-fg">Aucune plateforme trouvée.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {topPlatforms.map((p) => (
                <PlatformBar key={p.id} platform={p} max={maxPlatformCount} />
              ))}
            </div>
          )}
        </div>

        {/* ─── Priority Triage: full width below platforms ─────────────────────── */}
        <div className="emc-card p-5 animate-slide-up animate-slide-up-delay-3">
          <div className="flex flex-col md:flex-row md:items-start md:gap-10">
            {/* Left: title + SLA notice */}
            <div className="flex-shrink-0 md:w-64 mb-4 md:mb-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-emc-primary mb-1">
                Triage par priorité
              </h3>
              <p className="text-xs text-slate-500 dark:text-emc-secondary mb-4">
                Répartition des cas actifs par niveau d'urgence
              </p>
              <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                💡 <span className="font-semibold">SLA Helpline :</span> Les cas urgents déclenchent une notification automatique aux officiers de triage sous 15 minutes.
              </div>
            </div>

            {/* Right: bars — take remaining width */}
            <div className="flex-1">
              {loading || !stats ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="h-3 w-24 rounded bg-slate-100 dark:bg-emc-elevated skeleton-shimmer" />
                      <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-emc-elevated skeleton-shimmer" />
                    </div>
                  ))}
                </div>
              ) : (
                <PriorityTriage stats={stats} />
              )}
            </div>
          </div>
        </div>

        {/* ─── Recent Signalements Table (full width) ─────────────────────────── */}
        <div className="animate-slide-up animate-slide-up-delay-4">
          {loading ? <TableSkeleton rows={6} /> : <RecentSignalementsTable signalements={recentSignalements} />}
        </div>

      </div>
    </ErrorBoundary>
  );
};
