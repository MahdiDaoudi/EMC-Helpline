import React, { useEffect, useState } from 'react';
import type { PlatformReport } from '../types';
import { PlatformReportsService } from '../services/platformReports.service';

export const PlatformReportsPage: React.FC = () => {
  const [reports, setReports] = useState<PlatformReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await PlatformReportsService.getPlatformReports();
        setReports(Array.isArray(data) ? data : []);
      } catch {
        setError('Impossible de charger les rapports de plateforme.');
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    void loadReports();
  }, []);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'EN ATTENTE';
      case 'SENT': return 'ENVOYÉ';
      case 'PROCESSING': return 'EN TRAITEMENT';
      case 'CLOSED': return 'CLÔTURÉ';
      case 'REJECTED': return 'REJETÉ';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-emc-primary">
          Rapports de Suppression de Plateforme
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-emc-secondary">
          Notices officielles de suppression de contenu envoyées aux équipes de confiance et sécurité.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/20 dark:text-rose-300">
          {error}
        </div>
      )}

      <div className="emc-card overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-slate-500 dark:text-emc-secondary">Chargement des rapports…</div>
        ) : reports.length === 0 ? (
          <div className="p-6 text-sm text-slate-500 dark:text-emc-secondary">Aucun rapport de plateforme n’a été généré.</div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/60 dark:bg-emc-elevated/40 border-b border-slate-200 dark:border-emc-border text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Réf Cas</th>
                <th className="py-3 px-4">Plateforme</th>
                <th className="py-3 px-4">Sujet de suppression</th>
                <th className="py-3 px-4">Destinataire</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Envoyé le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-emc-border">
              {reports.map((rep) => (
                <tr key={`${rep.signalementId}-${rep.platformId}`} className="hover:bg-slate-50/80 dark:hover:bg-emc-elevated/50">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {rep.signalementId}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-emc-primary">
                    {rep.platform?.name ?? `Plateforme #${rep.platformId}`}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-emc-secondary">
                    {rep.emailSubject}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-emc-secondary">
                    {rep.emailTo ?? '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        rep.status === 'PROCESSING'
                          ? 'bg-amber-500/10 text-amber-600'
                          : rep.status === 'CLOSED'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : rep.status === 'REJECTED'
                          ? 'bg-rose-500/10 text-rose-600'
                          : 'bg-blue-500/10 text-blue-600'
                      }`}
                    >
                      {getStatusLabel(rep.status)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                    {new Date(rep.createdAt).toLocaleString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

