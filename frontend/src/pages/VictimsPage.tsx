import React, { useEffect, useState } from 'react';
import { Search, Lock, UserCheck, AlertTriangle, X, FileText, ChevronRight, Calendar, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Victim, AgeGroup, Sex } from '../types';
import { VictimsService } from '../services/victims.service';
import { TableSkeleton } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { StatusBadge } from '../components/common/StatusBadge';

const formatAgeGroup = (ag: AgeGroup | string): string => {
  switch (ag) {
    case 'CHILD_5_12':
      return '5 - 12 ans (Enfant)';
    case 'TEEN_13_17':
      return '13 - 17 ans (Adolescent)';
    case 'YOUNG_ADULT_18_25':
      return '18 - 25 ans (Jeune Adulte)';
    case 'ADULT_26_PLUS':
      return '26 ans et + (Adulte)';
    default:
      return String(ag);
  }
};

const formatSex = (sex: Sex | string): string => {
  if (sex === 'FEMALE') return 'Femme';
  if (sex === 'MALE') return 'Homme';
  return String(sex);
};

export const VictimsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [victims, setVictims] = useState<Victim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVictim, setSelectedVictim] = useState<Victim | null>(null);

  useEffect(() => {
    void loadVictims();
  }, []);

  const loadVictims = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await VictimsService.getVictims();
      setVictims(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger la liste des victimes. Vérifiez le serveur backend.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = victims.filter((v) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;
    return (
      v.referenceNumber.toLowerCase().includes(query) ||
      (v.city && v.city.toLowerCase().includes(query)) ||
      (v.firstName && v.firstName.toLowerCase().includes(query)) ||
      (v.lastName && v.lastName.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-emc-primary">
            Registre des Victimes
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-emc-secondary">
            Base de données sécurisée et confidentielle des victimes enregistrées dans la helpline.
          </p>
        </div>
      </div>

      {/* Security Banner */}
      <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs flex items-center gap-2.5">
        <Lock className="w-4 h-4 text-blue-500 flex-shrink-0" />
        <span>
          <strong>Garantie de Confidentialité :</strong> Les données personnelles nominatives sont strictement sécurisées. La vue d'ensemble privilégie le code de référence et la démographie.
        </span>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={loadVictims} className="ml-auto underline font-semibold">Réessayer</button>
        </div>
      )}

      {/* Search Bar */}
      <div className="emc-card p-4 flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par référence, ville..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-xs bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border-strong text-slate-900 dark:text-emc-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Aucune victime trouvée"
          description="Aucune victime ne correspond à votre recherche."
          actionLabel="Réinitialiser la recherche"
          onAction={() => setSearch('')}
        />
      ) : (
        <div className="emc-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/60 dark:bg-emc-elevated/40 border-b border-slate-200 dark:border-emc-border text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Référence Victime</th>
                  <th className="py-3 px-4">Démographie</th>
                  <th className="py-3 px-4">Ville</th>
                  <th className="py-3 px-4">Statut Anonymat</th>
                  <th className="py-3 px-4">Signalements Liés</th>
                  <th className="py-3 px-4">Date d&apos;enregistrement</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-emc-border">
                {filtered.map((vic) => {
                  const count = vic.signalement?.length ?? vic._count?.signalement ?? 0;
                  return (
                    <tr
                      key={vic.id}
                      onClick={() => setSelectedVictim(vic)}
                      className="hover:bg-slate-50/80 dark:hover:bg-emc-elevated/50 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {vic.referenceNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 dark:text-emc-primary">
                          {formatAgeGroup(vic.ageGroup)}
                        </span>
                        <span className="text-[11px] text-slate-400 block">{formatSex(vic.sex)}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-emc-secondary font-medium">
                        {vic.city || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            vic.isAnonymous
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          }`}
                        >
                          <UserCheck className="w-3 h-3" />
                          {vic.isAnonymous ? 'Anonyme' : 'Identifié'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-slate-100 dark:bg-emc-elevated text-slate-800 dark:text-emc-primary">
                          {count} signalement{count > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {new Date(vic.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center text-xs text-blue-600 dark:text-blue-400 group-hover:underline font-semibold">
                          Voir détails <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Victim Signalements Modal / Drawer */}
      {selectedVictim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-emc-sidebar border border-slate-200 dark:border-emc-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-emc-border/60 bg-slate-50/50 dark:bg-emc-elevated/30">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-emc-primary flex items-center gap-2">
                    Victime : <span className="font-mono text-blue-600 dark:text-blue-400">{selectedVictim.referenceNumber}</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-emc-secondary">
                    Historique complet des signalements soumis par ou pour cette victime.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedVictim(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-emc-primary hover:bg-slate-100 dark:hover:bg-emc-elevated transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Victim Meta Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-emc-elevated/40 border border-slate-200 dark:border-emc-border text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tranche d&apos;âge</span>
                  <span className="font-semibold text-slate-800 dark:text-emc-primary">
                    {formatAgeGroup(selectedVictim.ageGroup)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sexe</span>
                  <span className="font-semibold text-slate-800 dark:text-emc-primary">
                    {formatSex(selectedVictim.sex)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ville</span>
                  <span className="font-semibold text-slate-800 dark:text-emc-primary">
                    {selectedVictim.city || 'Non renseignée'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Statut d&apos;anonymat</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {selectedVictim.isAnonymous ? 'Anonyme' : 'Identifiée'}
                  </span>
                </div>
              </div>

              {/* Signalements Section */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-emc-primary mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>Signalements associés ({selectedVictim.signalement?.length ?? 0})</span>
                </h3>

                {!selectedVictim.signalement || selectedVictim.signalement.length === 0 ? (
                  <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-200 dark:border-emc-border text-xs text-slate-500">
                    Aucun signalement n&apos;est actuellement associé à cette victime.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedVictim.signalement.map((sig) => (
                      <div
                        key={sig.id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-emc-border bg-white dark:bg-emc-surface hover:border-blue-300 dark:hover:border-blue-500/40 transition space-y-2"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <Link
                            to={`/dashboard/signalements/${sig.id}`}
                            onClick={() => setSelectedVictim(null)}
                            className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
                          >
                            {sig.reference || `SIG-${sig.id}`}
                            <ChevronRight className="w-4 h-4" />
                          </Link>

                          <div className="flex items-center gap-2">
                            <StatusBadge status={sig.status} />
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(sig.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                          <div>
                            <span className="text-slate-400">Cyberviolence : </span>
                            <span className="font-semibold text-slate-800 dark:text-emc-primary">
                              {sig.cyberViolence?.name || sig.otherCyberViolence || 'Non spécifié'}
                            </span>
                          </div>

                          {sig.accompaniments && sig.accompaniments.length > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-[11px] text-slate-400">Accompagnements :</span>
                              {sig.accompaniments.map((acc, i) => (
                                <span key={i} className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                                  {acc.type}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {sig.description && (
                          <p className="text-xs text-slate-600 dark:text-emc-secondary line-clamp-2 bg-slate-50 dark:bg-emc-elevated/40 p-2 rounded-lg">
                            {sig.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-emc-border/60 bg-slate-50/50 dark:bg-emc-elevated/20 flex justify-end">
              <button
                onClick={() => setSelectedVictim(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-emc-elevated text-slate-800 dark:text-emc-primary hover:bg-slate-300 dark:hover:bg-emc-border transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
