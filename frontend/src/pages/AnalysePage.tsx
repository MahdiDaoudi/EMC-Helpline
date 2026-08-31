import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart2,
  Filter,
  X,
  Calendar,
  Download,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Clock3,
  Globe,
  TrendingUp,
  TrendingDown,
  CheckSquare,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

import type {
  AnalyticsResponseData,
  AnalyticsQueryFilter,
} from '../services/analytics.service';
import { AnalyticsService } from '../services/analytics.service';
import { OrganizationsService } from '../services/organizations.service';
import { PlatformsService } from '../services/platforms.service';
import { CyberViolenceService } from '../services/cyberviolence.service';
import type { Organization, Platform, CyberViolence, SignalementStatus, Priority, Titulaire, AccompanimentType } from '../types';
import { TableSkeleton } from '../components/common/LoadingState';
import { useTheme } from '../context/ThemeContext';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  IN_PROGRESS: 'En cours',
  VALIDATED: 'Validé',
  REJECTED: 'Rejeté',
  CLOSED: 'Clôturé',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#F59E0B',
  IN_PROGRESS: '#3B82F6',
  VALIDATED: '#10B981',
  REJECTED: '#EF4444',
  CLOSED: '#8B5CF6',
};

const PRIORITY_LABELS: Record<string, string> = {
  NORMAL: 'Normale',
  HIGH: 'Élevée',
  URGENT: 'Urgente',
};

const PRIORITY_COLORS: Record<string, string> = {
  NORMAL: '#3B82F6',
  HIGH: '#F59E0B',
  URGENT: '#EF4444',
};

import { useAuth } from '../context/AuthContext';

export const AnalysePage: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const { user } = useAuth();
  const isOrgUser = user?.role?.name === 'ORGANIZATION_USER';
  const orgName = user?.organization?.name || user?.organization?.nickname;

  const [data, setData] = useState<AnalyticsResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lists for dropdown filters
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [cyberList, setCyberList] = useState<CyberViolence[]>([]);

  // Filter State
  const [period, setPeriod] = useState<AnalyticsQueryFilter['period']>('30days');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [selectedCyber, setSelectedCyber] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [selectedTitulaire, setSelectedTitulaire] = useState<string>('');
  const [selectedAccompaniment, setSelectedAccompaniment] = useState<string>('');

  // Load dropdown lists
  useEffect(() => {
    Promise.all([
      OrganizationsService.getOrganizations(),
      PlatformsService.getPlatforms(),
      CyberViolenceService.getCyberViolence(),
    ])
      .then(([oData, pData, cData]) => {
        setOrgs(Array.isArray(oData) ? oData : []);
        setPlatforms(Array.isArray(pData) ? pData : []);
        setCyberList(Array.isArray(cData) ? cData : []);
      })
      .catch((err) => console.error('Failed to load filter metadata', err));
  }, []);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    const filter: AnalyticsQueryFilter = {
      period,
      dateFrom: period === 'custom' && dateFrom ? dateFrom : undefined,
      dateTo: period === 'custom' && dateTo ? dateTo : undefined,
      status: selectedStatus ? (selectedStatus as SignalementStatus) : undefined,
      priority: selectedPriority ? (selectedPriority as Priority) : undefined,
      cyberViolenceId: selectedCyber ? Number(selectedCyber) : undefined,
      platformId: selectedPlatform ? Number(selectedPlatform) : undefined,
      organizationId: selectedOrg ? Number(selectedOrg) : undefined,
      titulaire: selectedTitulaire ? (selectedTitulaire as Titulaire) : undefined,
      accompanimentType: selectedAccompaniment ? (selectedAccompaniment as AccompanimentType) : undefined,
    };

    try {
      const res = await AnalyticsService.getAnalytics(filter);
      setData(res);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
      setError('Impossible de charger les statistiques d’analyse. Vérifiez que le serveur est démarré.');
    } finally {
      setLoading(false);
    }
  }, [
    period,
    dateFrom,
    dateTo,
    selectedStatus,
    selectedPriority,
    selectedCyber,
    selectedPlatform,
    selectedOrg,
    selectedTitulaire,
    selectedAccompaniment,
  ]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleResetFilters = () => {
    setPeriod('30days');
    setDateFrom('');
    setDateTo('');
    setSelectedStatus('');
    setSelectedPriority('');
    setSelectedCyber('');
    setSelectedPlatform('');
    setSelectedOrg('');
    setSelectedTitulaire('');
    setSelectedAccompaniment('');
  };

  const hasActiveFilters =
    period !== '30days' ||
    Boolean(dateFrom) ||
    Boolean(dateTo) ||
    Boolean(selectedStatus) ||
    Boolean(selectedPriority) ||
    Boolean(selectedCyber) ||
    Boolean(selectedPlatform) ||
    Boolean(selectedOrg) ||
    Boolean(selectedTitulaire) ||
    Boolean(selectedAccompaniment);

  // Theme chart styling tokens
  const gridColor = isDark ? 'var(--chart-grid)' : '#E2E8F0';
  const tickColor = isDark ? 'var(--chart-tick)' : '#94A3B8';
  const tooltipBg = isDark ? 'var(--chart-tooltip-bg)' : '#FFFFFF';
  const tooltipBorder = isDark ? 'var(--chart-tooltip-border)' : '#E2E8F0';
  const tooltipText = isDark ? 'var(--chart-tooltip-text)' : '#0F172A';

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-emc-primary">
            Analyse {isOrgUser && orgName ? `— ${orgName}` : ''}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-emc-secondary">
            {isOrgUser
              ? `Statistiques et analyse d'activité de l'organisation ${orgName || ''}`
              : "Vue globale et détaillée des signalements et de leur traitement"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-emc-elevated text-slate-700 dark:text-emc-primary hover:bg-slate-200 transition"
            >
              <X className="w-3.5 h-3.5" />
              <span>Réinitialiser</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter le rapport</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={loadAnalytics} className="ml-auto underline font-semibold">Réessayer</button>
        </div>
      )}

      {/* Global Filter Bar */}
      <div className="emc-card p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-emc-primary pb-2 border-b border-slate-100 dark:border-emc-border">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          <span>Filtres analytiques</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3 text-xs">
          {/* Période Preset */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">PÉRIODE</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border text-slate-900 dark:text-emc-primary outline-none"
            >
              <option value="today">Aujourd'hui</option>
              <option value="7days">7 derniers jours</option>
              <option value="30days">30 derniers jours</option>
              <option value="3months">3 derniers mois</option>
              <option value="year">Cette année</option>
              <option value="custom">Personnalisée</option>
            </select>
          </div>

          {/* Statut */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">STATUT</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border text-slate-900 dark:text-emc-primary outline-none"
            >
              <option value="">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="VALIDATED">Validé</option>
              <option value="REJECTED">Rejeté</option>
              <option value="CLOSED">Clôturé</option>
            </select>
          </div>

          {/* Priorité */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">PRIORITÉ</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border text-slate-900 dark:text-emc-primary outline-none"
            >
              <option value="">Toutes les priorités</option>
              <option value="NORMAL">Normale</option>
              <option value="HIGH">Élevée</option>
              <option value="URGENT">Urgente</option>
            </select>
          </div>

          {/* Cyberviolence */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">CYBERVIOLENCE</label>
            <select
              value={selectedCyber}
              onChange={(e) => setSelectedCyber(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border text-slate-900 dark:text-emc-primary outline-none truncate"
            >
              <option value="">Tous les types</option>
              {cyberList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Plateforme */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">PLATEFORME</label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border text-slate-900 dark:text-emc-primary outline-none"
            >
              <option value="">Toutes les plateformes</option>
              {platforms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Organisation */}
          {!isOrgUser && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">ORGANISATION</label>
              <select
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border text-slate-900 dark:text-emc-primary outline-none"
              >
                <option value="">Toutes les organisations</option>
                {orgs.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.nickname}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Titulaire */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">TITULAIRE</label>
            <select
              value={selectedTitulaire}
              onChange={(e) => setSelectedTitulaire(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border text-slate-900 dark:text-emc-primary outline-none"
            >
              <option value="">Tous les titulaires</option>
              <option value="MOI_MEME">Moi-même (Oui)</option>
              <option value="AUTRE_PERSONNE">Autre personne (Non)</option>
            </select>
          </div>

          {/* Type d'accompagnement */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">ACCOMPAGNEMENT</label>
            <select
              value={selectedAccompaniment}
              onChange={(e) => setSelectedAccompaniment(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border text-slate-900 dark:text-emc-primary outline-none"
            >
              <option value="">Tous les types</option>
              <option value="JUR">Juridique (JUR)</option>
              <option value="PSY">Psychique (PSY)</option>
              <option value="SUP">Support Technique (SUP)</option>
            </select>
          </div>
        </div>

        {/* Custom date range if custom period is chosen */}
        {period === 'custom' && (
          <div className="flex items-center gap-3 pt-2 text-xs text-slate-500 dark:text-emc-secondary border-t border-slate-100 dark:border-emc-border">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Du:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border text-slate-900 dark:text-emc-primary outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span>Au:</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border text-slate-900 dark:text-emc-primary outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {loading || !data ? (
        <TableSkeleton rows={8} />
      ) : (
        <>
          {/* Row 1: KPI Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Total signalements', metric: data.kpis.total, icon: FileText, color: 'text-blue-600 bg-blue-500/10' },
              { label: 'Signalements en attente', metric: data.kpis.pending, icon: Clock, color: 'text-amber-600 bg-amber-500/10' },
              { label: 'Signalements en cours', metric: data.kpis.inProgress, icon: Clock3, color: 'text-violet-600 bg-violet-500/10' },
              { label: 'Signalements validés', metric: data.kpis.validated, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-500/10' },
              { label: 'Signalements rejetés', metric: data.kpis.rejected, icon: XCircle, color: 'text-red-600 bg-red-500/10' },
              { label: 'Signalements clôturés', metric: data.kpis.closed, icon: CheckSquare, color: 'text-purple-600 bg-purple-500/10' },
            ].map((card, idx) => {
              const Icon = card.icon;
              const isPositive = card.metric.diff >= 0;

              return (
                <div key={idx} className="emc-card p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-emc-secondary truncate">
                      {card.label}
                    </span>
                    <div className={`p-2 rounded-xl ${card.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="text-2xl font-extrabold text-slate-900 dark:text-emc-primary">
                    {card.metric.count.toLocaleString('fr-FR')}
                  </div>

                  <div className="flex items-center gap-1 text-[10px] font-semibold">
                    {isPositive ? (
                      <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 gap-0.5">
                        <TrendingUp className="w-3 h-3" /> +{card.metric.diff}%
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-red-600 dark:text-red-400 gap-0.5">
                        <TrendingDown className="w-3 h-3" /> {card.metric.diff}%
                      </span>
                    )}
                    <span className="text-slate-400">vs période préc.</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Row 2: Signalements Evolution Line Chart */}
          <div className="emc-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-emc-primary">
                  Évolution des signalements
                </h3>
                <p className="text-xs text-slate-500">
                  Nombre quotidien de nouveaux signalements et leur statut
                </p>
              </div>
            </div>

            <div className="h-72 w-full">
              {data.timeSeries.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Aucune donnée disponible pour cette période.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.timeSeries} margin={{ top: 10, right: 16, left: -8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotalAnal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorValidatedAnal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: tickColor }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: tickColor }} width={32} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: tooltipBg,
                        borderColor: tooltipBorder,
                        borderRadius: '10px',
                        fontSize: '12px',
                        color: tooltipText,
                        padding: '10px 14px',
                      }}
                    />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
                    <Area type="monotone" dataKey="total" name="Total Signalements" stroke="#3B82F6" strokeWidth={2} fill="url(#colorTotalAnal)" />
                    <Area type="monotone" dataKey="validated" name="Signalements Validés" stroke="#10B981" strokeWidth={2} fill="url(#colorValidatedAnal)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Row 4: Workflow Pipeline Section */}
          <div className="emc-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-emc-primary">
              Processus de traitement (Workflow Pipeline)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[
                { stage: '1. Reçus', count: data.kpis.total.count, color: 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30' },
                { stage: '2. En attente', count: data.kpis.pending.count, color: 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30' },
                { stage: '3. En cours', count: data.kpis.inProgress.count, color: 'border-violet-500 bg-violet-50/50 dark:bg-violet-950/30' },
                { stage: '4. Validés / Rejetés', count: data.kpis.validated.count + data.kpis.rejected.count, color: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30' },
                { stage: '5. Clôturés', count: data.kpis.closed.count, color: 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30' },
              ].map((step, idx) => (
                <div key={idx} className={`p-4 rounded-xl border-l-4 ${step.color} space-y-1`}>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-emc-secondary">{step.stage}</p>
                  <h4 className="text-xl font-extrabold text-slate-900 dark:text-emc-primary">
                    {step.count.toLocaleString('fr-FR')}
                  </h4>
                </div>
              ))}
            </div>
          </div>

          {/* Row 5: Status Distribution & Priority Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Chart */}
            <div className="emc-card p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-emc-primary">
                Signalements par statut
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.statusDistribution} margin={{ top: 10, right: 16, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    <XAxis dataKey="status" tickFormatter={(s) => STATUS_LABELS[s] || s} tick={{ fontSize: 11, fill: tickColor }} />
                    <YAxis tick={{ fontSize: 11, fill: tickColor }} width={32} />
                    <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText, borderRadius: '8px' }} />
                    <Bar dataKey="count" name="Nombre" radius={[6, 6, 0, 0]}>
                      {data.statusDistribution.map((entry, index) => (
                        <Cell key={index} fill={STATUS_COLORS[entry.status] || '#3B82F6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Priority Chart */}
            <div className="emc-card p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-emc-primary">
                Signalements par priorité
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.priorityDistribution} margin={{ top: 10, right: 16, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    <XAxis dataKey="priority" tickFormatter={(p) => PRIORITY_LABELS[p] || p} tick={{ fontSize: 11, fill: tickColor }} />
                    <YAxis tick={{ fontSize: 11, fill: tickColor }} width={32} />
                    <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText, borderRadius: '8px' }} />
                    <Bar dataKey="count" name="Nombre" radius={[6, 6, 0, 0]}>
                      {data.priorityDistribution.map((entry, index) => (
                        <Cell key={index} fill={PRIORITY_COLORS[entry.priority] || '#3B82F6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Row 6: Cyberviolence Analysis & Platform Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cyberviolence Types Horizontal BarChart */}
            <div className="emc-card p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-emc-primary">
                Types de cyberviolence
              </h3>
              <div className="h-72 w-full">
                {data.cyberViolenceDistribution.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    Aucune donnée disponible.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={data.cyberViolenceDistribution}
                      margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: tickColor }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: tickColor }} width={100} />
                      <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText, borderRadius: '8px' }} />
                      <Bar dataKey="count" name="Nombre" fill="#8B5CF6" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Platform Analysis List with Database Platform Icons */}
            <div className="emc-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-emc-primary">
                  Signalements par plateforme
                </h3>
                <span className="text-[11px] text-slate-400 font-semibold">{data.platforms.length} plateformes enregistrées</span>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {data.platforms.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-emc-elevated/60 border border-slate-200/60 dark:border-emc-border">
                    <div className="flex items-center gap-3">
                      {p.icon ? (
                        <img src={p.icon} alt={p.name} className="w-7 h-7 rounded-lg object-cover" />
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                          <Globe className="w-4 h-4" />
                        </div>
                      )}
                      <span className="text-xs font-bold text-slate-900 dark:text-emc-primary">{p.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-200 dark:bg-emc-sidebar rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full"
                          style={{
                            width: `${Math.min(100, (p.count / (data.kpis.total.count || 1)) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-emc-primary w-8 text-right">
                        {p.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 7: Organization & Accompaniment Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Organization Analysis */}
            <div className="emc-card p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-emc-primary">
                Signalements par organisation
              </h3>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {data.organizations.map((org) => (
                  <div key={org.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-emc-elevated/60 border border-slate-200/60 dark:border-emc-border">
                    <div className="flex items-center gap-3">
                      {org.image ? (
                        <img src={org.image} alt={org.nickname} className="w-8 h-8 rounded-lg object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-xs">
                          {org.nickname.slice(0, 3)}
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-emc-primary block">{org.nickname}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{org.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                        {org.count} cas assignés
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Accompaniment Analysis */}
            <div className="emc-card p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-emc-primary">
                Accompagnement (JUR, PSY & SUP)
              </h3>
              <div className="space-y-4">
                {data.accompaniment.map((acc, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-emc-elevated/60 border border-slate-200/60 dark:border-emc-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-emc-primary">{acc.label}</span>
                      <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">{acc.count}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-emc-sidebar rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, (acc.count / (data.kpis.total.count || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 8: Titulaire & Treatment Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Titulaire Analysis */}
            <div className="emc-card p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-emc-primary">
                Signalements concernant le titulaire
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {data.titulaire.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-emc-elevated/60 border border-slate-200/60 dark:border-emc-border text-center space-y-1">
                    <p className="text-[11px] font-bold text-slate-500">{item.label}</p>
                    <h4 className="text-2xl font-extrabold text-slate-900 dark:text-emc-primary">{item.count}</h4>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{item.percentage}% du total</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Treatment Status */}
            <div className="emc-card p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-emc-primary">
                État du traitement des affectations
              </h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.treatmentStatus} margin={{ top: 5, right: 15, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    <XAxis dataKey="status" tick={{ fontSize: 11, fill: tickColor }} />
                    <YAxis tick={{ fontSize: 11, fill: tickColor }} width={32} />
                    <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText, borderRadius: '8px' }} />
                    <Bar dataKey="count" name="Affectations" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Row 9: Recent Activity Table */}
          <div className="emc-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-emc-primary">
                Activité récente
              </h3>
              <Link to="/signalements" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                Voir tous les signalements →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-emc-elevated/40 border-b border-slate-200 dark:border-emc-border text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Référence</th>
                    <th className="py-3 px-4">Émetteur</th>
                    <th className="py-3 px-4">Titulaire</th>
                    <th className="py-3 px-4">Cyberviolence</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-emc-border">
                  {data.recentActivity.map((sig) => (
                    <tr key={sig.id} className="hover:bg-slate-50/80 dark:hover:bg-emc-elevated/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <Link to={`/signalements/${sig.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                          {(sig as any).reference || `SIG-${sig.id}`}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 dark:text-emc-primary font-medium">{sig.issuer}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-emc-secondary">
                        {sig.titulaire === 'MOI_MEME' ? 'Moi-même' : 'Autre personne'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-emc-primary">
                        {sig.cyberViolence?.name || (sig as any).otherCyberViolence || 'Autre'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          {STATUS_LABELS[sig.status] || sig.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {new Date(sig.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
