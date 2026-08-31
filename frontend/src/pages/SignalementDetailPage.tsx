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
  ChevronDown,
  PlayCircle,
  AlertTriangle,
  Loader2,
  Eye,
  Clock,
} from 'lucide-react';
import { generateSignalementPDF } from '../utils/pdfGenerator';
import { SignalementsService } from '../services/signalements.service';
import { OrganizationsService } from '../services/organizations.service';
import { AssignmentsService } from '../services/assignments.service';
import { PlatformReportsService } from '../services/platformReports.service';
import type { AssignedTo, Organization, Platform, Signalement } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import logoLightmode from '../assets/logo-lightmode.png';
import logoDarkmode from '../assets/logo-darkmode.png';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

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
  const { user } = useAuth();
  const isOrgUser = user?.role?.name === 'ORGANIZATION_USER';

  const [signalement, setSignalement] = useState<Signalement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

  // Organization User Processing Form State & Dirty Tracking
  const [orgStatus, setOrgStatus] = useState<string>('ON_HOLD');
  const [orgNotes, setOrgNotes] = useState<string>('');
  const [orgReportActions, setOrgReportActions] = useState<string>('');
  const [orgReportObservations, setOrgReportObservations] = useState<string>('');
  const [orgReportResult, setOrgReportResult] = useState<string>('');
  const [orgReportRecommendations, setOrgReportRecommendations] = useState<string>('');
  const [orgSaving, setOrgSaving] = useState(false);

  const [savedOrgData, setSavedOrgData] = useState<{
    status: string;
    notes: string;
    reportActions: string;
    reportObservations: string;
    reportResult: string;
    reportRecommendations: string;
  }>({
    status: 'ON_HOLD',
    notes: '',
    reportActions: '',
    reportObservations: '',
    reportResult: '',
    reportRecommendations: '',
  });

  const isOrgDirty = useMemo(() => {
    return (
      orgStatus !== savedOrgData.status ||
      orgNotes !== savedOrgData.notes ||
      orgReportActions !== savedOrgData.reportActions ||
      orgReportObservations !== savedOrgData.reportObservations ||
      orgReportResult !== savedOrgData.reportResult ||
      orgReportRecommendations !== savedOrgData.reportRecommendations
    );
  }, [
    orgStatus,
    orgNotes,
    orgReportActions,
    orgReportObservations,
    orgReportResult,
    orgReportRecommendations,
    savedOrgData,
  ]);

  // Inspection Modal state for Admin/Technician
  const [inspectAssignment, setInspectAssignment] = useState<AssignedTo | null>(null);

  // Status / Priority editing
  const [statusBusy, setStatusBusy] = useState(false);
  const [priorityBusy, setPriorityBusy] = useState(false);
  const [confirmStatusChange, setConfirmStatusChange] = useState<{ from: string; to: string } | null>(null);
  // Start Analysis
  const [analyseBusy, setAnalyseBusy] = useState(false);
  const [startAnalyseConfirm, setStartAnalyseConfirm] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  // Assignment Modal & Cancellation state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignOrgId, setAssignOrgId] = useState<number | null>(null);
  const [assignMotif, setAssignMotif] = useState('');
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignBusy, setAssignBusy] = useState(false);
  const [cancelAssignmentTarget, setCancelAssignmentTarget] = useState<AssignedTo | null>(null);
  const [cancelAssignmentBusy, setCancelAssignmentBusy] = useState(false);
  // Platform Report State
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTargetPlatform, setReportTargetPlatform] = useState<Platform | null>(null);
  const [reportTargetItem, setReportTargetItem] = useState<any | null>(null);
  const [reportForm, setReportForm] = useState({ platformId: '', emailTo: '', emailSubject: '', emailBody: '', selectedScreenshotUrls: [] as string[] });
  const [selectedReportLinks, setSelectedReportLinks] = useState<string[]>([]);
  const [selectedReportScreenshotIds, setSelectedReportScreenshotIds] = useState<number[]>([]);
  const [reportBusy, setReportBusy] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);

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
      if (result?.assignedTo && result.assignedTo.length > 0) {
        const assigned = result.assignedTo[0];
        const dataToSet = {
          status: assigned.status || 'ON_HOLD',
          notes: assigned.notes || '',
          reportActions: assigned.reportActions || '',
          reportObservations: assigned.reportObservations || '',
          reportResult: assigned.reportResult || '',
          reportRecommendations: assigned.reportRecommendations || '',
        };
        setOrgStatus(dataToSet.status);
        setOrgNotes(dataToSet.notes);
        setOrgReportActions(dataToSet.reportActions);
        setOrgReportObservations(dataToSet.reportObservations);
        setOrgReportResult(dataToSet.reportResult);
        setOrgReportRecommendations(dataToSet.reportRecommendations);
        setSavedOrgData(dataToSet);
      }
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
    const timeout = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast(message);
    setToastType(type);
  }, []);

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
    () => signalement?.reference || (signalement?.id ? `SIG-${signalement.id}` : 'SIG-INCONNU'),
    [signalement],
  );





  const handleCopyReference = async () => {
    const copied = await copyToClipboard(reference);
    if (copied) showToast('Référence copiée.');
  };

  // Status label helper
  const getStatusLabel = (s: string) => {
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      IN_PROGRESS: 'En cours',
      VALIDATED: 'Validé',
      REJECTED: 'Rejeté',
      CLOSED: 'Clôturé',
    };
    return labels[s] ?? s;
  };

  // Compute active rejection reason if current status is REJECTED
  const rejectionReason = useMemo(() => {
    if (signalement?.status !== 'REJECTED') return null;
    const val = signalement?.validate?.find((v) => v.status === 'REJECTED' || v.reason);
    return val?.reason ?? null;
  }, [signalement]);

  // Handle manual status select change
  const handleStatusSelectChange = (newStatus: string) => {
    if (!signalement || newStatus === signalement.status) return;

    if (newStatus === 'REJECTED') {
      setRejectReason('');
      setRejectError(null);
      setRejectOpen(true);
    } else {
      setConfirmStatusChange({ from: signalement.status, to: newStatus });
    }
  };

  // Confirm rejection handler
  const handleConfirmRejection = async () => {
    if (!signalement || !id) return;

    if (!rejectReason.trim()) {
      setRejectError('Veuillez renseigner un motif de rejet.');
      return;
    }

    try {
      setActionBusy(true);
      const updated = await SignalementsService.updateSignalement(Number(id), {
        status: 'REJECTED',
        reason: rejectReason.trim(),
      });
      setSignalement(updated);
      showToast('Signalement rejeté.');
      setRejectOpen(false);
      setRejectReason('');
      setRejectError(null);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'La mise à jour du statut a échoué.';
      showToast(msg, 'error');
    } finally {
      setActionBusy(false);
    }
  };

  // Confirm normal status change (or leaving REJECTED)
  const confirmStatusChangeHandler = async () => {
    if (!signalement || !id || !confirmStatusChange) return;
    const { to } = confirmStatusChange;
    try {
      setStatusBusy(true);
      const updated = await SignalementsService.updateSignalement(Number(id), { status: to as any });
      setSignalement(updated);
      showToast(`Statut mis à jour : ${getStatusLabel(to)}`);
      setConfirmStatusChange(null);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'La mise à jour du statut a échoué.';
      showToast(msg, 'error');
      setConfirmStatusChange(null);
    } finally {
      setStatusBusy(false);
    }
  };

  // Handle manual priority change — no confirmation needed
  const handlePriorityChange = async (newPriority: string) => {
    if (!signalement || !id || newPriority === signalement.priority) return;
    try {
      setPriorityBusy(true);
      await SignalementsService.updateSignalement(Number(id), { priority: newPriority as any });
      setSignalement((prev) => (prev ? { ...prev, priority: newPriority as any } : prev));
      showToast('Priorité mise à jour.');
    } catch {
      showToast('La mise à jour de la priorité a échoué.', 'error');
    } finally {
      setPriorityBusy(false);
    }
  };

  // Confirm assignment with motif
  const handleConfirmAssignment = async () => {
    if (!signalement || !assignOrgId) {
      setAssignError('Veuillez sélectionner une organisation.');
      return;
    }
    if (!assignMotif.trim()) {
      setAssignError('Veuillez renseigner le motif de l\'affectation.');
      return;
    }

    try {
      setAssignBusy(true);
      setAssignError(null);
      await AssignmentsService.createAssignment({
        signalementId: signalement.id,
        organizationId: assignOrgId,
        reason: assignMotif.trim(),
      });
      await fetchSignalement();
      showToast('Organisation affectée avec succès.');
      setAssignModalOpen(false);
      setAssignOrgId(null);
      setAssignMotif('');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'L\'affectation a échoué.';
      setAssignError(msg);
    } finally {
      setAssignBusy(false);
    }
  };

  // Confirm cancellation of assignment
  const handleConfirmCancelAssignment = async () => {
    if (!signalement || !cancelAssignmentTarget) return;

    try {
      setCancelAssignmentBusy(true);
      await AssignmentsService.deleteAssignment(
        signalement.id,
        cancelAssignmentTarget.organizationId
      );
      await fetchSignalement();
      showToast('Affectation annulée avec succès.');
      setCancelAssignmentTarget(null);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Impossible d\'annuler l\'affectation.';
      showToast(msg, 'error');
    } finally {
      setCancelAssignmentBusy(false);
    }
  };

  // Handle start analysis
  const handleStartAnalysis = async () => {
    if (!signalement || !id) return;
    try {
      setAnalyseBusy(true);
      const now = new Date().toISOString();
      await SignalementsService.updateSignalement(Number(id), { dateAnalyse: now, status: 'IN_PROGRESS' });
      setSignalement((prev) => prev ? { ...prev, dateAnalyse: now, status: 'IN_PROGRESS' } : prev);
      showToast('Analyse commencée. Statut mis à jour : En cours.');
      setStartAnalyseConfirm(false);
    } catch {
      showToast('Impossible de démarrer l\'analyse.', 'error');
      setStartAnalyseConfirm(false);
    } finally {
      setAnalyseBusy(false);
    }
  };

  // Open Platform Report Modal for specific platform item
  const openReportModalForPlatform = (item: any) => {
    const platform = item.platform;
    if (!platform) return;

    const links = item.contentUrl ? [item.contentUrl] : [];
    const screenshotIds = (item.screenshots ?? []).map((s: any) => s.id);

    setReportTargetPlatform(platform);
    setReportTargetItem(item);
    setReportForm({
      platformId: String(platform.id),
      emailTo: platform.email ?? '',
      emailSubject: `Demande de retrait de contenu — Signalement #${reference}`,
      emailBody: `Madame, Monsieur,\n\nNous vous contactons concernant un contenu signalé sur votre plateforme ${platform.name}.\n\nMerci de bien vouloir procéder à son retrait dans les plus brefs délais.\n\nCordialement,\nL'équipe EMC Helpline`,
      selectedScreenshotUrls: [],
    });
    setSelectedReportLinks(links);
    setSelectedReportScreenshotIds(screenshotIds);
    setReportError(null);
    setReportOpen(true);
  };

  const handleCreateReport = async () => {
    if (!signalement || !reportTargetPlatform) return;
    if (!reportForm.emailSubject.trim() || !reportForm.emailBody.trim()) {
      setReportError('Veuillez remplir l\'objet et le message du rapport.');
      return;
    }

    const selectedScreenshotUrls = (reportTargetItem?.screenshots ?? [])
      .filter((s: any) => selectedReportScreenshotIds.includes(s.id))
      .map((s: any) => s.imageUrl)
      .filter(Boolean);

    try {
      setReportBusy(true);
      setReportError(null);
      await PlatformReportsService.createPlatformReport({
        signalementId: signalement.id,
        platformId: reportTargetPlatform.id,
        emailTo: reportTargetPlatform.email ?? reportForm.emailTo,
        emailSubject: reportForm.emailSubject.trim(),
        emailBody: reportForm.emailBody.trim(),
        selectedScreenshotUrls,
        selectedLinks: selectedReportLinks,
      });
      await fetchSignalement();
      showToast(`Rapport envoyé avec succès à ${reportTargetPlatform.name}.`);
      setReportOpen(false);
      setReportTargetPlatform(null);
      setReportTargetItem(null);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'La création du rapport a échoué.';
      setReportError(msg);
    } finally {
      setReportBusy(false);
    }
  };

  const handlePrint = () => window.print();

  const handlePdfExport = async () => {
    if (!signalement) return;
    try {
      setPdfBusy(true);
      await generateSignalementPDF(signalement);
      showToast('PDF généré avec succès.');
    } catch (e) {
      console.error(e);
      showToast('La génération du PDF a échoué.', 'error');
    } finally {
      setPdfBusy(false);
    }
  };

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
            <Link to="/dashboard/signalements" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-emc-border dark:text-emc-primary dark:hover:bg-emc-elevated">
              Retour aux signalements
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveOrgProcessing = async () => {
    if (!signalement || !user?.organizationId) return;
    try {
      setOrgSaving(true);
      await AssignmentsService.updateAssignment(
        signalement.id,
        user.organizationId,
        {
          status: orgStatus as any,
          notes: orgNotes || null,
          reportActions: orgReportActions || null,
          reportObservations: orgReportObservations || null,
          reportResult: orgReportResult || null,
          reportRecommendations: orgReportRecommendations || null,
        }
      );
      await fetchSignalement();
      showToast("Traitement de l'organisation mis à jour avec succès.");
    } catch (err: any) {
      const msg = err.response?.data?.message || "La mise à jour a échoué.";
      showToast(msg, "error");
    } finally {
      setOrgSaving(false);
    }
  };

  const titulaireValue = signalement.titulaire === 'MOI_MEME' ? 'Oui' : signalement.titulaire === 'AUTRE_PERSONNE' ? 'Non' : 'Non';
  const accompaniments = (signalement.accompaniments ?? []).map((entry) => entry.type).filter(Boolean);
  const associatedOrganizations = (signalement.assignedTo ?? [])
    .map((assignment) => assignment.organization)
    .filter((organization): organization is Organization => Boolean(organization));
  const availableOrganizations = organizations.filter(
    (organization) => !associatedOrganizations.some((assigned) => assigned.id === organization.id),
  );

  // ── Dedicated Organization User View ──────────────────────────────────────────
  if (isOrgUser) {
    const orgAssignment = signalement.assignedTo?.[0];

    return (
      <>
        <div className="mx-auto max-w-[1400px] space-y-6 p-3 sm:p-5 lg:p-6">
        {toast && (
          <div
            className={`fixed right-4 top-4 z-50 rounded-xl border px-4 py-2.5 text-sm font-medium shadow-lg transition-all ${
              toastType === 'error'
                ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300'
            }`}
          >
            {toast}
          </div>
        )}

        {/* Back button & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/dashboard/signalements"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-emc-border dark:bg-emc-surface dark:text-emc-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour aux dossiers</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 dark:border-emc-border dark:bg-emc-surface dark:text-emc-primary hover:bg-slate-50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer</span>
            </button>
            <button
              type="button"
              onClick={handlePdfExport}
              disabled={pdfBusy}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {pdfBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>{pdfBusy ? 'Génération...' : 'Télécharger PDF'}</span>
            </button>
          </div>
        </div>

        {/* Hero Banner for Organization */}
        <div className="rounded-3xl border border-blue-200/80 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white p-6 shadow-sm dark:border-emc-border dark:from-emc-surface dark:to-emc-elevated">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-600/10 text-blue-700 dark:text-blue-300 border border-blue-600/20">
                  Dossier transmis à votre organisation
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-emc-primary">
                {reference}
              </h1>
              <p className="text-xs text-slate-500 dark:text-emc-secondary mt-1">
                Reçu par l'organisation le : <strong className="text-slate-800 dark:text-emc-primary">{formatDate(orgAssignment?.createdAt || signalement.createdAt)}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Statut du dossier</span>
                {orgStatus === 'IN_PROGRESS' ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">Traitement en cours</span>
                ) : orgStatus === 'COMPLETED' ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Traitement terminé</span>
                ) : orgStatus === 'CLOSED' ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">Dossier clôturé</span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">En attente de traitement</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Progression du dossier (Timeline Organisation : 4 étapes) ── */}
        {(() => {
          const orgTimelineSteps = [
            {
              key: 'affectation',
              label: 'AFFECTATION',
              date: orgAssignment?.createdAt || signalement.createdAt,
              done: true,
              current: false,
            },
            {
              key: 'analyse',
              label: 'ANALYSE',
              date: orgAssignment?.processedAt || (orgStatus !== 'ON_HOLD' ? orgAssignment?.updatedAt : null),
              done: orgStatus === 'IN_PROGRESS' || orgStatus === 'COMPLETED' || orgStatus === 'CLOSED' || Boolean(orgAssignment?.processedAt),
              current: orgStatus === 'ON_HOLD',
            },
            {
              key: 'fin_traitement',
              label: 'FIN DU TRAITEMENT',
              date: orgAssignment?.reportUpdatedAt || (orgStatus === 'COMPLETED' || orgStatus === 'CLOSED' ? orgAssignment?.updatedAt : null),
              done: orgStatus === 'COMPLETED' || orgStatus === 'CLOSED',
              current: orgStatus === 'IN_PROGRESS',
            },
            {
              key: 'cloture',
              label: 'CLÔTURE',
              date: orgAssignment?.closedAt || (orgStatus === 'CLOSED' ? orgAssignment?.updatedAt : null),
              done: orgStatus === 'CLOSED',
              current: orgStatus === 'COMPLETED',
            },
          ];

          return (
            <section className="print-card rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs dark:border-emc-border dark:bg-emc-surface">
              <div className="mb-6 border-b border-slate-200/80 pb-4 dark:border-emc-border">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
                    <Clock3 className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-emc-primary">Progression du dossier</h2>
                    <p className="text-xs text-slate-500 dark:text-emc-secondary">Parcours de traitement par votre organisation</p>
                  </div>
                </div>
              </div>

              <div className="relative py-2">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4 md:gap-0">
                  {orgTimelineSteps.map((step, idx) => {
                    const isLast = idx === orgTimelineSteps.length - 1;
                    const nextStep = orgTimelineSteps[idx + 1];

                    return (
                      <div key={step.key} className="relative flex flex-col md:items-center text-left md:text-center">
                        {/* Connecting Line for Desktop */}
                        {!isLast && (
                          <div
                            className={`hidden md:block absolute top-5 left-[50%] right-[-50%] h-0.5 z-0 transition-colors ${
                              step.done && nextStep?.done
                                ? 'bg-emerald-500 dark:bg-emerald-500'
                                : step.done && nextStep?.current
                                ? 'bg-gradient-to-r from-emerald-500 to-blue-500'
                                : 'bg-slate-200 dark:bg-emc-border'
                            }`}
                          />
                        )}

                        {/* Step Content & Icon */}
                        <div className="relative z-10 flex items-center gap-3 md:flex-col md:gap-2.5">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all ${
                              step.done
                                ? 'bg-emerald-500 text-white shadow-sm ring-4 ring-emerald-500/15'
                                : step.current
                                ? 'bg-blue-600 text-white ring-4 ring-blue-500/25'
                                : 'bg-slate-100 text-slate-400 border border-slate-200 dark:bg-emc-elevated dark:border-emc-border dark:text-emc-muted-fg'
                            }`}
                          >
                            {step.done ? (
                              <Check className="h-5 w-5 stroke-[3]" />
                            ) : step.current ? (
                              <Clock className="h-4 w-4" />
                            ) : (
                              <span className="text-xs font-bold">{idx + 1}</span>
                            )}
                          </div>

                          <div>
                            <p
                              className={`text-xs font-extrabold uppercase tracking-wider ${
                                step.done
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : step.current
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-slate-400 dark:text-emc-secondary'
                              }`}
                            >
                              {step.label}
                            </p>
                            <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-emc-secondary">
                              {step.done ? formatDate(step.date) : '—'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })()}

        {/* 1. Informations sur la victime & Informations du signalement */}
        <div className="grid gap-6 xl:grid-cols-[1.05fr_1.2fr]">
          {/* Victim Card */}
          <section className="print-card rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs dark:border-emc-border dark:bg-emc-surface">
            <div className="mb-5 flex items-center justify-between border-b border-slate-200/80 pb-4 dark:border-emc-border">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300">
                  <User className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-emc-primary">Informations sur la victime</h2>
                  <p className="text-xs text-slate-500 dark:text-emc-secondary">Données d&apos;identité et de contact</p>
                </div>
              </div>
            </div>

            <dl className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-slate-50/80 px-3.5 py-2.5 dark:bg-emc-elevated/40">
                <dt className="font-semibold text-slate-500 dark:text-emc-secondary">Nom complet</dt>
                <dd className="font-bold text-slate-900 dark:text-emc-primary">{displayValue([signalement.victim?.firstName, signalement.victim?.lastName].filter(Boolean).join(' '))}</dd>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50/80 px-3.5 py-2.5 dark:bg-emc-elevated/40">
                <dt className="font-semibold text-slate-500 dark:text-emc-secondary">Email</dt>
                <dd className="break-all font-bold text-slate-900 dark:text-emc-primary">{displayValue(signalement.victim?.email)}</dd>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50/80 px-3.5 py-2.5 dark:bg-emc-elevated/40">
                <dt className="font-semibold text-slate-500 dark:text-emc-secondary">Téléphone</dt>
                <dd className="break-all font-bold text-slate-900 dark:text-emc-primary">{displayValue(signalement.victim?.telephone)}</dd>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50/80 px-3.5 py-2.5 dark:bg-emc-elevated/40">
                <dt className="font-semibold text-slate-500 dark:text-emc-secondary">Ville</dt>
                <dd className="font-bold text-slate-900 dark:text-emc-primary">{displayValue(signalement.victim?.city)}</dd>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50/80 px-3.5 py-2.5 dark:bg-emc-elevated/40">
                <dt className="font-semibold text-slate-500 dark:text-emc-secondary">Sexe</dt>
                <dd className="font-bold text-slate-900 dark:text-emc-primary">{signalement.victim?.sex === 'MALE' ? 'Homme' : signalement.victim?.sex === 'FEMALE' ? 'Femme' : '—'}</dd>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50/80 px-3.5 py-2.5 dark:bg-emc-elevated/40">
                <dt className="font-semibold text-slate-500 dark:text-emc-secondary">Tranche d&apos;âge</dt>
                <dd className="font-bold text-slate-900 dark:text-emc-primary">
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

            <div className="mt-5 rounded-2xl border border-amber-200/90 bg-amber-50/90 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-800 dark:text-amber-300">Référence victime</p>
                  <p className="mt-1 truncate font-mono text-base font-extrabold text-amber-950 dark:text-amber-200">{reference}</p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyReference}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-amber-300/80 bg-white text-amber-800 shadow-2xs transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                  aria-label="Copier la référence"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>

          {/* Signalement Info Card */}
          <section className="print-card rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs dark:border-emc-border dark:bg-emc-surface">
            <div className="mb-5 flex items-center gap-3 border-b border-slate-200/80 pb-4 dark:border-emc-border">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
                <FileText className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-emc-primary">Informations du signalement</h2>
                <p className="text-xs text-slate-500 dark:text-emc-secondary">Description et type de cyberviolence</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-emc-muted-fg">Type de cyberviolence</p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-emc-primary">{displayValue(signalement.cyberViolence?.name || signalement.otherCyberViolence)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-emc-muted-fg">Accompagnement sollicité</p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-emc-primary">
                  {orgAssignment?.type === 'JUR' ? 'Juridique' : orgAssignment?.type === 'PSY' ? 'Psychique' : orgAssignment?.type || '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-emc-muted-fg">Émetteur</p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-emc-primary">{displayValue(signalement.issuer)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-emc-muted-fg">Motif de transmission EMC</p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-emc-primary">{displayValue(orgAssignment?.reason)}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-emc-muted-fg">Description des faits</p>
                <div className="mt-2 rounded-2xl border-l-4 border-blue-600 bg-slate-50 p-4 text-xs leading-relaxed text-slate-800 shadow-2xs dark:border-blue-500 dark:bg-emc-elevated dark:text-emc-primary whitespace-pre-wrap">
                  {displayValue(signalement.description)}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* 2. Contenus signalés */}
        <section className="print-card rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs dark:border-emc-border dark:bg-emc-surface">
          <div className="mb-5 flex items-center justify-between border-b border-slate-200/80 pb-4 dark:border-emc-border">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-emc-primary">Contenus signalés</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-emc-secondary">Plateformes et éléments associés à ce dossier</p>
            </div>
          </div>

          {signalement.reportedItems && signalement.reportedItems.length > 0 ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {signalement.reportedItems.map((item) => (
                <article key={item.id} className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5 shadow-2xs transition hover:border-slate-300 dark:border-emc-border dark:bg-emc-elevated/40">
                  <div>
                    <div className="flex items-start justify-between gap-3 border-b border-slate-200/60 pb-3 dark:border-emc-border/60">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xs shadow-2xs">
                          {(item.platform?.name ?? 'P')[0]?.toUpperCase()}
                        </span>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-emc-muted-fg">Plateforme</p>
                          <p className="text-base font-extrabold text-slate-900 dark:text-emc-primary">{item.platform?.name ?? 'Plateforme'}</p>
                        </div>
                      </div>
                      <span className="inline-flex w-fit rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                        {getContentTypeLabel(item.type)}
                      </span>
                    </div>

                    {item.description && (
                      <div className="mt-3.5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-emc-muted-fg">Description</p>
                        <p className="mt-1 rounded-xl border border-slate-200/80 bg-white p-3 text-xs leading-relaxed text-slate-800 dark:border-emc-border dark:bg-emc-surface dark:text-emc-primary">
                          {item.description}
                        </p>
                      </div>
                    )}

                    {item.contentUrl && (
                      <div className="mt-3.5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-emc-muted-fg">Lien du contenu</p>
                        <div className="mt-1.5 rounded-xl border border-slate-200/80 bg-white p-3 dark:border-emc-border dark:bg-emc-surface">
                          <a
                            href={item.contentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="break-all text-xs font-semibold text-blue-600 underline decoration-dotted underline-offset-4 hover:text-blue-700 dark:text-blue-400"
                          >
                            {item.contentUrl}
                          </a>
                          <div className="mt-2.5 flex flex-wrap gap-2">
                            <a
                              href={item.contentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                            >
                              Ouvrir le lien
                            </a>
                            <button
                              type="button"
                              onClick={async () => {
                                const copied = await copyToClipboard(item.contentUrl);
                                if (copied) showToast('Lien copié.');
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                            >
                              <Copy className="h-3.5 w-3.5" />
                              Copier
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Display Screenshots */}
                    {item.screenshots && item.screenshots.length > 0 && (
                      <div className="mt-3.5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-emc-muted-fg">
                          Captures d&apos;écran ({item.screenshots.length})
                        </p>
                        <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {item.screenshots.map((ss) => (
                            <button
                              key={ss.id}
                              type="button"
                              onClick={() => setPreviewImage(ss.imageUrl)}
                              className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs transition hover:border-blue-500 dark:border-emc-border dark:bg-emc-surface"
                            >
                              <img
                                src={ss.imageUrl}
                                alt="Capture d'écran"
                                className="h-20 w-full object-cover transition group-hover:scale-105"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-xs text-slate-500 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-secondary">
              Aucun contenu signalé n&apos;a été enregistré pour ce dossier.
            </div>
          )}
        </section>

        {/* 3. Espace Organisation (at the bottom) */}
        <section className="print-card rounded-3xl border-2 border-blue-500/30 bg-white p-6 shadow-sm dark:border-blue-500/30 dark:bg-emc-surface">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-emc-border">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white font-extrabold shadow-sm">
                <Building2 className="h-5 w-5" />
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Espace spécifique</span>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-emc-primary">Espace Organisation</h2>
              </div>
            </div>
            <span className="text-xs text-slate-500 dark:text-emc-secondary">
              Dernière mise à jour : <strong className="text-slate-800 dark:text-emc-primary">{formatDate(orgAssignment?.updatedAt || orgAssignment?.createdAt)}</strong>
            </span>
          </div>

          <div className="space-y-6">
            {/* Statut du traitement */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-emc-primary mb-1.5">
                Statut du traitement <span className="text-rose-500">*</span>
              </label>
              <select
                value={orgStatus}
                onChange={(e) => setOrgStatus(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border text-slate-900 dark:text-emc-primary focus:ring-2 focus:ring-blue-500 outline-none transition"
              >
                <option value="ON_HOLD">En attente de traitement</option>
                <option value="IN_PROGRESS">Traitement en cours</option>
                <option value="COMPLETED">Traitement terminé</option>
                <option value="CLOSED">Dossier clôturé</option>
              </select>
            </div>

            {/* Notes de traitement internes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-emc-primary mb-1.5">
                Notes de traitement internes à l'organisation
              </label>
              <textarea
                rows={3}
                value={orgNotes}
                onChange={(e) => setOrgNotes(e.target.value)}
                placeholder="Consignez ici vos notes internes de suivi et commentaires d'équipe..."
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border text-slate-900 dark:text-emc-primary placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>

            {/* Rapport d'intervention / Compte-rendu */}
            <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-emc-elevated/40 border border-slate-200 dark:border-emc-border space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 dark:border-emc-border">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800 dark:text-emc-primary uppercase tracking-wider">
                  Compte rendu d'intervention / Rapport d'accompagnement
                </h3>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-emc-secondary mb-1">
                  Actions réalisées
                </label>
                <textarea
                  rows={2}
                  value={orgReportActions}
                  onChange={(e) => setOrgReportActions(e.target.value)}
                  placeholder="Accompagnements juridiques, démarches psychologiques ou techniques entreprises..."
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-emc-surface border border-slate-200 dark:border-emc-border text-slate-900 dark:text-emc-primary outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-emc-secondary mb-1">
                  Observations
                </label>
                <textarea
                  rows={2}
                  value={orgReportObservations}
                  onChange={(e) => setOrgReportObservations(e.target.value)}
                  placeholder="Observations sur la situation de la victime, difficultés rencontrées..."
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-emc-surface border border-slate-200 dark:border-emc-border text-slate-900 dark:text-emc-primary outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-emc-secondary mb-1">
                    Résultat
                  </label>
                  <textarea
                    rows={2}
                    value={orgReportResult}
                    onChange={(e) => setOrgReportResult(e.target.value)}
                    placeholder="Résultat de l'intervention..."
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-emc-surface border border-slate-200 dark:border-emc-border text-slate-900 dark:text-emc-primary outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-emc-secondary mb-1">
                    Recommandations
                  </label>
                  <textarea
                    rows={2}
                    value={orgReportRecommendations}
                    onChange={(e) => setOrgReportRecommendations(e.target.value)}
                    placeholder="Suivi préconisé ou recommandations..."
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-emc-surface border border-slate-200 dark:border-emc-border text-slate-900 dark:text-emc-primary outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Action Bar for Compte rendu button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200/80 dark:border-emc-border">
              <div>
                {isOrgDirty ? (
                  <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Modifications non enregistrées — Cliquez sur &quot;Compte rendu&quot; pour sauvegarder.
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 dark:text-emc-muted-fg flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    Compte rendu à jour
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleSaveOrgProcessing}
                disabled={!isOrgDirty || orgSaving}
                className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  isOrgDirty && !orgSaving
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 cursor-pointer'
                    : 'bg-slate-200 dark:bg-emc-elevated text-slate-400 dark:text-emc-muted-fg opacity-60 cursor-not-allowed shadow-none'
                }`}
              >
                {orgSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                <span>{orgSaving ? 'Enregistrement...' : 'Compte rendu'}</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ====== IMAGE PREVIEW LIGHTBOX ====== */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white p-2 dark:bg-emc-surface" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-slate-900/60 p-2 text-white hover:bg-slate-900"
            >
              <X className="h-5 w-5" />
            </button>
            <img src={previewImage} alt="Aperçu capture d'écran" className="max-h-[85vh] w-auto max-w-full rounded-xl object-contain" />
          </div>
        </div>
      )}
    </>
  );
}

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
          <div
            className={`fixed right-4 top-4 z-50 rounded-xl border px-4 py-2.5 text-sm font-medium shadow-lg transition-all ${
              toastType === 'error'
                ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300'
            }`}
          >
            {toast}
          </div>
        )}

        {/* ====== HEADER HERO BANNER ====== */}
        <header className="print-card no-print rounded-3xl border border-slate-200/90 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-white p-5 shadow-sm dark:border-emc-border dark:from-emc-surface dark:via-emc-surface dark:to-emc-elevated sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link
                to="/dashboard/signalements"
                className="group inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-white dark:border-emc-border dark:bg-emc-surface dark:text-emc-primary dark:hover:bg-emc-elevated"
                aria-label="Retour aux signalements"
              >
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                <span>Signalements</span>
              </Link>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                    <ShieldAlert className="h-3 w-3" />
                    Dossier de signalement
                  </span>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-emc-primary sm:text-3xl font-mono">
                    {reference}
                  </h1>
                  <button
                    type="button"
                    onClick={handleCopyReference}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-600 shadow-2xs transition hover:bg-slate-50 hover:text-blue-600 dark:border-emc-border dark:bg-emc-surface dark:text-emc-primary dark:hover:bg-emc-elevated"
                    title="Copier la référence"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>

                {/* Editable Status + Priority Controls Bar */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {/* Status Select */}
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-1.5 shadow-2xs dark:border-emc-border dark:bg-emc-surface">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-emc-muted-fg">Statut</span>
                    <div className="relative">
                      <select
                        id="signalement-status-select"
                        value={signalement.status}
                        onChange={(e) => handleStatusSelectChange(e.target.value)}
                        disabled={statusBusy}
                        className={`appearance-none rounded-xl border pr-7 pl-3 py-1 text-xs font-bold shadow-2xs outline-none transition cursor-pointer disabled:opacity-60 ${
                          signalement.status === 'PENDING'
                            ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-300'
                            : signalement.status === 'IN_PROGRESS'
                            ? 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700/50 dark:bg-blue-950/40 dark:text-blue-300'
                            : signalement.status === 'VALIDATED'
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700/50 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : signalement.status === 'REJECTED'
                            ? 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-700/50 dark:bg-rose-950/40 dark:text-rose-300'
                            : 'border-slate-300 bg-slate-100 text-slate-700 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-secondary'
                        }`}
                      >
                        <option value="PENDING">En attente</option>
                        <option value="IN_PROGRESS">En cours</option>
                        <option value="VALIDATED">Validé</option>
                        <option value="REJECTED">Rejeté</option>
                        <option value="CLOSED">Clôturé</option>
                      </select>
                      <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                        <ChevronDown className="h-3 w-3 opacity-60" />
                      </span>
                    </div>
                  </div>

                  {/* Priority Select */}
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-1.5 shadow-2xs dark:border-emc-border dark:bg-emc-surface">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-emc-muted-fg">Priorité</span>
                    <div className="relative">
                      <select
                        id="signalement-priority-select"
                        value={signalement.priority}
                        onChange={(e) => void handlePriorityChange(e.target.value)}
                        disabled={priorityBusy}
                        className={`appearance-none rounded-xl border pr-7 pl-3 py-1 text-xs font-bold shadow-2xs outline-none transition cursor-pointer disabled:opacity-60 ${
                          signalement.priority === 'URGENT'
                            ? 'border-red-300 bg-red-50 text-red-800 dark:border-red-700/50 dark:bg-red-950/40 dark:text-red-300'
                            : signalement.priority === 'HIGH'
                            ? 'border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-700/50 dark:bg-orange-950/40 dark:text-orange-300'
                            : 'border-slate-300 bg-slate-100 text-slate-700 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-secondary'
                        }`}
                      >
                        <option value="NORMAL">Normal</option>
                        <option value="HIGH">Élevée</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                      <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                        <ChevronDown className="h-3 w-3 opacity-60" />
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-2xs dark:border-emc-border dark:bg-emc-surface dark:text-emc-primary">
                    Titulaire : {titulaireValue}
                  </span>
                </div>

                {/* Rejection Reason Box */}
                {signalement.status === 'REJECTED' && rejectionReason && (
                  <div className="mt-3.5 rounded-2xl border border-rose-200/90 bg-rose-50/90 p-3.5 dark:border-rose-900/40 dark:bg-rose-950/30">
                    <div className="flex items-start gap-2.5">
                      <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-rose-900 dark:text-rose-300 uppercase tracking-wider">Motif du rejet</p>
                        <p className="mt-1 text-xs leading-relaxed text-rose-800 dark:text-rose-300">{rejectionReason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Analysis State Indicator / Action */}
                {!signalement.dateAnalyse ? (
                  <div className="mt-3.5">
                    <button
                      id="start-analysis-btn"
                      type="button"
                      onClick={() => setStartAnalyseConfirm(true)}
                      disabled={analyseBusy}
                      className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <PlayCircle className="h-4 w-4" />
                      {analyseBusy ? 'Démarrage...' : 'Commencer l\'analyse'}
                    </button>
                  </div>
                ) : (
                  <div className="mt-3.5 flex items-center gap-2 text-xs text-slate-600 dark:text-emc-secondary">
                    <FileSearch className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Analyse commencée le <strong className="font-semibold text-slate-900 dark:text-emc-primary">{formatDate(signalement.dateAnalyse)}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-emc-border dark:bg-emc-surface dark:text-emc-primary dark:hover:bg-emc-elevated"
              >
                <Printer className="h-4 w-4 text-slate-500" />
                Imprimer
              </button>
              <button
                type="button"
                onClick={handlePdfExport}
                disabled={pdfBusy}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-emc-border dark:bg-emc-surface dark:text-emc-primary dark:hover:bg-emc-elevated disabled:opacity-60"
              >
                {pdfBusy ? <Loader2 className="h-4 w-4 animate-spin text-slate-500" /> : <Download className="h-4 w-4 text-slate-500" />}
                {pdfBusy ? 'Génération...' : 'Télécharger PDF'}
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-3.5 text-xs text-slate-500 dark:border-emc-border dark:text-emc-secondary">
            <div className="flex flex-wrap items-center gap-4">
              <span>Reçu le <strong className="text-slate-800 dark:text-emc-primary">{formatDate(signalement.createdAt)}</strong></span>
              <span>•</span>
              <span>Émetteur : <strong className="text-slate-800 dark:text-emc-primary">{displayValue(signalement.issuer)}</strong></span>
            </div>
          </div>
        </header>

        {/* ====== KPI SUMMARY METRICS BAR ====== */}
        <section className="print-card rounded-3xl border border-slate-200/90 bg-white p-3 shadow-2xs dark:border-emc-border dark:bg-emc-surface">
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {[
              { label: 'Statut', icon: BadgeCheck, value: <StatusBadge status={signalement.status} size="sm" /> },
              { label: 'Priorité', icon: ShieldAlert, value: <PriorityBadge priority={signalement.priority} /> },
              { label: 'Titulaire', icon: UserRoundCheck, value: <span className="inline-flex rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">{titulaireValue}</span> },
              { label: 'Réception', icon: Clock3, value: <span className="text-xs font-bold text-slate-800 dark:text-emc-primary">{formatDate(signalement.createdAt)}</span> },
              { label: 'Analyse', icon: FileSearch, value: <span className="text-xs font-bold text-slate-800 dark:text-emc-primary">{formatDate(signalement.dateAnalyse)}</span> },
              { label: 'Approbation', icon: BadgeCheck, value: <span className="text-xs font-bold text-slate-800 dark:text-emc-primary">{(signalement.status === 'VALIDATED' || signalement.status === 'REJECTED') ? formatDate(signalement.dateApprobation) : '—'}</span> },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-3 shadow-2xs transition hover:border-slate-300 dark:border-emc-border/70 dark:bg-emc-elevated/40"
                >
                  <div className="flex items-center gap-2 text-slate-500 dark:text-emc-secondary">
                    <span className="flex h-6 w-6 items-center justify-center rounded-xl bg-white shadow-2xs dark:bg-emc-surface">
                      <Icon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    </span>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em]">{item.label}</p>
                  </div>
                  <div className="mt-2">{item.value}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ====== VICTIM & SIGNALEMENT INFO GRID ====== */}
        <div className="grid gap-6 xl:grid-cols-[1.05fr_1.2fr]">
          {/* Victim Card */}
          <section className="print-card rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs dark:border-emc-border dark:bg-emc-surface">
            <div className="mb-5 flex items-center justify-between border-b border-slate-200/80 pb-4 dark:border-emc-border">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300">
                  <User className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-emc-primary">Informations sur la victime</h2>
                  <p className="text-xs text-slate-500 dark:text-emc-secondary">Données d&apos;identité et de contact</p>
                </div>
              </div>
            </div>

            <dl className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-slate-50/80 px-3.5 py-2.5 dark:bg-emc-elevated/40">
                <dt className="font-semibold text-slate-500 dark:text-emc-secondary">Nom complet</dt>
                <dd className="font-bold text-slate-900 dark:text-emc-primary">{displayValue([signalement.victim?.firstName, signalement.victim?.lastName].filter(Boolean).join(' '))}</dd>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50/80 px-3.5 py-2.5 dark:bg-emc-elevated/40">
                <dt className="font-semibold text-slate-500 dark:text-emc-secondary">Email</dt>
                <dd className="break-all font-bold text-slate-900 dark:text-emc-primary">{displayValue(signalement.victim?.email)}</dd>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50/80 px-3.5 py-2.5 dark:bg-emc-elevated/40">
                <dt className="font-semibold text-slate-500 dark:text-emc-secondary">Téléphone</dt>
                <dd className="break-all font-bold text-slate-900 dark:text-emc-primary">{displayValue(signalement.victim?.telephone)}</dd>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50/80 px-3.5 py-2.5 dark:bg-emc-elevated/40">
                <dt className="font-semibold text-slate-500 dark:text-emc-secondary">Ville</dt>
                <dd className="font-bold text-slate-900 dark:text-emc-primary">{displayValue(signalement.victim?.city)}</dd>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50/80 px-3.5 py-2.5 dark:bg-emc-elevated/40">
                <dt className="font-semibold text-slate-500 dark:text-emc-secondary">Sexe</dt>
                <dd className="font-bold text-slate-900 dark:text-emc-primary">{signalement.victim?.sex === 'MALE' ? 'Homme' : signalement.victim?.sex === 'FEMALE' ? 'Femme' : '—'}</dd>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50/80 px-3.5 py-2.5 dark:bg-emc-elevated/40">
                <dt className="font-semibold text-slate-500 dark:text-emc-secondary">Tranche d&apos;âge</dt>
                <dd className="font-bold text-slate-900 dark:text-emc-primary">
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

            <div className="mt-5 rounded-2xl border border-amber-200/90 bg-amber-50/90 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-800 dark:text-amber-300">Référence victime</p>
                  <p className="mt-1 truncate font-mono text-base font-extrabold text-amber-950 dark:text-amber-200">{reference}</p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyReference}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-amber-300/80 bg-white text-amber-800 shadow-2xs transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                  aria-label="Copier la référence"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>

          {/* Signalement Info Card */}
          <section className="print-card rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs dark:border-emc-border dark:bg-emc-surface">
            <div className="mb-5 flex items-center gap-3 border-b border-slate-200/80 pb-4 dark:border-emc-border">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
                <FileText className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-emc-primary">Informations du signalement</h2>
                <p className="text-xs text-slate-500 dark:text-emc-secondary">Description et type de cyberviolence</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-emc-muted-fg">Type de cyberviolence</p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-emc-primary">{displayValue(signalement.cyberViolence?.name || signalement.otherCyberViolence)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-emc-muted-fg">Autre type</p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-emc-primary">{displayValue(signalement.otherCyberViolence)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-emc-muted-fg">Émetteur</p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-emc-primary">{displayValue(signalement.issuer)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-emc-muted-fg">Titulaire</p>
                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-emc-primary">{titulaireValue}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-emc-muted-fg">Description</p>
                <div className="mt-2 rounded-2xl border-l-4 border-blue-600 bg-slate-50 p-4 text-xs leading-relaxed text-slate-800 shadow-2xs dark:border-blue-500 dark:bg-emc-elevated dark:text-emc-primary">
                  {displayValue(signalement.description)}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-emc-muted-fg">Accompagnement</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(accompaniments.length > 0 ? accompaniments : ['SUP']).map((type) => (
                    <span key={type} className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-800 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-emc-muted-fg">Approbation</p>
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
            </div>
          </section>
        </div>

        {/* ====== REPORTED CONTENT SECTION ====== */}
        <section className="print-card rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs dark:border-emc-border dark:bg-emc-surface">
          <div className="mb-5 flex items-center justify-between border-b border-slate-200/80 pb-4 dark:border-emc-border">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-emc-primary">Contenus signalés</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-emc-secondary">Plateformes et contenus associés à ce dossier</p>
            </div>
          </div>

          {signalement.reportedItems && signalement.reportedItems.length > 0 ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {signalement.reportedItems.map((item) => {
                const platformReport = signalement.platforms?.find(
                  (pr) => pr.platformId === item.platformId
                );
                return (
                  <article key={item.id} className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5 shadow-2xs transition hover:border-slate-300 dark:border-emc-border dark:bg-emc-elevated/40">
                    <div>
                      <div className="flex items-start justify-between gap-3 border-b border-slate-200/60 pb-3 dark:border-emc-border/60">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xs shadow-2xs">
                            {(item.platform?.name ?? 'P')[0]?.toUpperCase()}
                          </span>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-emc-muted-fg">Plateforme</p>
                            <p className="text-base font-extrabold text-slate-900 dark:text-emc-primary">{item.platform?.name ?? 'Plateforme'}</p>
                          </div>
                        </div>
                        <span className="inline-flex w-fit rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                          {getContentTypeLabel(item.type)}
                        </span>
                      </div>

                      {item.description && (
                        <div className="mt-3.5">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-emc-muted-fg">Description</p>
                          <p className="mt-1 rounded-xl border border-slate-200/80 bg-white p-3 text-xs leading-relaxed text-slate-800 dark:border-emc-border dark:bg-emc-surface dark:text-emc-primary">
                            {item.description}
                          </p>
                        </div>
                      )}

                      {item.contentUrl && (
                        <div className="mt-3.5">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-emc-muted-fg">Lien du contenu</p>
                          <div className="mt-1.5 rounded-xl border border-slate-200/80 bg-white p-3 dark:border-emc-border dark:bg-emc-surface">
                            <a
                              href={item.contentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="break-all text-xs font-semibold text-blue-600 underline decoration-dotted underline-offset-4 hover:text-blue-700 dark:text-blue-400"
                            >
                              {item.contentUrl}
                            </a>
                            <div className="mt-2.5 flex flex-wrap gap-2">
                              <a
                                href={item.contentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                              >
                                Ouvrir le lien
                              </a>
                              <button
                                type="button"
                                onClick={async () => {
                                  const copied = await copyToClipboard(item.contentUrl);
                                  if (copied) showToast('Lien copié.');
                                }}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                              >
                                <Copy className="h-3.5 w-3.5" />
                                Copier
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Display Screenshots */}
                      {item.screenshots && item.screenshots.length > 0 && (
                        <div className="mt-3.5">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-emc-muted-fg">
                            Captures d&apos;écran ({item.screenshots.length})
                          </p>
                          <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {item.screenshots.map((ss) => (
                              <button
                                key={ss.id}
                                type="button"
                                onClick={() => setPreviewImage(ss.imageUrl)}
                                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs transition hover:border-blue-500 dark:border-emc-border dark:bg-emc-surface"
                              >
                                <img
                                  src={ss.imageUrl}
                                  alt="Capture d'écran"
                                  className="h-20 w-full object-cover transition group-hover:scale-105"
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Platform Action Bar */}
                    <div className="mt-4 flex items-center justify-between border-t border-slate-200/80 pt-3.5 dark:border-emc-border/80">
                      <div>
                        {platformReport ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 dark:text-emc-secondary">Rapport :</span>
                            <StatusBadge status={platformReport.status} size="sm" />
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-slate-400 dark:text-emc-muted-fg">Aucun rapport envoyé</span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => openReportModalForPlatform(item)}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-blue-700"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Créer un rapport
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-xs text-slate-500 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-secondary">
              Aucun contenu signalé n&apos;a été enregistré pour ce dossier.
            </div>
          )}
        </section>

        {/* ====== PROCESS TIMELINE CARD ====== */}
        <section className="print-card rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs dark:border-emc-border dark:bg-emc-surface">
          <div className="mb-5 flex items-center justify-between border-b border-slate-200/80 pb-4 dark:border-emc-border">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
                <Building2 className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-emc-primary">Traitement du signalement</h2>
                <p className="text-xs text-slate-500 dark:text-emc-secondary">Cycle de vie et affectations</p>
              </div>
            </div>
          </div>

          {/* Process Timeline */}
          {(() => {
            const isRejected = signalement.status === 'REJECTED';
            const isClosed = signalement.status === 'CLOSED';
            const isValidated = signalement.status === 'VALIDATED' || isClosed;
            const hasAnalyse = Boolean(signalement.dateAnalyse);

            const stepReception = { done: true, current: false };
            const stepAnalyse = { done: hasAnalyse, current: hasAnalyse && signalement.status === 'IN_PROGRESS' && !isValidated && !isRejected };
            const stepValidation = { done: isValidated || isRejected, current: false, rejected: isRejected };
            const stepClosure = { done: isClosed, current: false };

            type StepDef = { key: string; label: string; date: string | null | undefined; done: boolean; current: boolean; rejected?: boolean; hidden?: boolean };

            const steps: StepDef[] = [
              { key: 'reception', label: 'Réception', date: signalement.createdAt, done: stepReception.done, current: stepReception.current },
              { key: 'analyse', label: 'Analyse', date: signalement.dateAnalyse, done: stepAnalyse.done, current: stepAnalyse.current },
              {
                key: 'validation',
                label: isRejected ? 'Rejeté' : 'Validé',
                date: isRejected || isValidated ? (signalement.dateApprobation ?? signalement.updatedAt) : null,
                done: stepValidation.done,
                current: false,
                rejected: stepValidation.rejected,
              },
              {
                key: 'closure',
                label: 'Clôturé',
                date: isClosed ? signalement.updatedAt : null,
                done: stepClosure.done,
                current: stepClosure.current,
                hidden: isRejected && !isClosed,
              },
            ];

            const visibleSteps = steps.filter((s) => !s.hidden);

            return (
              <div className="mb-5 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 shadow-2xs dark:border-emc-border dark:bg-emc-elevated/30">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-emc-muted-fg">Progression du dossier</p>
                <div className="flex items-start justify-between">
                  {visibleSteps.map((step, idx) => {
                    const isLast = idx === visibleSteps.length - 1;
                    return (
                      <div key={step.key} className="flex flex-1 items-start">
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border-2 transition-all shadow-2xs ${
                              step.rejected
                                ? 'border-rose-400 bg-rose-50 text-rose-600 dark:border-rose-500 dark:bg-rose-950/40 dark:text-rose-300'
                                : step.done
                                ? 'border-emerald-400 bg-emerald-50 text-emerald-600 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : step.current
                                ? 'border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-300'
                                : 'border-slate-300 bg-white text-slate-400 dark:border-emc-border dark:bg-emc-surface dark:text-emc-secondary'
                            }`}
                          >
                            {step.rejected ? (
                              <X className="h-4 w-4" />
                            ) : step.done ? (
                              <Check className="h-4 w-4" />
                            ) : step.current ? (
                              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                            ) : (
                              <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                            )}
                          </div>
                        </div>

                        <div className="ml-2.5 min-w-0 flex-1 pb-1">
                          <p
                            className={`text-xs font-bold uppercase tracking-wider ${
                              step.rejected
                                ? 'text-rose-600 dark:text-rose-400'
                                : step.done
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : step.current
                                ? 'text-blue-700 dark:text-blue-400'
                                : 'text-slate-400 dark:text-emc-muted-fg'
                            }`}
                          >
                            {step.label}
                          </p>
                          <p className="mt-0.5 text-[10px] font-semibold text-slate-500 dark:text-emc-secondary">
                            {step.date ? formatDate(step.date) : '—'}
                          </p>
                        </div>

                        {!isLast && (
                          <div className="mt-3.5 flex-shrink-0 px-2">
                            <div
                              className={`h-0.5 w-6 sm:w-12 ${
                                step.done && !step.rejected
                                  ? 'bg-emerald-400 dark:bg-emerald-600'
                                  : step.rejected
                                  ? 'bg-rose-400 dark:bg-rose-600'
                                  : 'bg-slate-200 dark:bg-emc-border'
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          <div className="flex flex-wrap items-center gap-3 pt-1">
          </div>
        </section>

        {/* ====== AFFECTATIONS SECTION ====== */}
        <section className="print-card rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs dark:border-emc-border dark:bg-emc-surface">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4 dark:border-emc-border">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-emc-primary">Affectations</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-emc-secondary">Organisations actuellement affectées à ce dossier</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setAssignOrgId(null);
                setAssignMotif('');
                setAssignError(null);
                setAssignModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 transition"
            >
              <Building2 className="h-3.5 w-3.5" />
              + Affecter une organisation
            </button>
          </div>

          {signalement.assignedTo && signalement.assignedTo.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {signalement.assignedTo.map((assignment) => {
                const org = assignment.organization;
                const hasReport = Boolean(
                  assignment.reportActions ||
                  assignment.reportObservations ||
                  assignment.reportResult ||
                  assignment.reportRecommendations
                );

                return (
                  <div
                    key={`${assignment.signalementId}-${assignment.organizationId}-${assignment.type}`}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5 shadow-2xs transition hover:border-blue-400 dark:border-emc-border dark:bg-emc-elevated/40"
                  >
                    <div>
                      {/* Top Header of Card */}
                      <div className="flex items-start justify-between gap-3 border-b border-slate-200/70 pb-3 dark:border-emc-border/70">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300 font-extrabold text-sm">
                            {(org?.name ?? 'O')[0]?.toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-slate-900 dark:text-emc-primary text-sm">
                              {org?.name ?? 'Organisation'}
                            </h3>
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-emc-secondary">
                              {org?.category === 'JURIDIQUE' ? 'Catégorie : Juridique' : org?.category === 'PSYCHIQUE' ? 'Catégorie : Psychique' : org?.category ?? ''}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className={accompanimentBadgeStyles[assignment.type] || 'inline-flex rounded-full bg-slate-500/10 px-2.5 py-0.5 text-[10px] font-bold text-slate-700'}>
                            {assignment.type === 'JUR' ? 'Accompagnement Juridique' : assignment.type === 'PSY' ? 'Accompagnement Psychique' : assignment.type}
                          </span>
                          <StatusBadge status={assignment.status} size="sm" />
                        </div>
                      </div>

                      {/* Report Badge Indicator */}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rapport d&apos;intervention</span>
                        {hasReport ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <FileText className="w-3 h-3" /> Compte rendu disponible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Clock className="w-3 h-3" /> En attente de compte rendu
                          </span>
                        )}
                      </div>

                      {/* Key details grid */}
                      <dl className="mt-3.5 space-y-2 text-xs">
                        <div className="flex justify-between rounded-xl bg-white p-2.5 dark:bg-emc-surface border border-slate-100 dark:border-emc-border/60">
                          <dt className="text-slate-500 dark:text-emc-secondary font-medium">Affecté le</dt>
                          <dd className="font-bold text-slate-800 dark:text-emc-primary">{formatDate(assignment.createdAt)}</dd>
                        </div>
                        <div className="flex justify-between rounded-xl bg-white p-2.5 dark:bg-emc-surface border border-slate-100 dark:border-emc-border/60">
                          <dt className="text-slate-500 dark:text-emc-secondary font-medium">Dernière MaJ</dt>
                          <dd className="font-bold text-slate-800 dark:text-emc-primary">{formatDate(assignment.reportUpdatedAt || assignment.updatedAt)}</dd>
                        </div>
                        {assignment.reason && (
                          <div className="rounded-xl bg-white p-2.5 dark:bg-emc-surface border border-slate-100 dark:border-emc-border/60">
                            <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Motif EMC</dt>
                            <dd className="text-slate-700 dark:text-emc-primary truncate" title={assignment.reason}>
                              {assignment.reason}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-4 flex items-center justify-between border-t border-slate-200/70 pt-3 dark:border-emc-border/70">
                      <button
                        type="button"
                        onClick={() => setInspectAssignment(assignment)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-600/20 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspecter les notes & compte rendu</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCancelAssignmentTarget(assignment)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300 transition"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-8 text-center dark:border-emc-border dark:bg-emc-elevated/20">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-emc-primary">Aucune organisation affectée</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-emc-secondary">Ce signalement n&apos;est actuellement affecté à aucune organisation.</p>
              <button
                type="button"
                onClick={() => {
                  setAssignOrgId(null);
                  setAssignMotif('');
                  setAssignError(null);
                  setAssignModalOpen(true);
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 transition"
              >
                <Building2 className="h-3.5 w-3.5" />
                Affecter une organisation
              </button>
            </div>
          )}
        </section>

        <footer className="print-card no-print border-t border-slate-200 pt-4 text-center text-sm text-slate-500 dark:border-emc-border dark:text-emc-secondary">
          <div className="flex items-center justify-center gap-2">
            <img src={resolvedTheme === 'dark' ? logoDarkmode : logoLightmode} alt="EMC Helpline" className="h-7 w-auto object-contain" />
            <span className="font-semibold text-slate-700 dark:text-emc-primary">EMC HELPLINE</span>
          </div>
          <p className="mt-2">Plateforme de signalement des cyberviolences</p>
        </footer>
      </div>

      {/* ====== INSPECT ASSIGNMENT MODAL ====== */}
      {inspectAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-emc-border dark:bg-emc-surface space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200/80 pb-4 dark:border-emc-border">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white font-extrabold shadow-2xs">
                  {(inspectAssignment.organization?.name ?? 'O')[0]?.toUpperCase()}
                </span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Inspection du suivi organisation</span>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-emc-primary">
                    {inspectAssignment.organization?.name}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectAssignment(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:text-emc-secondary dark:hover:bg-emc-elevated"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Section A: Informations de l'affectation */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-emc-border dark:bg-emc-elevated/40 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-emc-primary uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Informations de l'affectation</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="rounded-xl bg-white p-2.5 dark:bg-emc-surface border border-slate-100 dark:border-emc-border">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Type d'accompagnement</span>
                  <span className="font-bold text-slate-800 dark:text-emc-primary">
                    {inspectAssignment.type === 'JUR' ? 'Juridique' : inspectAssignment.type === 'PSY' ? 'Psychique' : inspectAssignment.type}
                  </span>
                </div>
                <div className="rounded-xl bg-white p-2.5 dark:bg-emc-surface border border-slate-100 dark:border-emc-border">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Statut traitement</span>
                  <StatusBadge status={inspectAssignment.status} size="sm" />
                </div>
                <div className="rounded-xl bg-white p-2.5 dark:bg-emc-surface border border-slate-100 dark:border-emc-border">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Affecté le</span>
                  <span className="font-bold text-slate-800 dark:text-emc-primary">{formatDate(inspectAssignment.createdAt)}</span>
                </div>
                <div className="rounded-xl bg-white p-2.5 dark:bg-emc-surface border border-slate-100 dark:border-emc-border">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Dernière mise à jour</span>
                  <span className="font-bold text-slate-800 dark:text-emc-primary">{formatDate(inspectAssignment.reportUpdatedAt || inspectAssignment.updatedAt)}</span>
                </div>
              </div>

              {inspectAssignment.reason && (
                <div className="rounded-xl bg-white p-3 dark:bg-emc-surface border border-slate-100 dark:border-emc-border text-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Motif d'affectation transmis par l'EMC</span>
                  <p className="text-slate-700 dark:text-emc-primary leading-relaxed">{inspectAssignment.reason}</p>
                </div>
              )}
            </div>

            {/* Section B: Notes de l'organisation */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 dark:text-emc-primary uppercase tracking-wider flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-violet-600" />
                <span>Notes de l'organisation</span>
              </h4>

              {inspectAssignment.notes ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-emc-border dark:bg-emc-elevated text-xs leading-relaxed text-slate-800 dark:text-emc-primary whitespace-pre-wrap">
                  {inspectAssignment.notes}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-4 text-center text-xs text-slate-400 dark:border-emc-border dark:bg-emc-elevated/20 italic">
                  Aucune note enregistrée par l&apos;organisation.
                </div>
              )}
            </div>

            {/* Section C: Rapport / Compte rendu */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 dark:text-emc-primary uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Rapport / Compte rendu d'intervention</span>
                </h4>
                {(inspectAssignment.reportActions || inspectAssignment.reportObservations || inspectAssignment.reportResult || inspectAssignment.reportRecommendations) && (
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-emc-secondary">
                    Soumis le : {formatDate(inspectAssignment.reportUpdatedAt || inspectAssignment.updatedAt)}
                  </span>
                )}
              </div>

              {(inspectAssignment.reportActions || inspectAssignment.reportObservations || inspectAssignment.reportResult || inspectAssignment.reportRecommendations) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-emc-border dark:bg-emc-surface space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Actions réalisées</span>
                    <p className="text-slate-800 dark:text-emc-primary leading-relaxed whitespace-pre-wrap">
                      {displayValue(inspectAssignment.reportActions)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-emc-border dark:bg-emc-surface space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Observations</span>
                    <p className="text-slate-800 dark:text-emc-primary leading-relaxed whitespace-pre-wrap">
                      {displayValue(inspectAssignment.reportObservations)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-emc-border dark:bg-emc-surface space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Résultat</span>
                    <p className="text-slate-800 dark:text-emc-primary leading-relaxed whitespace-pre-wrap">
                      {displayValue(inspectAssignment.reportResult)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-emc-border dark:bg-emc-surface space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Recommandations</span>
                    <p className="text-slate-800 dark:text-emc-primary leading-relaxed whitespace-pre-wrap">
                      {displayValue(inspectAssignment.reportRecommendations)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-200/90 bg-amber-50/80 p-5 text-center dark:border-amber-900/40 dark:bg-amber-950/20">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h5 className="text-xs font-bold text-amber-900 dark:text-amber-200">Aucun compte rendu disponible.</h5>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                    L&apos;organisation n&apos;a pas encore rédigé ou soumis de compte rendu d&apos;intervention pour ce dossier.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-slate-200/80 pt-4 dark:border-emc-border">
              <button
                type="button"
                onClick={() => setInspectAssignment(null)}
                className="rounded-2xl bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-emc-elevated dark:text-emc-primary transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== STATUS CHANGE CONFIRMATION DIALOG ====== */}
      {confirmStatusChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-emc-border dark:bg-emc-surface">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-emc-muted-fg">Confirmation</p>
                <h3 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-emc-primary">Modifier le statut</h3>
              </div>
              <button
                type="button"
                onClick={() => setConfirmStatusChange(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:text-emc-secondary dark:hover:bg-emc-elevated"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 rounded-2xl border border-amber-200/90 bg-amber-50/80 p-4 dark:border-amber-900/40 dark:bg-amber-950/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <div className="text-xs text-slate-800 dark:text-emc-primary leading-relaxed">
                  Voulez-vous modifier le statut de « <strong>{getStatusLabel(confirmStatusChange.from)}</strong> » vers « <strong>{getStatusLabel(confirmStatusChange.to)}</strong> » ?
                  {confirmStatusChange.from === 'REJECTED' && (
                    <p className="mt-2 text-xs font-bold text-rose-600 dark:text-rose-400">
                      Le motif de rejet précédent sera supprimé.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmStatusChange(null)}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-emc-border dark:text-emc-primary dark:hover:bg-emc-elevated"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => void confirmStatusChangeHandler()}
                disabled={statusBusy}
                className="rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 disabled:opacity-60"
              >
                {statusBusy ? 'Mise à jour...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== START ANALYSIS CONFIRMATION DIALOG ====== */}
      {startAnalyseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-emc-border dark:bg-emc-surface">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-emc-muted-fg">Confirmation</p>
                <h3 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-emc-primary">Commencer l&apos;analyse</h3>
              </div>
              <button
                type="button"
                onClick={() => setStartAnalyseConfirm(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:text-emc-secondary dark:hover:bg-emc-elevated"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 rounded-2xl border border-blue-200/90 bg-blue-50/80 p-4 dark:border-blue-700/40 dark:bg-blue-950/30">
              <div className="flex items-start gap-3">
                <PlayCircle className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-xs text-slate-800 dark:text-emc-primary leading-relaxed">
                  <p>Démarrer l&apos;analyse enregistrera la <strong>date et heure actuelles</strong> comme date d&apos;analyse.</p>
                  <p className="mt-1 text-slate-500 dark:text-emc-secondary">Le statut sera automatiquement mis à jour en <strong>En cours</strong>.</p>
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setStartAnalyseConfirm(false)}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-emc-border dark:text-emc-primary dark:hover:bg-emc-elevated"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => void handleStartAnalysis()}
                disabled={analyseBusy}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 disabled:opacity-60"
              >
                <PlayCircle className="h-4 w-4" />
                {analyseBusy ? 'Démarrage...' : 'Commencer l\'analyse'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== REDESIGNED PLATFORM REPORT MODAL ====== */}
      {reportOpen && reportTargetPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[1080px] rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-emc-border dark:bg-emc-surface">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-emc-border">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-emc-muted-fg">Rapport plateforme</p>
                <h3 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-emc-primary">
                  Créer un rapport — {reportTargetPlatform.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReportOpen(false);
                  setReportTargetPlatform(null);
                }}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:text-emc-secondary dark:hover:bg-emc-elevated"
                aria-label="Fermer la fenêtre de rapport"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
              {/* Form Side */}
              <div className="space-y-4">
                <div>
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-emc-muted-fg">
                    Plateforme
                  </span>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 dark:border-emc-border dark:bg-emc-elevated">
                    <span className="font-bold text-slate-900 dark:text-emc-primary">{reportTargetPlatform.name}</span>
                  </div>
                </div>

                <div>
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-emc-muted-fg">
                    Destinataire
                  </span>
                  <input
                    type="email"
                    value={reportTargetPlatform.email ?? reportForm.emailTo}
                    readOnly
                    className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs font-semibold text-slate-600 cursor-not-allowed outline-none dark:border-emc-border dark:bg-emc-elevated dark:text-emc-secondary"
                  />
                </div>

                <div>
                  <label htmlFor="report-subject" className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-emc-muted-fg">
                    Objet <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="report-subject"
                    type="text"
                    value={reportForm.emailSubject}
                    onChange={(event) => setReportForm((prev) => ({ ...prev, emailSubject: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-900 outline-none transition focus:border-blue-500 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                    placeholder="Demande de retrait de contenu"
                  />
                </div>

                <div>
                  <label htmlFor="report-body" className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-emc-muted-fg">
                    Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="report-body"
                    rows={6}
                    value={reportForm.emailBody}
                    onChange={(event) => setReportForm((prev) => ({ ...prev, emailBody: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-900 outline-none transition focus:border-blue-500 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                    placeholder="Rédigez le message de demande de suppression..."
                  />
                </div>
              </div>

              {/* Selection Side */}
              <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-4 dark:border-emc-border dark:bg-emc-elevated/30">
                {/* Links selection */}
                {reportTargetItem?.contentUrl && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs dark:border-emc-border dark:bg-emc-surface">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-emc-muted-fg">
                      Lien du contenu
                    </p>
                    <label
                      className={`flex items-center gap-3 rounded-2xl border p-3 cursor-pointer transition ${
                        selectedReportLinks.includes(reportTargetItem.contentUrl)
                          ? 'border-blue-500 bg-blue-50/60 dark:border-blue-600/50 dark:bg-blue-950/20'
                          : 'border-slate-200 bg-slate-50 dark:border-emc-border dark:bg-emc-elevated'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedReportLinks.includes(reportTargetItem.contentUrl)}
                        onChange={() => {
                          const link = reportTargetItem.contentUrl;
                          setSelectedReportLinks((prev) =>
                            prev.includes(link) ? prev.filter((l) => l !== link) : [...prev, link]
                          );
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <Link2 className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                      <span className="break-all text-xs font-semibold text-slate-800 dark:text-emc-primary">
                        {reportTargetItem.contentUrl}
                      </span>
                    </label>
                  </div>
                )}

                {/* Screenshots selection */}
                {reportTargetItem?.screenshots && reportTargetItem.screenshots.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs dark:border-emc-border dark:bg-emc-surface">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-emc-muted-fg">
                      Captures d&apos;écran
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {reportTargetItem.screenshots.map((screenshot: any) => {
                        const isSelected = selectedReportScreenshotIds.includes(screenshot.id);
                        return (
                          <label
                            key={screenshot.id}
                            className={`group relative overflow-hidden rounded-2xl border cursor-pointer transition ${
                              isSelected
                                ? 'border-blue-500 ring-2 ring-blue-500/20 dark:border-blue-600'
                                : 'border-slate-200 bg-slate-50 dark:border-emc-border dark:bg-emc-elevated'
                            }`}
                          >
                            <div className="absolute left-2 top-2 z-10">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  setSelectedReportScreenshotIds((prev) =>
                                    prev.includes(screenshot.id)
                                      ? prev.filter((id) => id !== screenshot.id)
                                      : [...prev, screenshot.id]
                                  );
                                }}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                            </div>
                            <img
                              src={screenshot.imageUrl}
                              alt="Capture d'écran"
                              className="h-28 w-full object-cover transition group-hover:scale-105"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-3 text-xs text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300">
                  <span className="mr-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-200 text-[10px] font-bold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    i
                  </span>
                  Seuls les liens et captures sélectionnés seront inclus dans le rapport envoyé à {reportTargetPlatform.name}.
                </div>
              </div>
            </div>

            {reportError && (
              <p className="mt-4 text-xs font-semibold text-rose-600 dark:text-rose-400">{reportError}</p>
            )}

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-emc-border">
              <button
                type="button"
                onClick={() => {
                  setReportOpen(false);
                  setReportTargetPlatform(null);
                }}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-emc-border dark:text-emc-primary dark:hover:bg-emc-elevated"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => void handleCreateReport()}
                disabled={reportBusy}
                className="rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 disabled:opacity-60"
              >
                {reportBusy ? 'Envoi...' : 'Créer le rapport'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== IMAGE PREVIEW LIGHTBOX ====== */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white p-2 dark:bg-emc-surface" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-slate-900/60 p-2 text-white hover:bg-slate-900"
            >
              <X className="h-5 w-5" />
            </button>
            <img src={previewImage} alt="Aperçu capture d'écran" className="max-h-[85vh] w-auto max-w-full rounded-xl object-contain" />
          </div>
        </div>
      )}

      {/* ====== ASSIGN ORGANIZATION MODAL ====== */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-emc-border dark:bg-emc-surface">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-emc-border">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-emc-muted-fg">Affectation</p>
                <h3 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-emc-primary">Affecter une organisation</h3>
              </div>
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:text-emc-secondary dark:hover:bg-emc-elevated"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="assign-org-select" className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-emc-muted-fg">
                  Organisation <span className="text-rose-500">*</span>
                </label>
                <select
                  id="assign-org-select"
                  value={assignOrgId ?? ''}
                  onChange={(e) => setAssignOrgId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-900 outline-none transition focus:border-blue-500 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                >
                  <option value="">Sélectionner une organisation</option>
                  {availableOrganizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name} ({org.category === 'JURIDIQUE' ? 'Juridique' : 'Psychique'})
                    </option>
                  ))}
                </select>
              </div>

              {assignOrgId && (() => {
                const selectedOrg = organizations.find((o) => o.id === assignOrgId);
                if (!selectedOrg) return null;
                const categoryLabel = categoryLabels[selectedOrg.category] || selectedOrg.category;
                return (
                  <div>
                    <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-emc-muted-fg">
                      Type d&apos;accompagnement
                    </span>
                    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 p-3 dark:border-emc-border dark:bg-emc-elevated/60">
                      <span className={categoryBadgeStyles[selectedOrg.category] || 'inline-flex rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold text-blue-700'}>
                        {categoryLabel}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-emc-secondary">
                        (Déterminé automatiquement par la catégorie de l&apos;organisation)
                      </span>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label htmlFor="assign-motif" className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-emc-muted-fg">
                  Motif de l&apos;affectation <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="assign-motif"
                  value={assignMotif}
                  onChange={(e) => {
                    setAssignMotif(e.target.value);
                    if (assignError) setAssignError(null);
                  }}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-900 outline-none transition focus:border-blue-500 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                  placeholder="Indiquez le motif de cette affectation..."
                />
              </div>

              {assignError && <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">{assignError}</p>}
            </div>

            <div className="mt-5 flex justify-end gap-3 border-t border-slate-200/80 pt-4 dark:border-emc-border">
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-emc-border dark:text-emc-primary dark:hover:bg-emc-elevated"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmAssignment()}
                disabled={assignBusy}
                className="rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 disabled:opacity-60"
              >
                {assignBusy ? 'Affectation...' : 'Affecter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== CANCEL ASSIGNMENT CONFIRMATION MODAL ====== */}
      {cancelAssignmentTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-emc-border dark:bg-emc-surface">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-emc-border">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">Annulation</p>
                <h3 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-emc-primary">Annuler l&apos;affectation</h3>
              </div>
              <button
                type="button"
                onClick={() => setCancelAssignmentTarget(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:text-emc-secondary dark:hover:bg-emc-elevated"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-emc-secondary">
              Êtes-vous sûr de vouloir annuler l&apos;affectation de cette organisation ?
            </p>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-emc-border dark:bg-emc-elevated">
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <dt className="text-slate-500 dark:text-emc-secondary">Organisation</dt>
                  <dd className="font-bold text-slate-900 dark:text-emc-primary">{cancelAssignmentTarget.organization?.name ?? '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500 dark:text-emc-secondary">Accompagnement</dt>
                  <dd className="font-bold text-slate-900 dark:text-emc-primary">
                    {cancelAssignmentTarget.type === 'JUR' ? 'Juridique' : cancelAssignmentTarget.type === 'PSY' ? 'Psychique' : cancelAssignmentTarget.type}
                  </dd>
                </div>
                {cancelAssignmentTarget.reason && (
                  <div className="border-t border-slate-200 pt-2 dark:border-emc-border">
                    <dt className="text-slate-500 dark:text-emc-secondary">Motif d&apos;origine</dt>
                    <dd className="mt-1 text-slate-700 dark:text-emc-primary">{cancelAssignmentTarget.reason}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="mt-5 flex justify-end gap-3 border-t border-slate-200/80 pt-4 dark:border-emc-border">
              <button
                type="button"
                onClick={() => setCancelAssignmentTarget(null)}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-emc-border dark:text-emc-primary dark:hover:bg-emc-elevated"
              >
                Retour
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmCancelAssignment()}
                disabled={cancelAssignmentBusy}
                className="rounded-2xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-rose-700 disabled:opacity-60"
              >
                {cancelAssignmentBusy ? 'Annulation...' : 'Confirmer l\'annulation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====== REJECT CONFIRMATION MODAL ====== */}
      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-emc-border dark:bg-emc-surface">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-emc-border">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-emc-muted-fg">Confirmation</p>
                <h3 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-emc-primary">Rejeter le signalement</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRejectOpen(false);
                  setRejectReason('');
                  setRejectError(null);
                }}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:text-emc-secondary dark:hover:bg-emc-elevated"
                aria-label="Fermer la fenêtre de rejet"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-emc-secondary">
              Vous êtes sur le point de rejeter ce signalement. Merci de préciser le motif de rejet avant de confirmer.
            </p>

            <div className="mt-4">
              <label htmlFor="reject-reason" className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-emc-muted-fg">
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
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-900 outline-none ring-0 transition focus:border-blue-500 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                placeholder="Renseignez le motif du rejet..."
              />
              {rejectError && <p className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-400">{rejectError}</p>}
            </div>

            <div className="mt-5 flex justify-end gap-3 border-t border-slate-200/80 pt-4 dark:border-emc-border">
              <button
                type="button"
                onClick={() => {
                  setRejectOpen(false);
                  setRejectReason('');
                  setRejectError(null);
                }}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-emc-border dark:text-emc-primary dark:hover:bg-emc-elevated"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmRejection()}
                disabled={actionBusy}
                className="rounded-2xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-rose-700 disabled:opacity-60"
              >
                {actionBusy ? 'Enregistrement...' : 'Confirmer le rejet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SignalementDetailPage;

