import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ExternalLink,
  Calendar,
  Building2,
} from 'lucide-react';
import type { AssignedTo, Organization } from '../types';
import { AssignmentsService } from '../services/assignments.service';
import { OrganizationsService } from '../services/organizations.service';
import { TableSkeleton } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';

export const AssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<AssignedTo[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch Organizations list for filter dropdown
  useEffect(() => {
    OrganizationsService.getOrganizations()
      .then((data) => setOrganizations(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Failed to load organizations for filter', err));
  }, []);

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await AssignmentsService.getAssignments({
        search: search.trim() || undefined,
        organizationId: selectedOrgId ? Number(selectedOrgId) : undefined,
        type: selectedType || undefined,
        status: selectedStatus || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        limit,
      });

      setAssignments(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les affectations. Vérifiez que le serveur est démarré.');
    } finally {
      setLoading(false);
    }
  }, [search, selectedOrgId, selectedType, selectedStatus, dateFrom, dateTo, page, limit]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<any>>, value: any) => {
    setter(value);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedOrgId('');
    setSelectedType('');
    setSelectedStatus('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(search.trim()) ||
    Boolean(selectedOrgId) ||
    Boolean(selectedType) ||
    Boolean(selectedStatus) ||
    Boolean(dateFrom) ||
    Boolean(dateTo);

  const statusColors: Record<string, string> = {
    IN_PROGRESS: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
    PENDING: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
    ASSIGNED: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
    ON_HOLD: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
    COMPLETED: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
    CLOSED: 'bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400',
    REJECTED: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400',
  };

  const statusLabels: Record<string, string> = {
    IN_PROGRESS: 'TRAITEMENT EN COURS',
    PENDING: 'EN ATTENTE DE TRAITEMENT',
    ASSIGNED: 'EN ATTENTE DE TRAITEMENT',
    ON_HOLD: 'EN ATTENTE DE TRAITEMENT',
    COMPLETED: 'TRAITEMENT TERMINÉ',
    CLOSED: 'DOSSIER CLÔTURÉ',
    REJECTED: 'REJETÉ',
  };

  const typeLabels: Record<string, string> = {
    SUP: 'Sup. Technique',
    PSY: 'Accompagnement Psychologique',
    JUR: 'Assistance Juridique',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-emc-primary">
            Affectations de Cas
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-emc-secondary">
            Suivez l'attribution des cas et la charge de travail entre les organisations partenaires.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={loadAssignments} className="ml-auto underline font-semibold">Réessayer</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="emc-card p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-emc-primary pb-2 border-b border-slate-100 dark:border-emc-border">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          <span>Filtres de recherche</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par référence, motif, org..."
              value={search}
              onChange={(e) => handleFilterChange(setSearch, e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border text-slate-900 dark:text-emc-primary placeholder-slate-400 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Organization Select */}
          <div>
            <select
              value={selectedOrgId}
              onChange={(e) => handleFilterChange(setSelectedOrgId, e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border text-slate-900 dark:text-emc-primary outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">Toutes les organisations</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.nickname ? `${org.nickname} (${org.name})` : org.name}
                </option>
              ))}
            </select>
          </div>

          {/* Accompaniment Type Select */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => handleFilterChange(setSelectedType, e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border text-slate-900 dark:text-emc-primary outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">Tous les types</option>
              <option value="JUR">JUR (Juridique)</option>
              <option value="PSY">PSY (Psychique)</option>
              <option value="SUP">SUP (Technique)</option>
            </select>
          </div>

          {/* Status Select */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => handleFilterChange(setSelectedStatus, e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border text-slate-900 dark:text-emc-primary outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">Tous les statuts</option>
              <option value="ON_HOLD">En attente de traitement</option>
              <option value="IN_PROGRESS">Traitement en cours</option>
              <option value="COMPLETED">Traitement terminé</option>
              <option value="CLOSED">Dossier clôturé</option>
              <option value="REJECTED">Rejeté</option>
            </select>
          </div>

          {/* Reset button */}
          <div className="flex items-center">
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-emc-secondary hover:text-red-600 dark:hover:text-red-400 bg-slate-100 dark:bg-emc-elevated hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
              >
                <X className="w-3.5 h-3.5" />
                <span>Réinitialiser</span>
              </button>
            )}
          </div>
        </div>

        {/* Date Range Inputs */}
        <div className="flex items-center gap-3 pt-2 text-xs text-slate-500 dark:text-emc-secondary flex-wrap">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Du:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => handleFilterChange(setDateFrom, e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border text-slate-900 dark:text-emc-primary outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span>Au:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => handleFilterChange(setDateTo, e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border text-slate-900 dark:text-emc-primary outline-none"
            />
          </div>

          {hasActiveFilters && (
            <span className="ml-auto text-[11px] font-medium text-blue-600 dark:text-blue-400">
              {total} affectation{total > 1 ? 's' : ''} trouvée{total > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : assignments.length === 0 ? (
        <EmptyState
          title="Aucune affectation trouvée"
          description={
            hasActiveFilters
              ? 'Aucune affectation ne correspond aux filtres sélectionnés.'
              : "Aucun cas n'a encore été affecté à une organisation partenaire."
          }
          actionLabel={hasActiveFilters ? 'Réinitialiser les filtres' : 'Actualiser'}
          onAction={hasActiveFilters ? handleResetFilters : loadAssignments}
        />
      ) : (
        <div className="emc-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-emc-elevated/40 border-b border-slate-200 dark:border-emc-border text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Référence</th>
                  <th className="py-3 px-4">Organisation Affectée</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Motif d'affectation</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Date d'affectation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-emc-border">
                {assignments.map((asg, idx) => {
                  const refCode =
                    (asg.signalement as any)?.reference ||
                    `SIG-${asg.signalementId}`;
                  const orgNickname = asg.organization?.nickname || asg.organization?.name || `Org #${asg.organizationId}`;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-emc-elevated/50 transition-colors">
                      {/* Signalement Reference Clickable */}
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <Link
                          to={`/dashboard/signalements/${asg.signalementId}`}
                          className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline group cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded px-1 -ml-1 py-0.5"
                          title="Consulter les détails du signalement"
                        >
                          <span>{refCode}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </td>

                      {/* Organization Nickname */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-emc-primary">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span title={asg.organization?.name}>{orgNickname}</span>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-emc-elevated text-slate-700 dark:text-emc-secondary">
                          {typeLabels[asg.type] || asg.type}
                        </span>
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-4 text-slate-700 dark:text-emc-secondary max-w-xs truncate">
                        {asg.reason ?? '–'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusColors[asg.status] ?? 'bg-slate-100 text-slate-600'}`}>
                          {statusLabels[asg.status] ?? asg.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {new Date(asg.createdAt).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-emc-border text-xs bg-slate-50/50 dark:bg-emc-elevated/20">
            <div className="text-slate-500 dark:text-emc-secondary text-[11px]">
              Affichage de <span className="font-semibold text-slate-800 dark:text-emc-primary">{(page - 1) * limit + 1}</span> à{' '}
              <span className="font-semibold text-slate-800 dark:text-emc-primary">{Math.min(page * limit, total)}</span> sur{' '}
              <span className="font-semibold text-slate-800 dark:text-emc-primary">{total}</span> résultats
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-emc-border font-medium text-slate-700 dark:text-emc-primary hover:bg-slate-100 dark:hover:bg-emc-elevated disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Précédent</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                    pageNum === page
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'border border-slate-200 dark:border-emc-border text-slate-700 dark:text-emc-primary hover:bg-slate-100 dark:hover:bg-emc-elevated'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-emc-border font-medium text-slate-700 dark:text-emc-primary hover:bg-slate-100 dark:hover:bg-emc-elevated disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <span>Suivant</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
