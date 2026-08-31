import React, { useEffect, useMemo, useState, useRef } from 'react';
import { AlertTriangle, Building2, Mail, Pencil, Plus, Search, Trash2, Users, Upload, X, ImageIcon } from 'lucide-react';
import type { Organization } from '../types';
import { OrganizationsService } from '../services/organizations.service';

import { useAuth } from '../context/AuthContext';

const CATEGORY_LABELS: Record<string, string> = {
  JURIDIQUE: 'Juridique',
  PSYCHIQUE: 'Psychique',
};

const CATEGORY_STYLES: Record<string, string> = {
  JURIDIQUE: 'rounded-full bg-blue-500/10 px-2 py-1 text-[10px] font-semibold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  PSYCHIQUE: 'rounded-full bg-violet-500/10 px-2 py-1 text-[10px] font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
};

const emptyForm = {
  nickname: '',
  name: '',
  category: '' as 'JURIDIQUE' | 'PSYCHIQUE' | '',
  email: '',
  website: '',
  description: '',
};

export const OrganizationsPage: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role?.name === 'SUPER_ADMIN';

  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [initialForm, setInitialForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [initialExistingImageUrl, setInitialExistingImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Organization | null>(null);

  const isDirty = useMemo(() => {
    if (!showModal) return false;
    if (editingId === null) {
      return (
        form.nickname.trim().length > 0 &&
        form.name.trim().length > 0 &&
        form.category !== '' &&
        form.email.trim().length > 0
      );
    }
    const hasFieldChanges =
      form.nickname.trim() !== initialForm.nickname.trim() ||
      form.name.trim() !== initialForm.name.trim() ||
      form.category !== initialForm.category ||
      form.email.trim() !== initialForm.email.trim() ||
      form.website.trim() !== initialForm.website.trim() ||
      form.description.trim() !== initialForm.description.trim() ||
      imageFile !== null ||
      existingImageUrl !== initialExistingImageUrl;

    const hasValidRequiredFields =
      form.nickname.trim().length > 0 &&
      form.name.trim().length > 0 &&
      form.category !== '' &&
      form.email.trim().length > 0;

    return hasFieldChanges && hasValidRequiredFields;
  }, [showModal, editingId, form, initialForm, imageFile, existingImageUrl, initialExistingImageUrl]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orgs.filter((org) =>
      [org.nickname, org.name, org.email, org.description].some((value) =>
        value?.toLowerCase().includes(q),
      ),
    );
  }, [orgs, search]);

  const loadOrganizations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await OrganizationsService.getOrganizations();
      setOrgs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les organismes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadOrganizations();
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [search]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setInitialForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
    setInitialExistingImageUrl(null);
    setImageError(null);
    setFieldErrors({});
    setShowModal(true);
  };

  const openEditModal = (org: Organization) => {
    setEditingId(org.id);
    const initial = {
      nickname: org.nickname,
      name: org.name,
      category: org.category,
      email: org.email,
      website: org.website ?? '',
      description: org.description ?? '',
    };
    setForm(initial);
    setInitialForm(initial);
    setImageFile(null);
    setImagePreview(null);
    const initialImg = org.image ?? null;
    setExistingImageUrl(initialImg);
    setInitialExistingImageUrl(initialImg);
    setImageError(null);
    setFieldErrors({});
    setShowModal(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setImageError('Veuillez sélectionner une image valide (JPEG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError('Le fichier ne doit pas dépasser 5 Mo.');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    setFieldErrors({});
    setImageError(null);
    setSaving(true);

    const payload = {
      ...form,
      category: form.category || undefined,
      website: form.website || undefined,
      image: existingImageUrl === null && !imageFile ? null : undefined,
    };

    try {
      const { organizationSchema } = await import('../validation/schemas');
      const result = organizationSchema.safeParse(payload);
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
        await OrganizationsService.updateOrganization(editingId, payload as any, imageFile);
      } else {
        await OrganizationsService.createOrganization(payload as any, imageFile);
      }

      setShowModal(false);
      setForm(emptyForm);
      setImageFile(null);
      setImagePreview(null);
      await loadOrganizations();
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
      await OrganizationsService.deleteOrganization(deleteTarget.id);
      setDeleteTarget(null);
      await loadOrganizations();
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
            Organisations partenaires
          </h1>
          <p className="text-xs text-slate-500 dark:text-emc-secondary md:text-sm">
            Partenaires institutionnels et ONG prenant en charge les signalements.
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Nouvelle organisation
          </button>
        )}
      </div>

      <div className="emc-card p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher une organisation..."
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="emc-card p-5 animate-pulse space-y-3">
              <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-emc-elevated" />
              <div className="h-4 w-28 rounded bg-slate-200 dark:bg-emc-elevated" />
              <div className="h-3 w-full rounded bg-slate-200 dark:bg-emc-elevated" />
              <div className="h-3 w-3/4 rounded bg-slate-200 dark:bg-emc-elevated" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="emc-card p-8 text-center text-sm text-slate-500 dark:text-emc-secondary">
          Aucune organisation ne correspond à votre recherche.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((org) => {
            const orgDisplayImage = org.image;

            return (
              <div key={org.id} className="emc-card p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {orgDisplayImage ? (
                      <img
                        src={orgDisplayImage}
                        alt={org.name}
                        className="h-11 w-11 rounded-xl object-cover ring-2 ring-slate-200 dark:ring-emc-border"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
                        {org.nickname ? org.nickname.slice(0, 3) : <Building2 className="h-5 w-5" />}
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-emc-primary">{org.nickname}</h3>
                      <span className="text-[10px] text-slate-400">Org #{org.id}</span>
                    </div>
                  </div>
                  <span className={CATEGORY_STYLES[org.category] || 'rounded-full bg-slate-500/10 px-2 py-1 text-[10px] font-semibold text-slate-600'}>
                    {CATEGORY_LABELS[org.category] || org.category}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-700 dark:text-emc-primary">{org.name}</p>
                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-emc-secondary">{org.description || 'Aucune description disponible.'}</p>
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-emc-border dark:text-emc-secondary">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate">{org.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <span>{org.userCount ?? 0} intervenants</span>
                  </div>
                </div>

                {isSuperAdmin && (
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => openEditModal(org)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Modifier
                    </button>
                    <button
                      onClick={() => setDeleteTarget(org)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-emc-border dark:bg-emc-surface max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-blue-600">
                  {editingId ? 'Modifier' : 'Créer'}
                </p>
                <h2 className="text-lg font-bold text-slate-900 dark:text-emc-primary">
                  {editingId ? 'Organisation' : 'Nouvelle organisation'}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-sm text-slate-400 hover:text-slate-700 dark:hover:text-emc-primary"
              >
                ✕
              </button>
            </div>

            {/* Image / Logo Upload Section */}
            <div className="mb-4 p-3 rounded-xl bg-slate-50 dark:bg-emc-elevated/50 border border-slate-200 dark:border-emc-border space-y-2">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-emc-primary">
                Logo / Image de l'organisation
              </label>

              <div className="flex items-center gap-4">
                {imagePreview || existingImageUrl ? (
                  <div className="relative">
                    <img
                      src={imagePreview || existingImageUrl || ''}
                      alt="Aperçu logo"
                      className="h-16 w-16 rounded-xl object-cover ring-2 ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700"
                      title="Supprimer l'image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-200 dark:bg-emc-elevated text-slate-400">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}

                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600/10 text-blue-600 hover:bg-blue-600/20 dark:text-blue-400 transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{imagePreview || existingImageUrl ? 'Changer l\'image' : 'Sélectionner une image'}</span>
                  </button>
                  <p className="text-[10px] text-slate-400">Formats supportés: PNG, JPG, WEBP (Max 5 Mo)</p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              {imageError && <div className="text-xs text-red-600 font-medium">{imageError}</div>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-[11px] font-medium text-slate-600 dark:text-emc-secondary">
                Surnom (Sigle)
                <input
                  value={form.nickname}
                  onChange={(event) => setForm((current) => ({ ...current, nickname: event.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-blue-500 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                />
                {fieldErrors.nickname && <div className="mt-1 text-xs text-red-600">{fieldErrors.nickname}</div>}
              </label>
              <label className="text-[11px] font-medium text-slate-600 dark:text-emc-secondary">
                Nom officiel
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-blue-500 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                />
                {fieldErrors.name && <div className="mt-1 text-xs text-red-600">{fieldErrors.name}</div>}
              </label>
              <label className="md:col-span-2 text-[11px] font-medium text-slate-600 dark:text-emc-secondary">
                Catégorie d'accompagnement
                <select
                  value={form.category}
                  onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as 'JURIDIQUE' | 'PSYCHIQUE' }))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-blue-500 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                >
                  <option value="">Sélectionner une catégorie</option>
                  <option value="JURIDIQUE">Juridique</option>
                  <option value="PSYCHIQUE">Psychique</option>
                </select>
                {fieldErrors.category && <div className="mt-1 text-xs text-red-600">{fieldErrors.category}</div>}
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
              <label className="md:col-span-2 text-[11px] font-medium text-slate-600 dark:text-emc-secondary">
                Site web
                <input
                  value={form.website}
                  onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-blue-500 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                />
                {fieldErrors.website && <div className="mt-1 text-xs text-red-600">{fieldErrors.website}</div>}
              </label>
              <label className="md:col-span-2 text-[11px] font-medium text-slate-600 dark:text-emc-secondary">
                Description
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-blue-500 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                />
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
            <h2 className="mt-2 text-lg font-bold text-slate-900 dark:text-emc-primary">Supprimer l'organisation</h2>
            <p className="mt-2 text-xs text-slate-500 dark:text-emc-secondary">
              Voulez-vous vraiment supprimer <span className="font-semibold text-slate-800 dark:text-emc-primary">{deleteTarget.nickname}</span> ?
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
