import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Plus, Filter, ExternalLink, ArrowLeft } from 'lucide-react';
import { SignalementsService } from '../services/signalements.service';
import type { Signalement } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { TableSkeleton } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { SignalementForm } from '../components/signalement-form/SignalementForm';

export const SignalementsPage: React.FC = () => {
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

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setShowForm(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!showForm) {
      loadData();
    }
  }, [search, statusFilter, priorityFilter, titulaireFilter, accompagnementFilter, issuerFilter, cyberViolenceFilter, dateFrom, dateTo, showForm]);

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
      });
      setSignalements(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error(err);
      setSignalements([]);
    } finally {
      setLoading(false);
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

  // ─── If creating a new signalement ──────────────────────────────────────────
  if (showForm) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Back button header */}
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

        {/* The 4-step wizard form */}
        <SignalementForm />
      </div>
    );
  }

  // ─── Standard List View ──────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-emc-primary">
            Gestion des Signalements
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-emc-secondary">
            Consultez, triez et traitez les incidents de cyberviolence signalés.
          </p>
        </div>

        <button
          onClick={handleOpenForm}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all shadow-md shadow-blue-500/20 hover:shadow-blue-500/30"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span>Nouveau Signalement</span>
        </button>
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
                <option value="PENDING">En attente</option>
                <option value="IN_PROGRESS">En cours</option>
                <option value="VALIDATED">Validé</option>
                <option value="REJECTED">Rejeté</option>
                <option value="CLOSED">Clôturé</option>
              </select>
            </label>

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
        <TableSkeleton rows={6} />
      ) : safeSignalements.length === 0 ? (
        <EmptyState
          title="Aucun signalement trouvé"
          description="Aucun cas de cyberviolence ne correspond à votre recherche ou filtre."
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
                <tr className="bg-slate-50/60 dark:bg-emc-elevated/40 border-b border-slate-200 dark:border-emc-border text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Référence</th>
                  <th className="py-3 px-4">Émetteur</th>
                  <th className="py-3 px-4">Titulaire</th>
                  <th className="py-3 px-4">Cyberviolence</th>
                  <th className="py-3 px-4">Accompagnement</th>
                  <th className="py-3 px-4">Réception</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Date d’analyse</th>
                  <th className="py-3 px-4">Approbation</th>
                  <th className="py-3 px-4">Date d’approbation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-emc-border/60 text-xs">
                {safeSignalements.map((sig) => (
                  <tr
                    key={sig.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-emc-elevated/50 transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-semibold text-blue-600 dark:text-blue-400">
                      <Link to={`/signalements/${sig.id}`} className="hover:underline flex items-center gap-1">
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
                      —
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      —
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      —
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
