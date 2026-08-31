import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreHorizontal, ExternalLink, ArrowRight, Eye, UserPlus, CheckCircle } from 'lucide-react';
import type { Signalement } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';

interface RecentSignalementsTableProps {
  signalements?: Signalement[];
}

/** Generate a two-letter avatar from the issuer string */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/** Deterministic pastel hue from a string */
function avatarColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 55%)`;
}

export const RecentSignalementsTable: React.FC<RecentSignalementsTableProps> = ({
  signalements = [],
}) => {
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const safeSignalements = Array.isArray(signalements) ? signalements : [];

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="emc-card overflow-hidden animate-slide-up animate-slide-up-delay-4">
      {/* Card Header */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-emc-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-emc-primary">
            Signalements récents
          </h3>
          <p className="text-xs text-slate-500 dark:text-emc-secondary mt-0.5">
            Les derniers signalements nécessitant une attention
          </p>
        </div>
        <Link
          to="/dashboard/signalements"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400
            hover:text-blue-700 dark:hover:text-blue-300 transition-colors
            px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50"
        >
          <span>Voir tout</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 dark:bg-emc-elevated/30 border-b border-slate-200 dark:border-emc-border">
              <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 dark:text-emc-muted-fg uppercase tracking-widest">Signalement</th>
              <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 dark:text-emc-muted-fg uppercase tracking-widest">Déclarant</th>
              <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 dark:text-emc-muted-fg uppercase tracking-widest">Cyberviolence</th>
              <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 dark:text-emc-muted-fg uppercase tracking-widest">Priorité</th>
              <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 dark:text-emc-muted-fg uppercase tracking-widest">Statut</th>
              <th className="py-2.5 px-4 text-[10px] font-bold text-slate-400 dark:text-emc-muted-fg uppercase tracking-widest">Date</th>
              <th className="py-2.5 px-4 text-right text-[10px] font-bold text-slate-400 dark:text-emc-muted-fg uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/80 dark:divide-emc-border/40">
            {safeSignalements.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm text-slate-400 dark:text-emc-muted-fg">
                  Aucun signalement récent trouvé.
                </td>
              </tr>
            ) : (
              safeSignalements.map((sig) => {
                const initials = getInitials(sig.issuer ?? 'NN');
                const color = avatarColor(sig.issuer ?? 'NN');
                return (
                  <tr
                    key={sig.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-emc-elevated/30 transition-colors duration-150 group"
                  >
                    {/* Reference */}
                    <td className="py-3 px-4">
                      <Link
                        to={`/dashboard/signalements/${sig.id}`}
                        className="font-mono text-[12px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        {sig.reference ?? `SIG-${sig.id}`}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                      </Link>
                    </td>

                    {/* Issuer avatar */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 shadow-sm"
                          style={{ backgroundColor: color }}
                        >
                          {initials}
                        </span>
                        <span className="text-xs text-slate-700 dark:text-emc-primary font-medium truncate max-w-[80px]">
                          {sig.issuer}
                        </span>
                      </div>
                    </td>

                    {/* Cyber violence */}
                    <td className="py-3 px-4">
                      <span className="text-xs font-medium text-slate-800 dark:text-emc-primary">
                        {sig.cyberViolence?.name ?? sig.otherCyberViolence ?? 'Harcèlement général'}
                      </span>
                      {sig.description && (
                        <p className="text-[11px] text-slate-400 dark:text-emc-muted-fg truncate max-w-[160px] mt-0.5">
                          {sig.description}
                        </p>
                      )}
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-4">
                      <PriorityBadge priority={sig.priority} />
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <StatusBadge status={sig.status} />
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-[11px] text-slate-400 dark:text-emc-muted-fg font-mono whitespace-nowrap">
                      {formatDate(sig.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === sig.id ? null : sig.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-emc-primary
                          hover:bg-slate-100 dark:hover:bg-emc-elevated transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {activeMenuId === sig.id && (
                        <div className="absolute right-4 top-10 w-44 bg-white dark:bg-emc-elevated
                          border border-slate-200 dark:border-emc-border-strong rounded-xl shadow-2xl z-50 p-1.5 text-left">
                          <Link
                            to={`/signalements/${sig.id}`}
                            onClick={() => setActiveMenuId(null)}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-emc-primary
                              hover:bg-slate-100 dark:hover:bg-emc-surface-hover rounded-lg"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-500" /> Voir le détail
                          </Link>
                          <Link
                            to="/assignments"
                            onClick={() => setActiveMenuId(null)}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-emc-primary
                              hover:bg-slate-100 dark:hover:bg-emc-surface-hover rounded-lg"
                          >
                            <UserPlus className="w-3.5 h-3.5 text-violet-500" /> Assigner
                          </Link>
                          <Link
                            to={`/signalements/${sig.id}`}
                            onClick={() => setActiveMenuId(null)}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-emc-primary
                              hover:bg-slate-100 dark:hover:bg-emc-surface-hover rounded-lg"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Valider
                          </Link>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-slate-100 dark:divide-emc-border">
        {safeSignalements.map((sig) => {
          const initials = getInitials(sig.issuer ?? 'NN');
          const color = avatarColor(sig.issuer ?? 'NN');
          return (
            <div key={sig.id} className="p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <Link
                  to={`/signalements/${sig.id}`}
                  className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400"
                >
                  {sig.reference ?? `SIG-${sig.id}`}
                </Link>
                <StatusBadge status={sig.status} size="sm" />
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                  style={{ backgroundColor: color }}
                >
                  {initials}
                </span>
                <span className="text-xs text-slate-600 dark:text-emc-secondary">{sig.issuer}</span>
              </div>

              <p className="text-xs text-slate-800 dark:text-emc-primary line-clamp-2">
                {sig.description}
              </p>

              <div className="flex items-center justify-between pt-0.5 text-[11px] text-slate-400">
                <PriorityBadge priority={sig.priority} />
                <span>{formatDate(sig.createdAt)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
