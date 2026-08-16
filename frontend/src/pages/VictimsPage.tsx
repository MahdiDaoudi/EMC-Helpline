import React, { useEffect, useState } from 'react';
import { Search, Lock, UserCheck, AlertTriangle } from 'lucide-react';
import type { Victim } from '../types';
import { VictimsService } from '../services/victims.service';
import { TableSkeleton } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';

export const VictimsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [victims, setVictims] = useState<Victim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVictims();
  }, []);

  const loadVictims = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await VictimsService.getVictims();
      setVictims(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les victims. Vérifiez que le serveur est démarré.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = victims.filter(
    (v) =>
      v.referenceNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-emc-primary">
            Registre des victims
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-emc-secondary">
            Base de données confidentielle protégée des victims recevant des conseils de la helpline.
          </p>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs flex items-center gap-2.5">
        <Lock className="w-4 h-4 text-blue-500 flex-shrink-0" />
        <span>
          <strong>Garantie de Confidentialité :</strong> Les champs d'identité personnelle (Nom, Téléphone, E-mail) sont strictement cryptés. La vue analytique utilise des groupes d'âge démographiques et des codes de référence anonymes.
        </span>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={loadVictims} className="ml-auto underline font-semibold">Réessayer</button>
        </div>
      )}

      <div className="emc-card p-4 flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par code de référence ou ville..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-xs bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border-strong text-slate-900 dark:text-emc-primary focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Aucune victim trouvée"
          description="Aucune victim ne correspond à votre recherche ou aucun enregistrement n'existe encore."
          actionLabel="Réinitialiser la recherche"
          onAction={() => setSearch('')}
        />
      ) : (
        <div className="emc-card overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/60 dark:bg-emc-elevated/40 border-b border-slate-200 dark:border-emc-border text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Référence victim</th>
                <th className="py-3 px-4">Démographie</th>
                <th className="py-3 px-4">Ville</th>
                <th className="py-3 px-4">Anonymat</th>
                <th className="py-3 px-4">Cas liés</th>
                <th className="py-3 px-4">Date d'enregistrement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-emc-border">
              {filtered.map((vic) => (
                <tr key={vic.id} className="hover:bg-slate-50/80 dark:hover:bg-emc-elevated/50">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {vic.referenceNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900 dark:text-emc-primary">
                      {vic.ageGroup}
                    </span>
                    <span className="text-[11px] text-slate-400 block">{vic.sex === 'FEMALE' ? 'FEMME' : 'HOMME'}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-emc-secondary font-medium">
                    {vic.city}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                        vic.isAnonymous
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-blue-500/10 text-blue-600'
                      }`}
                    >
                      <UserCheck className="w-3 h-3" />
                      {vic.isAnonymous ? 'ANONYME' : 'VÉRIFIÉ'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-emc-primary">
                    {vic._count?.signalement || 0} cas
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                    {new Date(vic.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
