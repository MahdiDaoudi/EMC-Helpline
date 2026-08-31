import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import type { Organization, Role, User } from '../types';
import { UsersService } from '../services/users.service';
import { RolesService } from '../services/roles.service';
import { OrganizationsService } from '../services/organizations.service';

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  roleId: 0,
  organizationId: 0,
  isActive: true,
  isLocked: false,
};

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [initialForm, setInitialForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const isDirty = useMemo(() => {
    if (!showModal) return false;
    if (editingId === null) {
      return (
        form.firstName.trim().length > 0 &&
        form.lastName.trim().length > 0 &&
        form.email.trim().length > 0 &&
        form.roleId > 0
      );
    }
    const hasFieldChanges =
      form.firstName.trim() !== initialForm.firstName.trim() ||
      form.lastName.trim() !== initialForm.lastName.trim() ||
      form.email.trim() !== initialForm.email.trim() ||
      form.roleId !== initialForm.roleId ||
      form.organizationId !== initialForm.organizationId ||
      form.isActive !== initialForm.isActive ||
      form.isLocked !== initialForm.isLocked;

    const hasValidRequiredFields =
      form.firstName.trim().length > 0 &&
      form.lastName.trim().length > 0 &&
      form.email.trim().length > 0 &&
      form.roleId > 0;

    return hasFieldChanges && hasValidRequiredFields;
  }, [showModal, editingId, form, initialForm]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((user) =>
      [user.firstName, user.lastName, user.email, user.role?.name, user.organization?.nickname]
        .some((value) => value?.toLowerCase().includes(q)),
    );
  }, [users, search]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [u, r, o] = await Promise.all([
        UsersService.getUsers(),
        RolesService.getRoles(),
        OrganizationsService.getOrganizations(),
      ]);
      setUsers(Array.isArray(u) ? u : []);
      setRoles(Array.isArray(r) ? r : []);
      setOrganizations(Array.isArray(o) ? o : []);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les données.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedRole = useMemo(() => {
    return roles.find((r) => r.id === form.roleId);
  }, [roles, form.roleId]);

  const isOrgRoleSelected = selectedRole?.name === 'ORGANIZATION_USER';

  const openCreateModal = () => {
    setEditingId(null);
    const defaultRoleId = roles[0]?.id ?? 0;
    const defaultRole = roles.find((r) => r.id === defaultRoleId);
    const isOrg = defaultRole?.name === 'ORGANIZATION_USER';
    const initial = {
      ...emptyForm,
      roleId: defaultRoleId,
      organizationId: isOrg ? (organizations[0]?.id ?? 0) : 0,
    };
    setForm(initial);
    setInitialForm(initial);
    setFieldErrors({});
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingId(user.id);
    const userRole = roles.find((r) => r.id === user.roleId);
    const isOrg = userRole?.name === 'ORGANIZATION_USER';
    const initial = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roleId: user.roleId,
      organizationId: isOrg ? (user.organizationId ?? 0) : 0,
      isActive: user.isActive,
      isLocked: user.isLocked,
    };
    setForm(initial);
    setInitialForm(initial);
    setFieldErrors({});
    setShowModal(true);
  };

  const handleRoleChange = (newRoleId: number) => {
    const targetRole = roles.find((r) => r.id === newRoleId);
    const isOrg = targetRole?.name === 'ORGANIZATION_USER';
    setForm((current) => ({
      ...current,
      roleId: newRoleId,
      organizationId: isOrg ? current.organizationId : 0,
    }));
  };

  const handleSave = async () => {
    setFieldErrors({});
    if (isOrgRoleSelected && (!form.organizationId || form.organizationId <= 0)) {
      setFieldErrors({ organizationId: 'Veuillez sélectionner une organisation.' });
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      organizationId: isOrgRoleSelected && form.organizationId > 0 ? form.organizationId : undefined,
    };
    try {
      const { userCreateSchema } = await import('../validation/schemas');
      const result = userCreateSchema.safeParse(payload);
      if (!result.success) {
        const fieldErrs: Record<string, string> = {};
        result.error.issues.forEach((e: any) => {
          if (e.path && e.path[0]) fieldErrs[String(e.path[0])] = e.message;
        });
        setFieldErrors(fieldErrs);
        setSaving(false);
        return;
      }

      if (editingId) {
        await UsersService.updateUser(editingId, payload);
      } else {
        await UsersService.createUser(payload as any);
      }

      setShowModal(false);
      await loadData();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message ?? 'Erreur lors de l’enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await UsersService.deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message ?? 'Suppression impossible.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-emc-primary md:text-2xl">
            Comptes utilisateurs
          </h1>
          <p className="text-xs text-slate-500 dark:text-emc-secondary md:text-sm">
            Gestion des comptes, accès et organisations rattachées.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Ajouter un utilisateur
        </button>
      </div>

      <div className="emc-card p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un utilisateur..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="emc-card overflow-hidden">
          <div className="animate-pulse divide-y divide-slate-100 dark:divide-emc-border">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 px-4 py-4">
                <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-emc-elevated" />
                <div className="h-4 w-32 rounded bg-slate-200 dark:bg-emc-elevated" />
                <div className="h-4 w-24 rounded bg-slate-200 dark:bg-emc-elevated" />
                <div className="h-4 w-28 rounded bg-slate-200 dark:bg-emc-elevated" />
              </div>
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="emc-card p-8 text-center text-sm text-slate-500 dark:text-emc-secondary">
          Aucun utilisateur ne correspond à votre recherche.
        </div>
      ) : (
        <div className="emc-card overflow-hidden">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-emc-border dark:bg-emc-elevated/40 dark:text-emc-secondary">
                <th className="px-4 py-3">Utilisateur</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">Organisation</th>
                <th className="px-4 py-3">Dernière connexion</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-emc-border">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-emc-elevated/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          user.profileImageUrl ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256'
                        }
                        alt={`${user.firstName} ${user.lastName}`}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-emc-primary">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-[11px] text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span className="rounded bg-blue-500/10 px-2 py-1 font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      {user.role?.name ?? '—'}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-emc-secondary">
                    {user.organization?.nickname ?? '—'}
                  </td>

                  <td className="px-4 py-3 text-slate-600 dark:text-emc-secondary font-mono text-[11px]">
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Jamais'}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-1 text-[10px] font-semibold ${
                        user.isActive
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-slate-500/10 text-slate-600'
                      }`}
                    >
                      {user.isActive ? 'ACTIF' : 'INACTIF'}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Modifier
                      </button>
                      <button
                        onClick={() => setDeleteTarget(user)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-emc-border dark:bg-emc-surface">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-blue-600">
                  {editingId ? 'Modifier' : 'Créer'}
                </p>
                <h2 className="text-lg font-bold text-slate-900 dark:text-emc-primary">
                  {editingId ? 'Compte utilisateur' : 'Nouvel utilisateur'}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-sm text-slate-400 hover:text-slate-700 dark:hover:text-emc-primary"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-[11px] font-medium text-slate-600 dark:text-emc-secondary">
                Prénom
                <input
                  value={form.firstName}
                  onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-blue-500 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                />
                {fieldErrors.firstName && <div className="mt-1 text-xs text-red-600">{fieldErrors.firstName}</div>}
              </label>

              <label className="text-[11px] font-medium text-slate-600 dark:text-emc-secondary">
                Nom
                <input
                  value={form.lastName}
                  onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-blue-500 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                />
                {fieldErrors.lastName && <div className="mt-1 text-xs text-red-600">{fieldErrors.lastName}</div>}
              </label>

              <label className="md:col-span-2 text-[11px] font-medium text-slate-600 dark:text-emc-secondary">
                E-mail
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-blue-500 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                />
                {fieldErrors.email && <div className="mt-1 text-xs text-red-600">{fieldErrors.email}</div>}
              </label>

              <label className="text-[11px] font-medium text-slate-600 dark:text-emc-secondary">
                Rôle
                <select
                  value={form.roleId}
                  onChange={(event) => handleRoleChange(Number(event.target.value))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-blue-500 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.roleId && <div className="mt-1 text-xs text-red-600">{fieldErrors.roleId}</div>}
              </label>

              {isOrgRoleSelected && (
                <label className="text-[11px] font-medium text-slate-600 dark:text-emc-secondary">
                  Organisation
                  <select
                    value={form.organizationId || 0}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, organizationId: Number(event.target.value) || 0 }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-blue-500 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                  >
                    <option value={0}>Sélectionner une organisation...</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.nickname} ({org.name})
                      </option>
                    ))}
                  </select>
                  {fieldErrors.organizationId && (
                    <div className="mt-1 text-xs text-red-600">{fieldErrors.organizationId}</div>
                  )}
                </label>
              )}

              <label className="flex items-center gap-2 text-[11px] font-medium text-slate-600 dark:text-emc-secondary">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                />
                Compte actif
              </label>

              <label className="flex items-center gap-2 text-[11px] font-medium text-slate-600 dark:text-emc-secondary">
                <input
                  type="checkbox"
                  checked={form.isLocked}
                  onChange={(event) => setForm((current) => ({ ...current, isLocked: event.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                />
                Compte verrouillé
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!isDirty || saving}
                className="rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving ? 'Enregistrement...' : editingId ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-emc-border dark:bg-emc-surface">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-red-600">Confirmation</p>
            <h2 className="mt-2 text-lg font-bold text-slate-900 dark:text-emc-primary">Supprimer l'utilisateur</h2>
            <p className="mt-2 text-xs text-slate-500 dark:text-emc-secondary">
              Voulez-vous vraiment supprimer <span className="font-semibold text-slate-800 dark:text-emc-primary">{deleteTarget.firstName} {deleteTarget.lastName}</span> ?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="rounded-xl bg-red-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

