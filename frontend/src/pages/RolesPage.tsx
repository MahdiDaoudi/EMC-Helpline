import React, { useEffect, useState, useMemo } from 'react';
import { Key, Plus, Pencil, Trash2, AlertTriangle, Users, Search, Check } from 'lucide-react';
import type { Role, RoleName } from '../types';
import { RolesService } from '../services/roles.service';
import { TableSkeleton } from '../components/common/LoadingState';

const ROLE_NAME_LABELS: Record<RoleName, string> = {
  SUPER_ADMIN: 'Super Administrateur',
  ADMIN: 'Administrateur',
  TECHNICIAN: 'Technicien',
  ORGANIZATION_USER: 'Utilisateur Organisation',
};

const AVAILABLE_ROLE_NAMES: RoleName[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'TECHNICIAN',
  'ORGANIZATION_USER',
];

const emptyForm = {
  name: '',
  description: '',
};

export const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [initialForm, setInitialForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const isDirty = useMemo(() => {
    if (!showModal) return false;
    if (editingId === null) {
      return form.name.trim().length > 0;
    }
    const hasChanges =
      form.name.trim() !== initialForm.name.trim() ||
      form.description.trim() !== initialForm.description.trim();
    return hasChanges && form.name.trim().length > 0;
  }, [showModal, editingId, form, initialForm]);

  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await RolesService.getRoles();
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load roles', err);
      setError('Impossible de charger les rôles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const filteredRoles = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return roles;
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (ROLE_NAME_LABELS[r.name as RoleName] && ROLE_NAME_LABELS[r.name as RoleName].toLowerCase().includes(q)) ||
        r.description?.toLowerCase().includes(q)
    );
  }, [roles, search]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setInitialForm(emptyForm);
    setFieldErrors({});
    setShowModal(true);
  };

  const openEditModal = (role: Role) => {
    setEditingId(role.id);
    const initial = {
      name: role.name,
      description: role.description ?? '',
    };
    setForm(initial);
    setInitialForm(initial);
    setFieldErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    setFieldErrors({});
    const name = form.name.trim();
    const description = form.description.trim();

    const errs: Record<string, string> = {};
    if (!name) {
      errs.name = 'Le nom du rôle est obligatoire.';
    }
    if (!description || description.length < 5) {
      errs.description = 'La description doit contenir au moins 5 caractères.';
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await RolesService.updateRole(editingId, { name, description });
        setSuccessMsg('Rôle mis à jour avec succès.');
      } else {
        await RolesService.createRole({ name: name as any, description });
        setSuccessMsg('Rôle créé avec succès.');
      }

      setShowModal(false);
      await loadRoles();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message ?? "Erreur lors de l'enregistrement du rôle.";
      setFieldErrors({ name: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      await RolesService.deleteRole(deleteTarget.id);
      setDeleteTarget(null);
      setSuccessMsg('Rôle supprimé avec succès.');
      await loadRoles();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.message ??
        'Ce rôle est utilisé par des utilisateurs et ne peut pas être supprimé.';
      setDeleteError(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-emc-primary md:text-2xl">
            Gestion des Rôles & Accès
          </h1>
          <p className="text-xs text-slate-500 dark:text-emc-secondary md:text-sm">
            Définissez et gérez la matrice des rôles et autorisations système.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nouveau rôle
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300">
          <Check className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="emc-card p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un rôle par nom ou description..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
          />
        </div>
      </div>

      {/* Roles Table */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : filteredRoles.length === 0 ? (
        <div className="emc-card p-8 text-center text-sm text-slate-500 dark:text-emc-secondary">
          Aucun rôle trouvé.
        </div>
      ) : (
        <div className="emc-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-emc-elevated/40 border-b border-slate-200 dark:border-emc-border text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Rôle</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Utilisateurs</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-emc-border">
                {filteredRoles.map((role) => {
                  const userCount = role._count?.users ?? 0;

                  return (
                    <tr key={role.id} className="hover:bg-slate-50/80 dark:hover:bg-emc-elevated/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                            <Key className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-mono text-xs font-bold text-slate-900 dark:text-emc-primary block">
                              {role.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {ROLE_NAME_LABELS[role.name] || 'Rôle système'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-emc-secondary max-w-md">
                        {role.description || 'Aucune description fournie.'}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-emc-elevated text-slate-700 dark:text-emc-secondary font-semibold text-[11px]">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{userCount} utilisateur{userCount !== 1 ? 's' : ''}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(role)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary transition"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Modifier
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTarget(role);
                            setDeleteError(null);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-600 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-emc-border dark:bg-emc-surface space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-blue-600">
                  {editingId ? 'Modifier' : 'Créer'}
                </p>
                <h2 className="text-lg font-bold text-slate-900 dark:text-emc-primary">
                  {editingId ? 'Rôle Système' : 'Nouveau Rôle'}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-sm text-slate-400 hover:text-slate-700 dark:hover:text-emc-primary"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-emc-secondary mb-1">
                  Nom du rôle
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
                  placeholder="Saisissez le nom du rôle (ex: ADMIN, MODERATEUR...)"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-blue-500 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                />
                {fieldErrors.name && <div className="mt-1 text-xs text-red-600">{fieldErrors.name}</div>}
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-emc-secondary mb-1">
                  Description du rôle
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
                  placeholder="Décrivez les permissions et la portée de ce rôle..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-blue-500 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                />
                {fieldErrors.description && <div className="mt-1 text-xs text-red-600">{fieldErrors.description}</div>}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!isDirty || saving}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving ? 'Enregistrement...' : editingId ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Role Delete */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-emc-border dark:bg-emc-surface space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-red-600">Confirmation</p>
                <h2 className="text-base font-bold text-slate-900 dark:text-emc-primary">Supprimer le rôle</h2>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-emc-secondary">
              Voulez-vous vraiment supprimer le rôle <span className="font-mono font-bold text-slate-900 dark:text-emc-primary">{deleteTarget.name}</span> ?
            </p>

            {deleteError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteError(null);
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition"
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
