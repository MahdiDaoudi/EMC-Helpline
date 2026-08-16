import React, { useEffect, useState } from 'react';
import type { AssignedTo } from '../types';
import { AssignmentsService } from '../services/assignments.service';
import { TableSkeleton } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { AlertTriangle } from 'lucide-react';

export const AssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<AssignedTo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await AssignmentsService.getAssignments();
      setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les affectations. Vérifiez que le serveur est démarré.');
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    IN_PROGRESS: 'bg-blue-500/10 text-blue-600',
    PENDING: 'bg-amber-500/10 text-amber-600',
    ASSIGNED: 'bg-violet-500/10 text-violet-600',
    COMPLETED: 'bg-emerald-500/10 text-emerald-600',
    REJECTED: 'bg-red-500/10 text-red-600',
  };

  const statusLabels: Record<string, string> = {
    IN_PROGRESS: 'EN COURS',
    PENDING: 'EN ATTENTE',
    ASSIGNED: 'ASSIGNÉ',
    COMPLETED: 'TERMINÉ',
    REJECTED: 'REJETÉ',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-emc-primary">
          Affectations de Cas
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-emc-secondary">
          Suivez l'attribution des cas et la charge de travail entre les organisations partenaires de la helpline.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={loadAssignments} className="ml-auto underline font-semibold">Réessayer</button>
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={5} />
      ) : assignments.length === 0 ? (
        <EmptyState
          title="Aucune affectation trouvée"
          description="Aucun cas n'a encore été affecté à une organisation partenaire."
          actionLabel="Actualiser"
          onAction={loadAssignments}
        />
      ) : (
        <div className="emc-card overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/60 dark:bg-emc-elevated/40 border-b border-slate-200 dark:border-emc-border text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Réf Cas</th>
                <th className="py-3 px-4">Organisation Affectée</th>
                <th className="py-3 px-4">Motif d'affectation</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Date d'affectation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-emc-border">
              {assignments.map((asg, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-emc-elevated/50">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    #{asg.signalementId}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-emc-primary">
                    {asg.organization?.name ?? `Org #${asg.organizationId}`}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-emc-secondary">{asg.reason ?? '–'}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusColors[asg.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {statusLabels[asg.status] ?? asg.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                    {new Date(asg.createdAt).toLocaleString()}
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
