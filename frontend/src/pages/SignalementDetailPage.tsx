import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Check,
  Copy,
  Download,
  FileText,
  Link2,
  Printer,
  ShieldAlert,
  User,
  X,
  BadgeCheck,
  Clock3,
  FileSearch,
  UserRoundCheck,
} from 'lucide-react';
import { SignalementsService } from '../services/signalements.service';
import { OrganizationsService } from '../services/organizations.service';
import { AssignmentsService } from '../services/assignments.service';
import { PlatformReportsService } from '../services/platformReports.service';
import type { Organization, Platform, Signalement } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import logoLightmode from '../assets/logo-lightmode.png';
import logoDarkmode from '../assets/logo-darkmode.png';
import { useTheme } from '../context/ThemeContext';

const formatDate = (value?: string | null) => {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const displayValue = (value?: string | null) => value?.trim() || '—';

const getContentTypeLabel = (type?: string | null) => {
  const labels: Record<string, string> = {
    VIDEO: 'Vidéo',
    IMAGE: 'Image',
    PROFILE: 'Profil',
    POST: 'Publication',
    COMMENT: 'Commentaire',
    PAGE: 'Page',
  };

  return labels[type ?? ''] ?? type ?? '—';
};

const copyToClipboard = async (value: string) => {
  if (!value) return false;

  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  }
};

export const SignalementDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { resolvedTheme } = useTheme();
  const [signalement, setSignalement] = useState<Signalement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<number | null>(null);
  const [assignmentBusy, setAssignmentBusy] = useState(false);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportForm, setReportForm] = useState({ platformId: '', emailTo: '', emailSubject: '', emailBody: '', selectedScreenshotUrls: [] as string[] });
  const [selectedReportLinks, setSelectedReportLinks] = useState<string[]>([]);
  const [selectedReportScreenshotIds, setSelectedReportScreenshotIds] = useState<number[]>([]);
  const [reportBusy, setReportBusy] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const fetchSignalement = useCallback(async () => {
    if (!id) {
      setSignalement(null);
      setError('Impossible de charger le signalement');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await SignalementsService.getSignalementById(Number(id));
      setSignalement(result);
    } catch {
      setError('Impossible de charger le signalement');
      setSignalement(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchSignalement();
  }, [fetchSignalement]);

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const data = await OrganizationsService.getOrganizations();
        setOrganizations(Array.isArray(data) ? data : []);
      } catch {
        setOrganizations([]);
      }
    };

    void loadOrganizations();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const categoryLabels: Record<string, string> = {
    JURIDIQUE: 'Juridique',
    PSYCHIQUE: 'Psychique',
  };

  const categoryBadgeStyles: Record<string, string> = {
    JURIDIQUE: 'inline-flex rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    PSYCHIQUE: 'inline-flex rounded-full bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  };

  const accompanimentBadgeStyles: Record<string, string> = {
    JUR: 'inline-flex rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    PSY: 'inline-flex rounded-full bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
    SUP: 'inline-flex rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  };

  const reference = useMemo(
    () => signalement?.victim?.referenceNumber || signalement?.reference || 'EMC—INCONNU',
    [signalement],
  );

  const allScreenshots = useMemo(
    () => (signalement?.reportedItems ?? []).flatMap((item) => (item.screenshots ?? []).map((screenshot, index) => ({
      ...screenshot,
      itemId: item.id,
      itemLabel: `${item.platform?.name ?? 'Plateforme'} · ${getContentTypeLabel(item.type)}`,
      index,
    }))),
    [signalement],
  );

  const reportPlatforms = useMemo(() => {
    if (!signalement?.reportedItems?.length) return [] as Platform[];

    const byId = new Map<number, Platform>();
    signalement.reportedItems.forEach((item) => {
      if (item.platform) {
        byId.set(item.platform.id, item.platform);
      }
    });

    return Array.from(byId.values());
  }, [signalement]);

  const selectedReportPlatform = useMemo(
    () => reportPlatforms.find((platform) => String(platform.id) === reportForm.platformId) ?? null,
    [reportForm.platformId, reportPlatforms],
  );

  const reportableLinks = useMemo(() => {
    if (!signalement?.reportedItems?.length || !reportForm.platformId) return [] as string[];

    const selectedPlatformId = Number(reportForm.platformId);
    const urls = signalement.reportedItems
      .filter((item) => item.platformId === selectedPlatformId)
      .map((item) => item.contentUrl)
      .filter((url): url is string => Boolean(url && url.trim().length > 0));

    return Array.from(new Set(urls));
  }, [reportForm.platformId, signalement]);

  const reportableScreenshots = useMemo(() => {
    if (!signalement?.reportedItems?.length || !reportForm.platformId) return [] as typeof allScreenshots;

    const selectedPlatformId = Number(reportForm.platformId);

    return signalement.reportedItems
      .filter((item) => item.platformId === selectedPlatformId)
      .flatMap((item) => (item.screenshots ?? []).map((screenshot, index) => ({
        ...screenshot,
        itemId: item.id,
        itemLabel: `${item.platform?.name ?? 'Plateforme'} · ${getContentTypeLabel(item.type)}`,
        index,
      })));
  }, [reportForm.platformId, signalement]);

  const selectedReportScreenshotUrls = useMemo(
    () => reportableScreenshots
      .filter((screenshot) => selectedReportScreenshotIds.includes(screenshot.id))
      .map((screenshot) => screenshot.imageUrl),
    [reportableScreenshots, selectedReportScreenshotIds],
  );

  useEffect(() => {
    if (!reportForm.platformId || !signalement) {
      setSelectedReportLinks([]);
      setSelectedReportScreenshotIds([]);
      return;
    }

    const selectedPlatformId = Number(reportForm.platformId);
    const nextPlatform = reportPlatforms.find((platform) => platform.id === selectedPlatformId) ?? null;
    const nextLinks = reportableLinks;

    const nextScreenshots = signalement.reportedItems
      ?.filter((item) => item.platformId === selectedPlatformId)
      .flatMap((item) => (item.screenshots ?? []).map((screenshot) => screenshot.id)) ?? [];

    setSelectedReportLinks(Array.from(new Set(nextLinks)));
    setSelectedReportScreenshotIds(Array.from(new Set(nextScreenshots)));
    setReportForm((prev) => ({
      ...prev,
      emailTo: nextPlatform?.email ?? prev.emailTo,
      selectedScreenshotUrls: Array.from(new Set(nextScreenshots.map((id) => {
        const screenshot = signalement.reportedItems
          ?.flatMap((item) => (item.screenshots ?? []).map((entry) => ({ ...entry, platformId: item.platformId })))
          .find((entry) => entry.id === id);
        return screenshot?.imageUrl ?? '';
      }).filter(Boolean))),
    }));
  }, [reportForm.platformId, reportPlatforms, reportableLinks, signalement]);

  const resetReportForm = useCallback((platform?: Platform | null) => {
    const nextPlatform = platform ?? reportPlatforms[0] ?? null;

    setReportForm({
      platformId: nextPlatform ? String(nextPlatform.id) : '',
      emailTo: nextPlatform?.email ?? '',
      emailSubject: '',
      emailBody: '',
      selectedScreenshotUrls: [],
    });

    const nextLinks = nextPlatform
      ? Array.from(new Set((signalement?.reportedItems ?? [])
          .filter((item) => item.platformId === nextPlatform.id)
          .map((item) => item.contentUrl)
          .filter((url): url is string => Boolean(url && url.trim().length > 0))))
      : [];
    const nextScreenshotIds = nextPlatform
      ? Array.from(new Set((signalement?.reportedItems ?? [])
          .filter((item) => item.platformId === nextPlatform.id)
          .flatMap((item) => (item.screenshots ?? []).map((screenshot) => screenshot.id))))
      : [];

    setSelectedReportLinks(nextLinks);
    setSelectedReportScreenshotIds(nextScreenshotIds);
  }, [reportPlatforms, signalement]);

  const handleCopyReference = async () => {
    const copied = await copyToClipboard(reference);
    if (copied) setToast('Référence copiée.');
  };

  const handleAction = async (status: 'VALIDATED' | 'REJECTED') => {
    if (!signalement || !id) return;

    if (status === 'REJECTED') {
      if (!rejectReason.trim()) {
        setRejectError('Veuillez renseigner un motif de rejet.');
        return;
      }
    }

    try {
      setActionBusy(true);
      await SignalementsService.updateSignalement(Number(id), { status });
      setSignalement((prev) => (prev ? { ...prev, status } : prev));
      setToast(status === 'VALIDATED' ? 'Signalement accepté.' : 'Signalement rejeté.');
      setRejectOpen(false);
      setRejectReason('');
      setRejectError(null);
    } catch {
      setToast('La mise à jour du statut a échoué.');
    } finally {
      setActionBusy(false);
    }
  };

  const handleAssignOrganization = async () => {
    if (!signalement || !selectedOrganizationId) {
      setAssignmentError('Veuillez sélectionner une organisation.');
      return;
    }

    try {
      setAssignmentBusy(true);
      setAssignmentError(null);

      const organization = organizations.find((item) => item.id === selectedOrganizationId);
      const newAssignment = await AssignmentsService.createAssignment({
        signalementId: signalement.id,
        organizationId: selectedOrganizationId,
      });

      setSignalement((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          assignedTo: [...(prev.assignedTo ?? []), {
            ...newAssignment,
            organization: organization ?? prev.assignedTo?.find((a) => a.organizationId === selectedOrganizationId)?.organization ?? undefined,
          }],
        };
      });

      setSelectedOrganizationId(null);
      setToast('Organisation affectée avec succès.');
    } catch {
      setAssignmentError('L\'affectation a échoué.');
    } finally {
      setAssignmentBusy(false);
    }
  };

  const handleCreateReport = async () => {
    if (!signalement || !reportForm.platformId || !reportForm.emailTo || !reportForm.emailSubject || !reportForm.emailBody) {
      setReportError('Veuillez remplir tous les champs du formulaire de rapport.');
      return;
    }

    try {
      setReportBusy(true);
      setReportError(null);

      const finalLinks = selectedReportLinks.length > 0
        ? `\n\nLiens à inclure:\n${selectedReportLinks.map((link) => `- ${link}`).join('\n')}`
        : '';

      const finalEmailBody = `${reportForm.emailBody}${finalLinks}`;

      await PlatformReportsService.createPlatformReport({
        signalementId: signalement.id,
        platformId: Number(reportForm.platformId),
        emailTo: reportForm.emailTo,
        emailSubject: reportForm.emailSubject,
        emailBody: finalEmailBody,
        selectedScreenshotUrls: selectedReportScreenshotUrls,
      });

      setToast('Rapport de plateforme créé.');
      setReportOpen(false);
      setReportForm({ platformId: '', emailTo: '', emailSubject: '', emailBody: '', selectedScreenshotUrls: [] });
      setSelectedReportLinks([]);
      setSelectedReportScreenshotIds([]);
    } catch {
      setReportError('La création du rapport a échoué.');
    } finally {
      setReportBusy(false);
    }
  };

  const handlePrint = () => window.print();

  const handlePdfExport = () => window.print();

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 dark:border-emc-border dark:bg-emc-surface">
          <div className="mb-4 h-5 w-40 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-10 w-64 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 dark:border-emc-border dark:bg-emc-surface">
            <div className="mb-3 h-5 w-48 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="space-y-3">
              <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
          <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 dark:border-emc-border dark:bg-emc-surface">
            <div className="mb-3 h-5 w-48 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="space-y-3">
              <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !signalement) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-emc-border dark:bg-emc-surface">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-emc-primary">Impossible de charger le signalement</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-emc-secondary">Le dossier demandé est introuvable ou inaccessible.</p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => void fetchSignalement()}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Réessayer
            </button>
            <Link to="/signalements" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-emc-border dark:text-emc-primary dark:hover:bg-emc-elevated">
              Retour aux signalements
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const canAccept = signalement.status === 'PENDING' || signalement.status === 'IN_PROGRESS';
  const canReject = signalement.status === 'PENDING' || signalement.status === 'IN_PROGRESS';

  const titulaireValue = signalement.titulaire === 'MOI_MEME' ? 'Oui' : signalement.titulaire === 'AUTRE_PERSONNE' ? 'Non' : 'Non';
  const accompaniments = (signalement.accompaniments ?? []).map((entry) => entry.type).filter(Boolean);
  const associatedOrganizations = (signalement.assignedTo ?? [])
    .map((assignment) => assignment.organization)
    .filter((organization): organization is Organization => Boolean(organization));
  const availableOrganizations = organizations.filter(
    (organization) => !associatedOrganizations.some((assigned) => assigned.id === organization.id),
  );

  return (
    <>
      <style>{`
        @media print {
          body { background: #fff; }
          .no-print { display: none !important; }
          .print-card { box-shadow: none !important; border: 1px solid #e5e7eb !important; }
          .print-break { break-inside: avoid; }
        }
      `}</style>

      <div className="mx-auto max-w-[1400px] space-y-5 p-3 sm:p-5 lg:p-6">
        {toast && (
          <div className="fixed right-4 top-4 z-50 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 shadow-lg dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
            {toast}
          </div>
        )}

        <header className="print-card no-print rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-emc-border dark:bg-emc-surface sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <Link
                to="/signalements"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-emc-secondary dark:hover:text-emc-primary"
                aria-label="Retour aux signalements"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm dark:border-emc-border dark:bg-emc-surface dark:text-emc-secondary">
                  <ArrowLeft className="h-4 w-4" />
                </span>
                <span>Retour aux signalements</span>
              </Link>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-emc-secondary">
                  Dossier de signalement
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-emc-primary sm:text-[2rem]">
                    {reference}
                  </h1>
                  <button
                    type="button"
                    onClick={handleCopyReference}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-emc-border dark:bg-emc-surface dark:text-emc-primary dark:hover:bg-emc-elevated"
                    aria-label="Copier la référence"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge status={signalement.status} size="sm" />
                  <PriorityBadge priority={signalement.priority} />
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary">
                    Titulaire : {titulaireValue}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-emc-border dark:bg-emc-surface dark:text-emc-primary dark:hover:bg-emc-elevated"
              >
                <Printer className="h-4 w-4" />
                Imprimer
              </button>
              <button
                type="button"
                onClick={handlePdfExport}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary dark:hover:bg-emc-border"
              >
                <Download className="h-4 w-4" />
                Télécharger PDF
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm text-slate-600 dark:border-emc-border dark:text-emc-secondary">
            <div className="flex flex-wrap items-center gap-4">
              <span>Créé le {formatDate(signalement.createdAt)}</span>
              <span>Émetteur : {displayValue(signalement.issuer)}</span>
            </div>
            <Link to="/signalements" className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-emc-primary dark:hover:text-white">
              <ArrowLeft className="h-3.5 w-3.5" />
              Signalements
            </Link>
          </div>
        </header>

        <section className="print-card rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-emc-border dark:bg-emc-surface">
          <div className="grid gap-0 sm:grid-cols-2 xl:grid-cols-6">
            {[
              { label: 'Statut', icon: BadgeCheck, value: <StatusBadge status={signalement.status} size="sm" /> },
              { label: 'Priorité', icon: FileSearch, value: <PriorityBadge priority={signalement.priority} /> },
              { label: 'Titulaire', icon: UserRoundCheck, value: <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary">{titulaireValue}</span> },
              { label: 'Réception', icon: Clock3, value: <span className="text-sm font-medium text-slate-700 dark:text-emc-primary">{formatDate(signalement.createdAt)}</span> },
              { label: 'Analyse', icon: FileSearch, value: <span className="text-sm font-medium text-slate-700 dark:text-emc-primary">—</span> },
              { label: 'Approbation', icon: BadgeCheck, value: <span className="text-sm font-medium text-slate-700 dark:text-emc-primary">—</span> },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={`p-3 ${index > 0 ? 'border-t border-slate-200 sm:border-l sm:border-t-0 xl:border-l xl:border-t-0' : ''} bg-slate-50/80 dark:bg-emc-elevated/40`}
                >
                  <div className="flex items-center gap-2 text-slate-500 dark:text-emc-secondary">
                    <Icon className="h-3.5 w-3.5" />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em]">{item.label}</p>
                  </div>
                  <div className="mt-2">{item.value}</div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[1.05fr_1.2fr]">
          <section className="print-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-emc-border dark:bg-emc-surface">
            <div className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-3 dark:border-emc-border">
              <User className="h-4 w-4 text-violet-500" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-emc-primary">Informations sur la victime</h2>
            </div>

            <dl className="space-y-3 text-sm">
              <div className="grid gap-2 sm:grid-cols-[120px_1fr]">
                <dt className="text-slate-500 dark:text-emc-secondary">Nom complet</dt>
                <dd className="font-medium text-slate-900 dark:text-emc-primary">{displayValue([signalement.victim?.firstName, signalement.victim?.lastName].filter(Boolean).join(' '))}</dd>
              </div>
              <div className="grid gap-2 sm:grid-cols-[120px_1fr]">
                <dt className="text-slate-500 dark:text-emc-secondary">Email</dt>
                <dd className="break-all font-medium text-slate-900 dark:text-emc-primary">{displayValue(signalement.victim?.email)}</dd>
              </div>
              <div className="grid gap-2 sm:grid-cols-[120px_1fr]">
                <dt className="text-slate-500 dark:text-emc-secondary">Téléphone</dt>
                <dd className="break-all font-medium text-slate-900 dark:text-emc-primary">{displayValue(signalement.victim?.telephone)}</dd>
              </div>
              <div className="grid gap-2 sm:grid-cols-[120px_1fr]">
                <dt className="text-slate-500 dark:text-emc-secondary">Ville</dt>
                <dd className="font-medium text-slate-900 dark:text-emc-primary">{displayValue(signalement.victim?.city)}</dd>
              </div>
              <div className="grid gap-2 sm:grid-cols-[120px_1fr]">
                <dt className="text-slate-500 dark:text-emc-secondary">Sexe</dt>
                <dd className="font-medium text-slate-900 dark:text-emc-primary">{signalement.victim?.sex === 'MALE' ? 'Homme' : signalement.victim?.sex === 'FEMALE' ? 'Femme' : '—'}</dd>
              </div>
              <div className="grid gap-2 sm:grid-cols-[120px_1fr]">
                <dt className="text-slate-500 dark:text-emc-secondary">Tranche d&apos;âge</dt>
                <dd className="font-medium text-slate-900 dark:text-emc-primary">
                  {signalement.victim?.ageGroup === 'CHILD_5_12'
                    ? '5–12 ans'
                    : signalement.victim?.ageGroup === 'TEEN_13_17'
                      ? '13–17 ans'
                      : signalement.victim?.ageGroup === 'YOUNG_ADULT_18_25'
                        ? '18–25 ans'
                        : signalement.victim?.ageGroup === 'ADULT_26_PLUS'
                          ? '26 ans et plus'
                          : '—'}
                </dd>
              </div>
            </dl>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">Référence victime</p>
                  <p className="mt-1 truncate font-mono text-sm font-bold text-slate-900 dark:text-emc-primary">{reference}</p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyReference}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-amber-200 bg-white text-amber-700 transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
                  aria-label="Copier la référence"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </section>

          <section className="print-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-emc-border dark:bg-emc-surface">
            <div className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-3 dark:border-emc-border">
              <FileText className="h-4 w-4 text-blue-500" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-emc-primary">Informations du signalement</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-emc-secondary">Type de cyberviolence</p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-emc-primary">{displayValue(signalement.cyberViolence?.name || signalement.otherCyberViolence)}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-emc-secondary">Autre type</p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-emc-primary">{displayValue(signalement.otherCyberViolence)}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-emc-secondary">Émetteur</p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-emc-primary">{displayValue(signalement.issuer)}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-emc-secondary">Titulaire</p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-emc-primary">{titulaireValue}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-emc-secondary">Description</p>
                <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary">
                  {displayValue(signalement.description)}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-emc-secondary">Accompagnement</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(accompaniments.length > 0 ? accompaniments : ['SUP']).map((type) => (
                    <span key={type} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-700 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-emc-secondary">Approbation</p>
                <div className="mt-2">
                  {signalement.status === 'VALIDATED' ? (
                    <StatusBadge status="VALIDATED" size="sm" />
                  ) : signalement.status === 'REJECTED' ? (
                    <StatusBadge status="REJECTED" size="sm" />
                  ) : (
                    <StatusBadge status="PENDING" size="sm" />
                  )}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-emc-secondary">Date de réception</p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-emc-primary">{formatDate(signalement.createdAt)}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-emc-secondary">Date d&apos;analyse</p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-emc-primary">—</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-emc-secondary">Date d&apos;approbation</p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-emc-primary">—</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-emc-secondary">Dernière mise à jour</p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-emc-primary">{formatDate(signalement.updatedAt)}</p>
              </div>
            </div>
          </section>
        </div>

        <section className="print-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-emc-border dark:bg-emc-surface">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-emc-border">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-emc-primary">Contenus signalés</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-emc-secondary">Plateformes et contenus associés à ce signalement</p>
            </div>
          </div>

          {signalement.reportedItems && signalement.reportedItems.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {signalement.reportedItems.map((item) => (
                <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-emc-border dark:bg-emc-elevated/40">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-emc-secondary">Plateforme</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-emc-primary">{item.platform?.name ?? 'Plateforme'}</p>
                    </div>
                    <span className="inline-flex w-fit rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                      {getContentTypeLabel(item.type)}
                    </span>
                  </div>

                  {item.description && (
                    <div className="mt-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-emc-secondary">Description</p>
                      <p className="mt-2 rounded-xl border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700 dark:border-emc-border dark:bg-emc-surface dark:text-emc-primary">
                        {item.description}
                      </p>
                    </div>
                  )}

                  {item.contentUrl && (
                    <div className="mt-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-emc-secondary">Lien du contenu</p>
                      <div className="mt-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-emc-border dark:bg-emc-surface">
                        <a
                          href={item.contentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all text-sm text-blue-600 underline decoration-dotted underline-offset-4 dark:text-blue-400"
                        >
                          {item.contentUrl}
                        </a>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <a
                            href={item.contentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                          >
                            Ouvrir le lien
                          </a>
                          <button
                            type="button"
                            onClick={async () => {
                              const copied = await copyToClipboard(item.contentUrl);
                              if (copied) setToast('Lien copié.');
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            Copier
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-secondary">
              Aucun contenu signalé n&apos;a été enregistré pour ce dossier.
            </div>
          )}
        </section>

        <section className="print-card rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm dark:border-emc-border dark:bg-emc-surface">
          <div className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-3 dark:border-emc-border">
            <Building2 className="h-4 w-4 text-emerald-500" />
            <h2 className="text-[22px] font-bold leading-tight text-slate-900 dark:text-emc-primary">Traitement du signalement</h2>
          </div>

           <div className="space-y-4">
             <div>
               <p className="mb-3 text-[15px] font-semibold text-slate-800 dark:text-emc-primary">Affecter une organisation</p>
               <div className="flex flex-col gap-3 sm:flex-row">
                 <div className="relative w-full">
                   <select
                     id="organization-select"
                     value={selectedOrganizationId ?? ''}
                     onChange={(event) => setSelectedOrganizationId(event.target.value ? Number(event.target.value) : null)}
                     className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-10 text-sm text-slate-500 outline-none transition focus:border-blue-500 dark:border-emc-border dark:bg-emc-surface dark:text-emc-primary"
                   >
                     <option value="">Sélectionner une organisation</option>
                     {availableOrganizations.map((organization) => (
                       <option key={organization.id} value={organization.id}>
                         {organization.name}
                       </option>
                     ))}
                   </select>
                   <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500 dark:text-emc-secondary">
                     <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path d="M5.5 7.5L10 12l4.5-4.5H5.5Z" /></svg>
                   </span>
                 </div>
                 <div className="flex items-center gap-3">
                   {selectedOrganizationId && (() => {
                     const org = organizations.find((item) => item.id === selectedOrganizationId);
                     if (!org) return null;
                     return (
                       <span className={categoryBadgeStyles[org.category] || 'inline-flex rounded-full bg-slate-500/10 px-2.5 py-1 text-[11px] font-semibold text-slate-700'}>
                         {categoryLabels[org.category] || org.category}
                       </span>
                     );
                   })()}
                   <button
                     type="button"
                     onClick={() => void handleAssignOrganization()}
                     disabled={assignmentBusy || !selectedOrganizationId}
                     className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                   >
                     {assignmentBusy ? 'Affectation...' : 'Affecter'}
                   </button>
                 </div>
               </div>
             </div>

            {assignmentError && <p className="text-sm text-rose-600 dark:text-rose-400">{assignmentError}</p>}

            <div>
              <p className="mb-3 text-[15px] font-semibold text-slate-800 dark:text-emc-primary">Organisations affectées</p>
              {associatedOrganizations.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {associatedOrganizations.map((organization) => (
                    <div key={organization.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-emc-border dark:bg-emc-elevated/40">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 dark:border-emc-border dark:bg-emc-surface dark:text-emc-primary">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-[15px] font-semibold text-slate-900 dark:text-emc-primary">{organization.name}</p>
                            <span className={categoryBadgeStyles[organization.category] || 'inline-flex rounded-full bg-slate-500/10 px-2 py-1 text-[10px] font-semibold text-slate-600'}>
                              {categoryLabels[organization.category] || organization.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-emc-secondary">Affectée le {formatDate(new Date().toISOString())}</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
                        <Check className="h-3 w-3" />
                        Affectée
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-500 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-secondary">
                  Aucune organisation affectée.
                </div>
              )}
            </div>

            <div className="grid gap-3 pt-2 md:grid-cols-2 xl:grid-cols-4">
              <button
                type="button"
                onClick={() => void handleAction('VALIDATED')}
                disabled={!canAccept || actionBusy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[15px] font-semibold text-emerald-700 shadow-sm hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300"
              >
                <Check className="h-4 w-4" />
                {actionBusy ? 'Traitement...' : 'Valider le signalement'}
              </button>

              <button
                type="button"
                onClick={() => setRejectOpen(true)}
                disabled={!canReject || actionBusy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[15px] font-semibold text-rose-700 shadow-sm hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300"
              >
                <X className="h-4 w-4" />
                Rejeter le signalement
              </button>

              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-[15px] font-semibold text-blue-700 shadow-sm hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300"
              >
                <Building2 className="h-4 w-4" />
                Affecter une organisation
              </button>

              <button
                type="button"
                onClick={() => {
                  const firstPlatform = reportPlatforms[0];
                  if (firstPlatform) {
                    setReportForm({
                      platformId: String(firstPlatform.id),
                      emailTo: firstPlatform.email,
                      emailSubject: '',
                      emailBody: '',
                      selectedScreenshotUrls: [],
                    });
                  }
                  setReportOpen(true);
                }}
                disabled={reportPlatforms.length === 0}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-[15px] font-semibold text-violet-700 shadow-sm hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-violet-900/40 dark:bg-violet-950/20 dark:text-violet-300"
              >
                <FileText className="h-4 w-4" />
                Générer un rapport plateforme
              </button>
            </div>
          </div>
        </section>

        <section className="print-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-emc-border dark:bg-emc-surface">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-emc-border">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-emc-primary">Historique du traitement</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-emc-secondary">Suivi des affectations et des actions réalisées sur ce signalement</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 dark:border-emc-border dark:text-emc-secondary">
                  <th className="px-3 py-2 font-semibold">Accompagnement</th>
                  <th className="px-3 py-2 font-semibold">Organisation</th>
                  <th className="px-3 py-2 font-semibold">Date d&apos;envoi</th>
                  <th className="px-3 py-2 font-semibold">État</th>
                  <th className="px-3 py-2 font-semibold">Date de traitement</th>
                  <th className="px-3 py-2 font-semibold">Date de clôture</th>
                  <th className="px-3 py-2 font-semibold">Motif</th>
                  <th className="px-3 py-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const assignments = (signalement.assignedTo ?? []).map((assignment) => ({
                    kind: 'assignment' as const,
                    id: `${assignment.signalementId}-${assignment.organizationId}-${assignment.type}`,
                    type: assignment.type,
                    name: assignment.organization?.name ?? '—',
                    date: assignment.createdAt,
                    status: assignment.status,
                    processedAt: assignment.processedAt,
                    closedAt: assignment.closedAt,
                    reason: assignment.reason,
                  }));

                  const platforms = (signalement.platforms ?? []).map((platformReport) => ({
                    kind: 'platform' as const,
                    id: `${platformReport.signalementId}-${platformReport.platformId}-SUP`,
                    type: 'SUP' as const,
                    name: platformReport.platform?.name ?? '—',
                    date: platformReport.createdAt,
                    status: platformReport.status,
                    processedAt: null as string | null,
                    closedAt: platformReport.closedAt,
                    reason: platformReport.emailSubject,
                  }));

                  const history = [...assignments, ...platforms].sort((a, b) => {
                    const dateA = a.date ? new Date(a.date).getTime() : 0;
                    const dateB = b.date ? new Date(b.date).getTime() : 0;
                    return dateB - dateA;
                  });

                  if (history.length > 0) {
                    return history.map((entry) => (
                      <tr key={entry.id} className="border-b border-slate-200 align-top last:border-b-0 dark:border-emc-border">
                        <td className="px-3 py-3 text-slate-700 dark:text-emc-primary">
                          <span className={accompanimentBadgeStyles[entry.type] || 'inline-flex rounded-full bg-slate-500/10 px-2.5 py-1 text-[11px] font-semibold text-slate-700'}>
                            {entry.type === 'JUR' ? 'Juridique' : entry.type === 'PSY' ? 'Psychique' : entry.type === 'SUP' ? 'SUP' : entry.type}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-slate-700 dark:text-emc-primary">{entry.name}</td>
                        <td className="px-3 py-3 text-slate-700 dark:text-emc-primary">{formatDate(entry.date)}</td>
                        <td className="px-3 py-3"><StatusBadge status={entry.status} size="sm" /></td>
                        <td className="px-3 py-3 text-slate-700 dark:text-emc-primary">{formatDate(entry.processedAt)}</td>
                        <td className="px-3 py-3 text-slate-700 dark:text-emc-primary">{formatDate(entry.closedAt)}</td>
                        <td className="px-3 py-3 text-slate-700 dark:text-emc-primary">{displayValue(entry.reason)}</td>
                        <td className="px-3 py-3 text-slate-700 dark:text-emc-primary">
                          <button type="button" className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-emc-border dark:bg-emc-surface dark:text-emc-primary dark:hover:bg-emc-elevated">
                            Voir
                          </button>
                        </td>
                      </tr>
                    ));
                  }

                  if (signalement.validate && signalement.validate.length > 0) {
                    return signalement.validate.map((entry) => (
                      <tr key={`${entry.signalementId}-${entry.userId}`} className="border-b border-slate-200 align-top last:border-b-0 dark:border-emc-border">
                        <td className="px-3 py-3 text-slate-700 dark:text-emc-primary">{displayValue(entry.type)}</td>
                        <td className="px-3 py-3 text-slate-700 dark:text-emc-primary">{displayValue(entry.user?.role?.name) ?? '—'}</td>
                        <td className="px-3 py-3 text-slate-700 dark:text-emc-primary">{formatDate(entry.createdAt)}</td>
                        <td className="px-3 py-3"><StatusBadge status={entry.status} size="sm" /></td>
                        <td className="px-3 py-3 text-slate-700 dark:text-emc-primary">—</td>
                        <td className="px-3 py-3 text-slate-700 dark:text-emc-primary">—</td>
                        <td className="px-3 py-3 text-slate-700 dark:text-emc-primary">{displayValue(entry.reason)}</td>
                        <td className="px-3 py-3 text-slate-700 dark:text-emc-primary">
                          <button type="button" className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-emc-border dark:bg-emc-surface dark:text-emc-primary dark:hover:bg-emc-elevated">
                            Voir
                          </button>
                        </td>
                      </tr>
                    ));
                  }

                  return (
                    <tr>
                      <td colSpan={8} className="px-3 py-6 text-center text-sm text-slate-500 dark:text-emc-secondary">
                        Aucun historique de traitement
                      </td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="print-card no-print border-t border-slate-200 pt-4 text-center text-sm text-slate-500 dark:border-emc-border dark:text-emc-secondary">
          <div className="flex items-center justify-center gap-2">
            <img src={resolvedTheme === 'dark' ? logoDarkmode : logoLightmode} alt="EMC Helpline" className="h-7 w-auto object-contain" />
            <span className="font-semibold text-slate-700 dark:text-emc-primary">EMC HELPLINE</span>
          </div>
          <p className="mt-2">Plateforme de signalement des cyberviolences</p>
        </footer>
      </div>

      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-[1180px] rounded-[24px] border border-slate-200 bg-[#f5f5f7] p-5 shadow-[0_20px_50px_rgba(15,23,42,0.18)] dark:border-emc-border dark:bg-emc-surface">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-emc-secondary">Rapport</p>
                <h3 className="mt-1 text-[28px] font-semibold leading-tight text-slate-900 dark:text-emc-primary">Créer un rapport plateforme</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReportOpen(false);
                  resetReportForm();
                }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-emc-secondary dark:hover:bg-emc-elevated"
                aria-label="Fermer la fenêtre de rapport"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.12fr]">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-[13px] font-medium text-slate-700 dark:text-emc-primary">Plateforme</label>
                  <select
                    value={reportForm.platformId}
                    onChange={(event) => {
                      const nextPlatform = reportPlatforms.find((platform) => String(platform.id) === event.target.value) ?? null;
                      setReportForm((prev) => ({
                        ...prev,
                        platformId: event.target.value,
                        emailTo: nextPlatform?.email ?? '',
                        selectedScreenshotUrls: [],
                      }));
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-[#f7f7f9] px-3 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-400 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                  >
                    <option value="">Sélectionner une plateforme</option>
                    {reportPlatforms.map((platform) => (
                      <option key={platform.id} value={platform.id}>{platform.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-medium text-slate-700 dark:text-emc-primary">Destinataire</label>
                  <input
                    type="email"
                    value={selectedReportPlatform?.email ?? reportForm.emailTo}
                    readOnly
                    className="w-full rounded-xl border border-slate-200 bg-[#f7f7f9] px-3 py-3 text-sm text-slate-900 opacity-90 shadow-sm outline-none dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                    placeholder="abuse@platform.example"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-medium text-slate-700 dark:text-emc-primary">Objet</label>
                  <input
                    type="text"
                    value={reportForm.emailSubject}
                    onChange={(event) => setReportForm((prev) => ({ ...prev, emailSubject: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-[#f7f7f9] px-3 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-400 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                    placeholder="Demande de retrait de contenu"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-medium text-slate-700 dark:text-emc-primary">Message</label>
                  <textarea
                    rows={7}
                    value={reportForm.emailBody}
                    onChange={(event) => setReportForm((prev) => ({ ...prev, emailBody: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-[#f7f7f9] px-3 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-400 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                    placeholder="Rédigez le message de demande de suppression..."
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-[18px] border border-slate-200 bg-[#f3f4f6] p-3 dark:border-emc-border dark:bg-emc-elevated/40">
                <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-emc-border dark:bg-emc-surface">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                      <Link2 className="h-3.5 w-3.5" />
                    </span>
                    <h4 className="text-[13px] font-semibold text-slate-800 dark:text-emc-primary">Liens signalés</h4>
                  </div>
                  <p className="mb-3 text-[11px] leading-5 text-slate-500 dark:text-emc-secondary">
                    Sélectionnez les liens à inclure dans votre rapport. Cliquez sur <span className="font-medium text-slate-700 dark:text-emc-primary">✓</span> pour les retirer.
                  </p>

                  {reportableLinks.length > 0 ? (
                    <div className="space-y-2">
                      {reportableLinks.map((link) => {
                        const isSelected = selectedReportLinks.includes(link);
                        return (
                          <div
                            key={link}
                            className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 ${isSelected ? 'border-violet-200 bg-violet-50/60 dark:border-violet-900/50 dark:bg-violet-950/20' : 'border-slate-200 bg-slate-50 dark:border-emc-border dark:bg-emc-elevated'}`}
                          >
                            <button
                              type="button"
                              aria-label={isSelected ? 'Retirer ce lien du rapport' : 'Ajouter ce lien au rapport'}
                              onClick={() => setSelectedReportLinks((prev) =>
                                isSelected ? prev.filter((entry) => entry !== link) : [...prev, link],
                              )}
                              className={`flex h-5 w-5 items-center justify-center rounded-md border text-[10px] font-bold transition ${isSelected ? 'border-violet-500 bg-violet-500 text-white' : 'border-slate-300 bg-white text-slate-400 dark:border-emc-border dark:bg-emc-surface dark:text-emc-secondary'}`}
                            >
                              {isSelected ? '✓' : ''}
                            </button>
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={link}
                              className="flex min-w-0 flex-1 items-center gap-2 text-[12px] text-slate-700 hover:text-blue-600 dark:text-emc-primary dark:hover:text-blue-400"
                            >
                              <Link2 className="h-3.5 w-3.5 shrink-0 text-violet-500" />
                              <span className="block max-w-full truncate">{link}</span>
                            </a>
                            <button
                              type="button"
                              aria-label={`Retirer le lien ${link}`}
                              title="Retirer ce lien du rapport"
                              onClick={() => setSelectedReportLinks((prev) => prev.filter((entry) => entry !== link))}
                              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-emc-border dark:bg-emc-surface dark:text-emc-secondary dark:hover:border-rose-900/50 dark:hover:bg-rose-950/20 dark:hover:text-rose-300"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-500 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-secondary">
                      Aucun lien à joindre
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-emc-border dark:bg-emc-surface">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <h4 className="text-[13px] font-semibold text-slate-800 dark:text-emc-primary">Captures d&apos;écran</h4>
                  </div>
                  <p className="mb-3 text-[11px] leading-5 text-slate-500 dark:text-emc-secondary">
                    Sélectionnez les captures à inclure. Cliquez sur <span className="font-medium text-slate-700 dark:text-emc-primary">✓</span> pour les retirer.
                  </p>

                  {reportableScreenshots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {reportableScreenshots.map((screenshot) => {
                        const isSelected = selectedReportScreenshotIds.includes(screenshot.id);
                        return (
                          <div
                            key={screenshot.id}
                            className={`relative overflow-hidden rounded-xl border ${isSelected ? 'border-violet-200 bg-violet-50/60 dark:border-violet-900/50 dark:bg-violet-950/20' : 'border-slate-200 bg-slate-50 dark:border-emc-border dark:bg-emc-elevated'}`}
                          >
                            <button
                              type="button"
                              aria-label={isSelected ? 'Retirer cette capture du rapport' : 'Ajouter cette capture au rapport'}
                              onClick={() => setSelectedReportScreenshotIds((prev) => isSelected ? prev.filter((entry) => entry !== screenshot.id) : [...prev, screenshot.id])}
                              className={`absolute left-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-md border text-[10px] font-bold shadow-sm ${isSelected ? 'border-violet-500 bg-violet-500 text-white' : 'border-slate-300 bg-white text-slate-400 dark:border-emc-border dark:bg-emc-surface dark:text-emc-secondary'}`}
                            >
                              {isSelected ? '✓' : ''}
                            </button>
                            <button
                              type="button"
                              aria-label={`Retirer la capture ${screenshot.id}`}
                              title="Retirer cette capture du rapport"
                              onClick={() => setSelectedReportScreenshotIds((prev) => prev.filter((entry) => entry !== screenshot.id))}
                              className="absolute right-2 top-2 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-600 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-emc-border dark:bg-slate-900/80 dark:text-emc-primary dark:hover:border-rose-900/50 dark:hover:bg-rose-950/20 dark:hover:text-rose-300"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                            <img
                              src={screenshot.imageUrl}
                              alt={screenshot.itemLabel || 'Capture'}
                              className="h-28 w-full object-cover"
                            />
                            <div className="border-t border-slate-200 bg-white/90 px-2 py-1 text-[10px] text-slate-500 dark:border-emc-border dark:bg-slate-900/80 dark:text-emc-secondary">
                              {screenshot.itemLabel || 'Capture'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-500 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-secondary">
                      Aucune capture à joindre
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-[12px] text-violet-700 dark:border-violet-900/40 dark:bg-violet-950/20 dark:text-violet-300">
              <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-violet-200 text-[10px] font-bold text-violet-700 dark:bg-violet-900/50 dark:text-violet-200">i</span>
              Seuls les liens et captures sélectionnés seront inclus dans le rapport envoyé à la plateforme.
            </div>

            {reportError && <p className="mt-4 text-sm text-rose-600 dark:text-rose-400">{reportError}</p>}

            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setReportOpen(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-emc-border dark:bg-emc-surface dark:text-emc-primary dark:hover:bg-emc-elevated">
                Annuler
              </button>
              <button type="button" onClick={() => void handleCreateReport()} disabled={reportBusy} className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60">
                {reportBusy ? 'Envoi...' : 'Créer le rapport'}
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-emc-border dark:bg-emc-surface">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-emc-secondary">Confirmation</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900 dark:text-emc-primary">Rejeter le signalement</h3>
              </div>
              <button type="button" onClick={() => setRejectOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-emc-secondary dark:hover:bg-emc-elevated" aria-label="Fermer la fenêtre de rejet">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-emc-secondary">
              Vous êtes sur le point de rejeter ce signalement. Merci de préciser le motif de rejet avant de confirmer.
            </p>

            <div className="mt-4">
              <label htmlFor="reject-reason" className="mb-2 block text-sm font-medium text-slate-700 dark:text-emc-primary">
                Motif du rejet <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(event) => {
                  setRejectReason(event.target.value);
                  if (rejectError) setRejectError(null);
                }}
                rows={5}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-blue-500 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                placeholder="Renseignez le motif du rejet..."
              />
              {rejectError && <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{rejectError}</p>}
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setRejectOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-emc-border dark:text-emc-primary dark:hover:bg-emc-elevated">
                Annuler
              </button>
              <button type="button" onClick={() => void handleAction('REJECTED')} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700">
                Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SignalementDetailPage;

