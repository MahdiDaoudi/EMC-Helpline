import React, { useEffect, useState } from 'react';
import { Key, ShieldCheck } from 'lucide-react';
import type { Role } from '../types';
import { RolesService } from '../services/roles.service';

export const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const data = await RolesService.getRoles();
        setRoles(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load roles', error);
      } finally {
        setLoading(false);
      }
    };

    loadRoles();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-emc-primary">
          Matrice des rôles & contrôles d'accès
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-emc-secondary">
          Définitions RBAC exploitées par l'application EMC Helpline.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="emc-card p-5 animate-pulse space-y-3">
              <div className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-emc-elevated" />
              <div className="h-4 w-28 rounded bg-slate-200 dark:bg-emc-elevated" />
              <div className="h-3 w-full rounded bg-slate-200 dark:bg-emc-elevated" />
              <div className="h-3 w-5/6 rounded bg-slate-200 dark:bg-emc-elevated" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((r) => (
            <div key={r.id} className="emc-card p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Key className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-mono text-sm font-bold text-slate-900 dark:text-emc-primary">{r.name}</h3>
                  <span className="text-[10px] text-slate-400">ID rôle #{r.id}</span>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-slate-600 dark:text-emc-secondary">
                {r.description || 'Aucune description fournie pour ce rôle.'}
              </p>

              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5" />
                Autorisations système
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

