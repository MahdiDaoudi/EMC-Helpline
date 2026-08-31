import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Globe,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  XCircle,
  Building,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';
import { trackingService, type VictimSignalement } from '../../services/tracking.service';
import { useVictimAuth } from '../../context/VictimAuthContext';
import logo from '../../assets/logo-lightmode.png';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
interface Step {
  id: number;
  name: string;
  isDone: boolean;
  isCurrent: boolean;
  isRejected: boolean;
}

// ──────────────────────────────────────────────
// Helper: derive stepper config from signalement
// ──────────────────────────────────────────────
function buildSteps(signalement: VictimSignalement, t: (key: string) => string): Step[] {
  const status = signalement.status;

  const hasAnalysis = !!signalement.dateAnalyse || status === 'IN_PROGRESS';
  const hasAssignment = (signalement.assignedTo?.length ?? 0) > 0;
  const validated = signalement.validate?.some((v) => v.status === 'VALIDATED' || v.status === 'APPROVED') ?? false;
  const rejected = signalement.validate?.some((v) => v.status === 'REJECTED') ?? status === 'REJECTED';
  const isClosed = status === 'CLOSED';

  // Step 1: Réception
  const step1Done = true; // always done once exists
  // Step 2: Traitement en cours
  const step2Done = hasAnalysis || hasAssignment || validated || rejected || isClosed;
  // Step 3: Affectation
  const step3Done = hasAssignment || validated || rejected || isClosed;
  // Step 4: Analyse & Décision
  const step4Done = validated || rejected || isClosed;
  // Step 5: Clôture
  const step5Done = isClosed;

  const currentIdx =
    isClosed ? 4
    : (validated || rejected) ? 3
    : hasAssignment ? 2
    : hasAnalysis ? 1
    : 0;

  const steps: Step[] = [
    {
      id: 1,
      name: t('tracking.status.PENDING'),
      isDone: step1Done && currentIdx > 0,
      isCurrent: currentIdx === 0,
      isRejected: false,
    },
    {
      id: 2,
      name: t('tracking.status.IN_PROGRESS'),
      isDone: step2Done && currentIdx > 1,
      isCurrent: currentIdx === 1,
      isRejected: false,
    },
    {
      id: 3,
      name: t('tracking.status.AFFECTATION'),
      isDone: step3Done && currentIdx > 2,
      isCurrent: currentIdx === 2,
      isRejected: false,
    },
    {
      id: 4,
      name: t('tracking.status.ANALYSE'),
      isDone: step4Done && currentIdx > 3,
      isCurrent: currentIdx === 3 && !rejected,
      isRejected: currentIdx === 3 && rejected,
    },
    {
      id: 5,
      name: t('tracking.status.CLOSED'),
      isDone: step5Done,
      isCurrent: currentIdx === 4 && isClosed,
      isRejected: false,
    },
  ];

  return steps;
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────
export const VictimSignalementDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { referenceNumber, isAuthenticated } = useVictimAuth();
  const isArabic = i18n.language?.startsWith('ar');

  const [signalement, setSignalement] = useState<VictimSignalement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/suivi');
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!id) return;
        const data = await trackingService.getVictimSignalementById(id);
        setSignalement(data);
      } catch {
        setError('Impossible de charger les détails du signalement.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, isAuthenticated, navigate]);

  const changeLanguage = (lang: 'fr' | 'ar') => {
    i18n.changeLanguage(lang);
  };

  const formatDate = (dateStr?: string | null) => {
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

  // Derived state from signalement
  const stepsConfig = useMemo<Step[]>(
    () => (signalement ? buildSteps(signalement, t) : []),
    [signalement, t],
  );

  const isRejected = useMemo(
    () =>
      signalement?.validate?.some((v) => v.status === 'REJECTED') ||
      signalement?.status === 'REJECTED' ||
      false,
    [signalement],
  );

  const isValidated = useMemo(
    () =>
      signalement?.validate?.some((v) => v.status === 'VALIDATED' || v.status === 'APPROVED') ||
      signalement?.status === 'VALIDATED' ||
      false,
    [signalement],
  );

  const rejectionReason = useMemo(
    () =>
      signalement?.validate?.find((v) => v.status === 'REJECTED')?.reason ?? null,
    [signalement],
  );

  const hasAssignments = useMemo(
    () => (signalement?.assignedTo?.length ?? 0) > 0,
    [signalement],
  );

  const assignedOrgs = useMemo(
    () => signalement?.assignedTo ?? [],
    [signalement],
  );

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

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/40 text-xs font-mono font-bold text-blue-700 dark:text-blue-300">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{referenceNumber}</span>
            </div>

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
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Back Link */}
        <div>
          <button
            type="button"
            onClick={() => navigate('/suivi/tableau-de-bord')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
          >
            {isArabic ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{t('tracking.detail.backToDashboard')}</span>
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs text-slate-500 dark:text-emc-secondary">Chargement des détails...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs font-semibold text-rose-700 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Detail Content */}
        {!loading && !error && signalement && (
          <div className="space-y-6">
            {/* Summary Banner Card */}
            <div className="bg-white dark:bg-emc-surface border border-slate-200 dark:border-emc-border rounded-3xl p-6 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-lg font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-3 py-1 rounded-xl border border-blue-100 dark:border-blue-900/40">
                  #{signalement.reference || `SIG-${signalement.id}`}
                </span>

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-emc-secondary">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{t('tracking.dashboard.createdOn', { date: formatDate(signalement.createdAt) })}</span>
                </div>
              </div>

              {signalement.cyberViolence && (
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-emc-primary">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>{signalement.cyberViolence.name}</span>
                </div>
              )}

              {signalement.description && (
                <p className="text-xs text-slate-600 dark:text-emc-secondary leading-relaxed pt-1">
                  {signalement.description}
                </p>
              )}
            </div>

            {/* Progression Timeline Card */}
            <div className="bg-white dark:bg-emc-surface border border-slate-200 dark:border-emc-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-emc-primary uppercase tracking-wide">
                {t('tracking.detail.timelineTitle')}
              </h2>

              {/* Stepper Timeline (5 steps) */}
              <div className="relative pt-2 pb-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {stepsConfig.map((step) => (
                    <div
                      key={step.id}
                      className={`flex flex-col items-center text-center p-4 rounded-2xl border transition-all ${
                        step.isRejected
                          ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 shadow-sm'
                          : step.isCurrent
                          ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 shadow-sm'
                          : step.isDone
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                          : 'bg-slate-50 dark:bg-emc-elevated/30 border-slate-200 dark:border-emc-border-strong opacity-50'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                          step.isRejected
                            ? 'bg-rose-600 text-white ring-4 ring-rose-100 dark:ring-rose-900/60 scale-110 shadow-md shadow-rose-500/20'
                            : step.isCurrent
                            ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/60 scale-110 shadow-md shadow-blue-500/20'
                            : step.isDone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 dark:bg-emc-elevated text-slate-500'
                        }`}
                      >
                        {step.isRejected ? (
                          <XCircle className="w-5 h-5" />
                        ) : step.isDone ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          step.id
                        )}
                      </div>

                      <p
                        className={`text-xs font-bold leading-snug ${
                          step.isRejected
                            ? 'text-rose-700 dark:text-rose-300'
                            : step.isCurrent
                            ? 'text-blue-700 dark:text-blue-300'
                            : step.isDone
                            ? 'text-emerald-800 dark:text-emerald-300'
                            : 'text-slate-500 dark:text-emc-secondary'
                        }`}
                      >
                        {step.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rejection callout */}
              {isRejected && (
                <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                      Signalement non retenu
                    </h3>
                    <p className="text-xs text-rose-700 dark:text-rose-300/90 leading-relaxed">
                      {rejectionReason || "Après examen par notre équipe, ce signalement n'a pas pu être retenu."}
                    </p>
                  </div>
                </div>
              )}

              {/* Validation callout */}
              {isValidated && !isRejected && (
                <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                      Signalement validé
                    </h3>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300/90 leading-relaxed">
                      Votre signalement a été validé par l&apos;équipe EMC HELPLINE. Les mesures nécessaires et la prise en charge sont en cours.
                    </p>
                  </div>
                </div>
              )}

              {/* Affectation callout */}
              {hasAssignments && (
                <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 space-y-3">
                  <div className="flex items-center gap-2.5 text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wide">
                    <Building className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Prise en charge par des organisations partenaires</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {assignedOrgs.map((asg, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white dark:bg-emc-elevated border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-slate-800 dark:text-emc-primary">
                            {asg.organization?.nickname || asg.organization?.name || 'Organisation partenaire'}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-emc-secondary">
                            Accompagnement :{' '}
                            <span className="font-semibold">
                              {asg.type === 'PSY' ? 'Psychologique' : asg.type === 'JUR' ? 'Juridique' : 'Support'}
                            </span>
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                          {asg.status === 'COMPLETED' ? 'Traité' : asg.status === 'IN_PROGRESS' ? 'En cours' : 'Affecté'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reported Items Card */}
            <div className="bg-white dark:bg-emc-surface border border-slate-200 dark:border-emc-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-slate-900 dark:text-emc-primary uppercase tracking-wide flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                <span>{t('tracking.detail.reportedContentTitle')}</span>
              </h2>

              {(!signalement.reportedItems || signalement.reportedItems.length === 0) ? (
                <p className="text-xs text-slate-500 dark:text-emc-secondary">
                  {t('tracking.detail.noContent')}
                </p>
              ) : (
                <div className="space-y-4">
                  {signalement.reportedItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-emc-border-strong bg-slate-50/60 dark:bg-emc-elevated/30 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-emc-primary uppercase tracking-wide">
                          {item.platform?.name || 'Plateforme'}{item.type ? ` — ${item.type}` : ''}
                        </span>

                        {item.contentUrl && (
                          <a
                            href={item.contentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                          >
                            <span>Lien</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      {item.screenshots && item.screenshots.length > 0 && (
                        <div className="pt-2">
                          <p className="text-[11px] font-bold text-slate-500 dark:text-emc-secondary mb-2 uppercase tracking-wider flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Captures d&apos;écran</span>
                          </p>

                          <div className="flex flex-wrap gap-3">
                            {item.screenshots.map((s) => (
                              <a
                                key={s.id}
                                href={s.imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative block w-24 h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-emc-border-strong shadow-xs bg-slate-100"
                              >
                                <img
                                  src={s.imageUrl}
                                  alt="Capture d'écran"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
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
