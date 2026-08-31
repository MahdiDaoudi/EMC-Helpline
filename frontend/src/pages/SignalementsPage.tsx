import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Plus,
  Filter,
  ExternalLink,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  Loader2,
} from 'lucide-react';
import { SignalementsService } from '../services/signalements.service';
import type { GetSignalementsParams } from '../services/signalements.service';
import type { Signalement } from '../types';
import { generateSignalementsListPDF } from '../utils/pdfGenerator';
import { StatusBadge } from '../components/common/StatusBadge';
import { TableSkeleton } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { SignalementForm } from '../components/signalement-form/SignalementForm';

import { useAuth } from '../context/AuthContext';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export const SignalementsPage: React.FC = () => {
  const { user } = useAuth();
  const isOrgUser = user?.role?.name === 'ORGANIZATION_USER';
  const [searchParams, setSearchParams] = useSearchParams();
  const [showForm, setShowForm] = useState(searchParams.get('action') === 'new');
  const [signalements, setSignalements] = useState<Signalement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [titulaireFilter, setTitulaireFilter] = useState<string>('');
  const [accompagnementFilter, setAccompagnementFilter] = useState<string>('');
  const [issuerFilter, setIssuerFilter] = useState<string>('');
  const [cyberViolenceFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setShowForm(true);
    }
  }, [searchParams]);

  // Reset page to 1 whenever any filter changes
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, priorityFilter, titulaireFilter, accompagnementFilter, issuerFilter, cyberViolenceFilter, dateFrom, dateTo, limit]);

  useEffect(() => {
    if (!showForm) {
      void loadData();
    }
  }, [search, statusFilter, priorityFilter, titulaireFilter, accompagnementFilter, issuerFilter, cyberViolenceFilter, dateFrom, dateTo, showForm, page, limit]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await SignalementsService.getSignalements({
        search,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        titulaire: titulaireFilter || undefined,
        accompanimentType: accompagnementFilter || undefined,
        issuer: issuerFilter || undefined,
        cyberViolenceId: cyberViolenceFilter ? Number(cyberViolenceFilter) : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        limit,
      });
      setSignalements(Array.isArray(data.items) ? data.items : []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      console.error(err);
      setSignalements([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastType(type);
    setToast(message);
  };

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const getListFilters = (): GetSignalementsParams => ({
    search: search || undefined,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    titulaire: titulaireFilter || undefined,
    accompanimentType: accompagnementFilter || undefined,
    issuer: issuerFilter || undefined,
    cyberViolenceId: cyberViolenceFilter ? Number(cyberViolenceFilter) : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const fetchAllFilteredSignalements = async (): Promise<Signalement[]> => {
    const filters = getListFilters();
    const pageSize = 100;
    const first = await SignalementsService.getSignalements({
      ...filters,
      page: 1,
      limit: pageSize,
    });
    const items = [...(Array.isArray(first.items) ? first.items : [])];
    const pages = first.totalPages ?? 1;
    for (let p = 2; p <= pages; p++) {
      const next = await SignalementsService.getSignalements({
        ...filters,
        page: p,
        limit: pageSize,
      });
      items.push(...(Array.isArray(next.items) ? next.items : []));
    }
    return items;
  };

  const handleGeneratePdf = async () => {
    if (pdfBusy) return;
    if (total === 0) {
      showToast('Aucun signalement à exporter.', 'error');
      return;
    }
    try {
      setPdfBusy(true);
      const allItems = await fetchAllFilteredSignalements();
      if (allItems.length === 0) {
        showToast('Aucun signalement à exporter.', 'error');
        return;
      }
      await generateSignalementsListPDF(allItems);
      showToast('PDF généré avec succès.');
    } catch (err) {
      console.error(err);
      showToast('La génération du PDF a échoué.', 'error');
    } finally {
      setPdfBusy(false);
    }
  };

  const handleOpenForm = () => {
    setShowForm(true);
    setSearchParams({ action: 'new' });
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSearchParams({});
  };

  const safeSignalements = Array.isArray(signalements) ? signalements : [];
  const activeFilterCount = [statusFilter, priorityFilter, titulaireFilter, accompagnementFilter, issuerFilter, dateFrom, dateTo].filter(Boolean).length;

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setTitulaireFilter('');
    setAccompagnementFilter('');
    setIssuerFilter('');
    setDateFrom('');
    setDateTo('');
  };

  // Pagination helpers
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const firstItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const lastItem = Math.min(page * limit, total);

  /** Compact page numbers: always show first, last, current ±1, with ellipsis */
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | 'ellipsis')[] = [1];
    if (page > 3) pages.push('ellipsis');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push('ellipsis');
    pages.push(totalPages);
    return pages;
  };

  // ─── If creating a new signalement ──────────────────────────────────────────
  if (showForm) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <button
            onClick={handleCloseForm}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-emc-secondary hover:bg-slate-100 dark:hover:bg-emc-elevated border border-slate-200 dark:border-emc-border-strong transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à la liste des signalements</span>
          </button>
          <span className="text-xs font-medium text-slate-400">
            Formulaire sécurisé et confidentiel
          </span>
        </div>
        <SignalementForm />
      </div>
    );
  }

  // ─── Standard List View ──────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-emc-primary">
            {isOrgUser ? "Gestion des dossiers" : "Gestion des Signalements"}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-emc-secondary">
            {isOrgUser
              ? "Consultez et traitez les dossiers transmis à votre organisation."
              : "Consultez, triez et traitez les incidents de cyberviolence signalés."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {!isOrgUser && (
            <button
              type="button"
              onClick={() => void handleGeneratePdf()}
              disabled={pdfBusy}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 disabled:opacity-50"
            >
              {pdfBusy ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} /> : <FileText className="w-4 h-4" strokeWidth={2.5} />}
              <span>{pdfBusy ? 'Génération...' : 'Générer PDF'}</span>
            </button>
          )}
          <button
            onClick={handleOpenForm}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all shadow-md shadow-blue-500/20 hover:shadow-blue-500/30"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>Nouveau Signalement</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="emc-card p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par référence, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border-strong text-slate-900 dark:text-emc-primary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 self-start xl:self-auto">
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                  {activeFilterCount} filtre{activeFilterCount > 1 ? 's' : ''} actif{activeFilterCount > 1 ? 's' : ''}
                </span>
              )}
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 dark:border-emc-border dark:bg-emc-surface dark:text-emc-primary dark:hover:bg-emc-elevated"
              >
                <Filter className="w-3.5 h-3.5" />
                Réinitialiser les filtres
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-2.5">
            <label className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-emc-secondary">
              Statut
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border-strong text-slate-900 dark:text-emc-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                {isOrgUser ? (
                  <>
                    <option value="ON_HOLD">En attente</option>
                    <option value="IN_PROGRESS">En cours</option>
                    <option value="COMPLETED">Traité</option>
                    <option value="CLOSED">Clôturé</option>
                  </>
                ) : (
                  <>
                    <option value="PENDING">En attente</option>
                    <option value="IN_PROGRESS">En cours</option>
                    <option value="VALIDATED">Validé</option>
                    <option value="REJECTED">Rejeté</option>
                    <option value="CLOSED">Clôturé</option>
                  </>
                )}
              </select>
            </label>

            {!isOrgUser && (
              <>
                <label className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-emc-secondary">
                  Priorité
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border-strong text-slate-900 dark:text-emc-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Toutes les priorités</option>
                    <option value="URGENT">Urgent</option>
                    <option value="HIGH">Élevée</option>
                    <option value="NORMAL">Normale</option>
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-emc-secondary">
                  Titulaire
                  <select
                    value={titulaireFilter}
                    onChange={(e) => setTitulaireFilter(e.target.value)}
                    className="px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border-strong text-slate-900 dark:text-emc-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tous</option>
                    <option value="MOI_MEME">Oui</option>
                    <option value="AUTRE_PERSONNE">Non</option>
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-emc-secondary">
                  Accompagnement
                  <select
                    value={accompagnementFilter}
                    onChange={(e) => setAccompagnementFilter(e.target.value)}
                    className="px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border-strong text-slate-900 dark:text-emc-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tous</option>
                    <option value="SUP">SUP</option>
                    <option value="PSY">PSY</option>
                    <option value="JUR">JUR</option>
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-emc-secondary">
                  Émetteur
                  <input
                    type="text"
                    placeholder="Nom ou code"
                    value={issuerFilter}
                    onChange={(e) => setIssuerFilter(e.target.value)}
                    className="px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border-strong text-slate-900 dark:text-emc-primary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <label className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-emc-secondary">
              Date de début
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border-strong text-slate-900 dark:text-emc-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <label className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-emc-secondary">
              Date de fin
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border-strong text-slate-900 dark:text-emc-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <TableSkeleton rows={limit} />
      ) : safeSignalements.length === 0 ? (
        <EmptyState
          title="Aucun dossier trouvé"
          description="Aucun dossier transmis ne correspond à votre recherche ou filtre."
          actionLabel="Réinitialiser les filtres"
          onAction={() => {
            setSearch('');
            setStatusFilter('');
            setPriorityFilter('');
          }}
        />
      ) : (
        <div className="emc-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                {isOrgUser ? (
                  <tr className="bg-slate-50/60 dark:bg-emc-elevated/40 border-b border-slate-200 dark:border-emc-border text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Référence</th>
                    <th className="py-3 px-4">Cyberviolence</th>
                    <th className="py-3 px-4">Reçu par l'organisation le</th>
                    <th className="py-3 px-4">Statut de l'organisation</th>
                    <th className="py-3 px-4">Dernière mise à jour</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                ) : (
                  <tr className="bg-slate-50/60 dark:bg-emc-elevated/40 border-b border-slate-200 dark:border-emc-border text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Référence</th>
                    <th className="py-3 px-4">Émetteur</th>
                    <th className="py-3 px-4">Titulaire</th>
                    <th className="py-3 px-4">Cyberviolence</th>
                    <th className="py-3 px-4">Accompagnement</th>
                    <th className="py-3 px-4">Réception</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4">Date d&apos;analyse</th>
                    <th className="py-3 px-4">Approbation</th>
                    <th className="py-3 px-4">Date d&apos;approbation</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-emc-border/60 text-xs">
                {safeSignalements.map((sig) => {
                  if (isOrgUser) {
                    const orgAssignment = sig.assignedTo?.[0];
                    const orgStatus = orgAssignment?.status || 'ON_HOLD';
                    const receivedDate = orgAssignment?.createdAt ? new Date(orgAssignment.createdAt).toLocaleDateString('fr-FR') : new Date(sig.createdAt).toLocaleDateString('fr-FR');
                    const updatedDate = orgAssignment?.updatedAt ? new Date(orgAssignment.updatedAt).toLocaleDateString('fr-FR') : new Date(sig.updatedAt).toLocaleDateString('fr-FR');

                    return (
                      <tr
                        key={sig.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-emc-elevated/50 transition-colors group"
                      >
                        <td className="py-3.5 px-4 font-mono font-semibold text-blue-600 dark:text-blue-400">
                          <Link to={`/dashboard/signalements/${sig.id}`} className="hover:underline flex items-center gap-1">
                            {sig.reference || `SIG-${sig.id}`}
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                          </Link>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-900 dark:text-emc-primary">
                            {sig.cyberViolence?.name || sig.otherCyberViolence || 'Cyberviolence'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-emc-secondary text-[11px]">
                          {receivedDate}
                        </td>
                        <td className="py-3.5 px-4">
                          {orgStatus === 'IN_PROGRESS' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                              Traitement en cours
                            </span>
                          ) : orgStatus === 'COMPLETED' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              Traitement terminé
                            </span>
                          ) : orgStatus === 'CLOSED' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                              Dossier clôturé
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              En attente de traitement
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          {updatedDate}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            to={`/dashboard/signalements/${sig.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600/20 transition"
                          >
                            <span>Consulter</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr
                      key={sig.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-emc-elevated/50 transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-blue-600 dark:text-blue-400">
                        <Link to={`/dashboard/signalements/${sig.id}`} className="hover:underline flex items-center gap-1">
                          {sig.reference || `SIG-${sig.id}`}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-emc-secondary font-mono text-[11px]">
                        {sig.issuer}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-emc-primary">
                        {sig.titulaire === 'AUTRE_PERSONNE' ? 'Non' : 'Oui'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 dark:text-emc-primary">
                          {sig.cyberViolence?.name || sig.otherCyberViolence || 'Cyberviolence'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {sig.accompaniments && sig.accompaniments.length > 0
                          ? sig.accompaniments.map((a: { type: string }) => a.type).join(', ')
                          : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {new Date(sig.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={sig.status} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {sig.dateAnalyse ? new Date(sig.dateAnalyse).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        {sig.status === 'VALIDATED' || sig.validate?.some((v) => v.status === 'APPROVED') ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Validé
                          </span>
                        ) : sig.status === 'REJECTED' || sig.validate?.some((v) => v.status === 'REJECTED') ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            Rejeté
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            En attente
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {(sig.status === 'VALIDATED' || sig.status === 'REJECTED') && sig.dateApprobation
                          ? new Date(sig.dateApprobation).toLocaleDateString('fr-FR')
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Pagination Bar ── */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-200 dark:border-emc-border bg-slate-50/60 dark:bg-emc-elevated/30 px-4 py-3">
            {/* Left: count + per-page */}
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-emc-secondary">
              <span>
                <span className="font-bold text-slate-700 dark:text-emc-primary">{firstItem}–{lastItem}</span>
                {' '}sur{' '}
                <span className="font-bold text-slate-700 dark:text-emc-primary">{total}</span>
                {' '}résultat{total !== 1 ? 's' : ''}
              </span>
              <span className="hidden sm:inline text-slate-300 dark:text-emc-border">|</span>
              <label className="hidden sm:flex items-center gap-1.5">
                <span>Lignes par page :</span>
                <select
                  value={limit}
                  onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                  className="rounded-lg border border-slate-200 dark:border-emc-border bg-white dark:bg-emc-surface px-2 py-1 text-xs font-semibold text-slate-700 dark:text-emc-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>
            </div>

            {/* Right: page controls */}
            <div className="flex items-center gap-1">
              {/* First page */}
              <button
                type="button"
                onClick={() => setPage(1)}
                disabled={!canPrev}
                aria-label="Première page"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-emc-border bg-white dark:bg-emc-surface text-slate-500 dark:text-emc-secondary hover:bg-slate-100 dark:hover:bg-emc-elevated disabled:pointer-events-none disabled:opacity-40 transition"
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </button>

              {/* Prev page */}
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!canPrev}
                aria-label="Page précédente"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-emc-border bg-white dark:bg-emc-surface text-slate-500 dark:text-emc-secondary hover:bg-slate-100 dark:hover:bg-emc-elevated disabled:pointer-events-none disabled:opacity-40 transition"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-0.5">
                {getPageNumbers().map((p, idx) =>
                  p === 'ellipsis' ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="flex h-8 w-8 items-center justify-center text-xs font-semibold text-slate-400 dark:text-emc-muted-fg"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      aria-current={p === page ? 'page' : undefined}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition ${
                        p === page
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                          : 'border border-slate-200 dark:border-emc-border bg-white dark:bg-emc-surface text-slate-600 dark:text-emc-secondary hover:bg-slate-100 dark:hover:bg-emc-elevated'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>

              {/* Next page */}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={!canNext}
                aria-label="Page suivante"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-emc-border bg-white dark:bg-emc-surface text-slate-500 dark:text-emc-secondary hover:bg-slate-100 dark:hover:bg-emc-elevated disabled:pointer-events-none disabled:opacity-40 transition"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>

              {/* Last page */}
              <button
                type="button"
                onClick={() => setPage(totalPages)}
                disabled={!canNext}
                aria-label="Dernière page"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-emc-border bg-white dark:bg-emc-surface text-slate-500 dark:text-emc-secondary hover:bg-slate-100 dark:hover:bg-emc-elevated disabled:pointer-events-none disabled:opacity-40 transition"
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
