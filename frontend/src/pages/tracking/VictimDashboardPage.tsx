import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  LogOut,
  Clock,
  CheckCircle2,
  FileText,
  ChevronRight,
  ChevronLeft,
  Globe,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { trackingService, type VictimSignalement } from '../../services/tracking.service';
import { useVictimAuth } from '../../context/VictimAuthContext';
import logo from '../../assets/logo-lightmode.png';

export const VictimDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { referenceNumber, logout, isAuthenticated } = useVictimAuth();
  const isArabic = i18n.language?.startsWith('ar');

  const [signalements, setSignalements] = useState<VictimSignalement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/suivi');
      return;
    }

    const fetchSignalements = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await trackingService.getVictimSignalements();
        setSignalements(data);
      } catch {
        setError('Impossible de charger vos signalements. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchSignalements();
  }, [isAuthenticated, navigate]);

  const changeLanguage = (lang: 'fr' | 'ar') => {
    i18n.changeLanguage(lang);
  };

  const handleLogout = () => {
    trackingService.logout();
    logout();
    navigate('/suivi');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          label: t('tracking.status.PENDING'),
          cls: 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/50',
        };
      case 'IN_PROGRESS':
        return {
          label: t('tracking.status.IN_PROGRESS'),
          cls: 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900/50',
        };
      case 'AFFECTATION':
        return {
          label: t('tracking.status.AFFECTATION'),
          cls: 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/50',
        };
      case 'ANALYSE':
        return {
          label: t('tracking.status.ANALYSE'),
          cls: 'bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-900/50',
        };
      case 'PROCESSING_COMPLETE':
        return {
          label: t('tracking.status.PROCESSING_COMPLETE'),
          cls: 'bg-teal-100 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-900/50',
        };
      case 'CLOSED':
        return {
          label: t('tracking.status.CLOSED'),
          cls: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50',
        };
      default:
        return {
          label: status,
          cls: 'bg-slate-100 text-slate-800 border-slate-200',
        };
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString(isArabic ? 'ar-MA' : 'fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-50 dark:bg-emc-surface text-slate-900 dark:text-emc-primary flex flex-col justify-between"
    >
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-emc-border bg-white dark:bg-emc-surface/90 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src={logo} alt="EMC Helpline" className="h-12 w-auto object-contain" />
          </a>

          <div className="flex items-center gap-3">
            {/* Account Ref Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/40 text-xs font-mono font-bold text-blue-700 dark:text-blue-300">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{referenceNumber}</span>
            </div>

            {/* Language switch */}
            <div dir="ltr" className="relative flex h-9 overflow-hidden rounded-full border border-slate-200 bg-slate-100 p-0.5 shadow-xs">
              <button
                type="button"
                onClick={() => changeLanguage('fr')}
                className={`relative z-10 h-8 w-12 text-xs font-semibold uppercase transition-colors rounded-full ${
                  !isArabic ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => changeLanguage('ar')}
                className={`relative z-10 h-8 w-12 text-xs font-semibold uppercase transition-colors rounded-full ${
                  isArabic ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                AR
              </button>
            </div>

            {/* Logout button */}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t('tracking.dashboard.logoutBtn')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Banner & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-emc-surface border border-slate-200 dark:border-emc-border rounded-3xl p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-emc-primary">
              {t('tracking.dashboard.title')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-emc-secondary mt-1">
              {t('tracking.dashboard.subtitle')} — <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{referenceNumber}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/suivi/nouveau')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all cursor-pointer flex-shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t('tracking.dashboard.newSignalementBtn')}</span>
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs text-slate-500 dark:text-emc-secondary">Chargement de vos signalements...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs font-semibold text-rose-700 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && signalements.length === 0 && (
          <div className="bg-white dark:bg-emc-surface border border-slate-200 dark:border-emc-border rounded-3xl p-12 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-emc-elevated text-slate-400">
              <FolderOpen className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-emc-primary">
                {t('tracking.dashboard.emptyTitle')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-emc-secondary mt-1">
                {t('tracking.dashboard.emptyDesc')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/suivi/nouveau')}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t('tracking.dashboard.newSignalementBtn')}</span>
            </button>
          </div>
        )}

        {/* Signalements Grid / List */}
        {!loading && !error && signalements.length > 0 && (
          <div className="space-y-4">
            {signalements.map((s) => {
              const statusBadge = getStatusBadge(s.status);
              const platformsList = s.reportedItems?.map((r) => r.platform?.name).filter(Boolean) || [];

              return (
                <div
                  key={s.id}
                  className="bg-white dark:bg-emc-surface border border-slate-200 dark:border-emc-border rounded-2xl p-5 shadow-xs hover:border-blue-300 dark:hover:border-blue-800 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-sm font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-900/40">
                        #SIG-{s.id}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.cls}`}>
                        {statusBadge.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-emc-secondary">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {t('tracking.dashboard.createdOn', { date: formatDate(s.createdAt) })}
                      </span>

                      {s.cyberViolence && (
                        <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-emc-primary">
                          <FileText className="w-3.5 h-3.5 text-blue-500" />
                          {s.cyberViolence.name}
                        </span>
                      )}

                      {platformsList.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          {platformsList.join(', ')}
                        </span>
                      )}
                    </div>

                    {s.description && (
                      <p className="text-xs text-slate-600 dark:text-emc-secondary line-clamp-2 pt-1 leading-relaxed">
                        {s.description}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/suivi/signalement/${s.id}`)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-emc-border-strong bg-slate-50 dark:bg-emc-elevated/50 text-xs font-semibold text-slate-700 dark:text-emc-primary hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 hover:border-blue-200 transition-colors flex-shrink-0 cursor-pointer"
                  >
                    <span>{t('tracking.dashboard.viewDetailBtn')}</span>
                    {isArabic ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 dark:border-emc-border text-center text-xs text-slate-500 dark:text-emc-secondary">
        <p>© {new Date().getFullYear()} EMC HELPLINE. {t('footer.rights')}</p>
      </footer>
    </div>
  );
};
