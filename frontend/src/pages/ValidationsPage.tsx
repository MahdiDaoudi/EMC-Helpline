import React, { useEffect, useState } from 'react';
import type { Validate } from '../types';
import { ValidationsService } from '../services/validations.service';
import { TableSkeleton } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { AlertTriangle } from 'lucide-react';

export const ValidationsPage: React.FC = () => {
  const [validations, setValidations] = useState<Validate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadValidations();
  }, []);

  const loadValidations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ValidationsService.getValidations();
      setValidations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les validations. Vérifiez que le serveur est démarré.');
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    APPROVED: 'bg-emerald-500/10 text-emerald-600',
    REJECTED: 'bg-red-500/10 text-red-600',
    PENDING: 'bg-amber-500/10 text-amber-600',
  };

  const statusLabels: Record<string, string> = {
    APPROVED: 'APPROUVÉ',
    REJECTED: 'REJETÉ',
    PENDING: 'EN ATTENTE',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-emc-primary">
          File de Validation des Cas
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-emc-secondary">
          Examens des preuves par les techniciens et validations des cas par les administrateurs.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={loadValidations} className="ml-auto underline font-semibold">Réessayer</button>
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={5} />
      ) : validations.length === 0 ? (
        <EmptyState
          title="Aucune validation trouvée"
          description="Il n'y a aucune validation enregistrée pour le moment."
          actionLabel="Actualiser"
          onAction={loadValidations}
        />
      ) : (
        <div className="emc-card overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/60 dark:bg-emc-elevated/40 border-b border-slate-200 dark:border-emc-border text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Réf Cas</th>
                <th className="py-3 px-4">Niveau de validation</th>
                <th className="py-3 px-4">Utilisateur réviseur</th>
                <th className="py-3 px-4">Décision</th>
                <th className="py-3 px-4">Motif / Notes</th>
                <th className="py-3 px-4">Validé le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-emc-border">
              {validations.map((v, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-emc-elevated/50">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    #{v.signalementId}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-emc-primary">
                    {v.type === 'TECHNICIAN' ? 'TECHNICIEN' : 'ADMINISTRATEUR'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-emc-secondary">
                    {v.user ? `${v.user.firstName} ${v.user.lastName} (${v.user.role.name})` : `User #${v.userId}`}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusColors[v.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {statusLabels[v.status] ?? v.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-emc-secondary">{v.reason}</td>
                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                    {new Date(v.createdAt).toLocaleString()}
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
