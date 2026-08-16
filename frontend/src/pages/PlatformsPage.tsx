import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Globe, Mail, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import type { Platform } from '../types';
import { PlatformsService } from '../services/platforms.service';

const emptyForm = {
  name: '',
  email: '',
  icon: '',
};

export const PlatformsPage: React.FC = () => {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Platform | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return platforms.filter((platform) =>
      [platform.name, platform.email, platform.icon].some((value) => value?.toLowerCase().includes(q)),
    );
  }, [platforms, search]);

  const total = filtered.length;
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, total);
  const paginated = filtered.slice(startIndex, endIndex);

  const loadPlatforms = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await PlatformsService.getPlatforms();
      setPlatforms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les plateformes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlatforms();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const q = search.trim();
      if (!q) {
        loadPlatforms();
        return;
      }

      setPlatforms((current) => current.filter((platform) =>
        [platform.name, platform.email].some((value) => value.toLowerCase().includes(q.toLowerCase())),
      ));
    }, 200);

    return () => window.clearTimeout(timeout);
  }, [search]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIconFile(null);
    setIconPreview(null);
    setShowModal(true);
  };

  const openEditModal = (platform: Platform) => {
    setEditingId(platform.id);
    setForm({
      name: platform.name,
      email: platform.email,
      icon: platform.icon ?? '',
    });
    setIconFile(null);
    if (platform.icon && (platform.icon.startsWith('http') || platform.icon.startsWith('data:'))) {
      setIconPreview(platform.icon);
    } else {
      setIconPreview(null);
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    setFieldErrors({});
    // If an image file is selected, send FormData. Otherwise send JSON payload.
    const payloadJson = { ...form, icon: form.icon === '' ? undefined : form.icon } as any;
    try {
      const { platformSchema } = await import('../validation/schemas');
      // If using file upload, skip icon validation (file will be uploaded separately)
      const toValidate = iconFile ? { name: payloadJson.name, email: payloadJson.email } : payloadJson;
      const result = platformSchema.safeParse(toValidate as any);
      if (!result.success) {
        const fieldErrs: Record<string, string> = {};
        result.error.issues.forEach((e: any) => {
          if (e.path && e.path[0]) fieldErrs[String(e.path[0])] = e.message;
        });
        setFieldErrors(fieldErrs);
        return;
      }

      // If a file is selected, validate its type/size and send FormData
      if (iconFile) {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowed.includes(iconFile.type)) {
          setFieldErrors({ icon: 'Type de fichier non supporté. Utilisez JPG, PNG ou WEBP.' });
          return;
        }
        if (iconFile.size > 5 * 1024 * 1024) {
          setFieldErrors({ icon: 'L’image dépasse la taille maximale de 5MB.' });
          return;
        }

        const formData = new FormData();
        formData.append('name', payloadJson.name);
        formData.append('email', payloadJson.email);
        formData.append('icon', iconFile, iconFile.name);

        if (editingId) {
          await PlatformsService.updatePlatform(editingId, formData);
        } else {
          await PlatformsService.createPlatform(formData);
        }
      } else {
        if (editingId) {
          await PlatformsService.updatePlatform(editingId, payloadJson);
        } else {
          await PlatformsService.createPlatform(payloadJson);
        }
      }

      setShowModal(false);
      setForm(emptyForm);
      await loadPlatforms();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message ?? 'Erreur lors de l’enregistrement.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await PlatformsService.deletePlatform(deleteTarget.id);
      setDeleteTarget(null);
      await loadPlatforms();
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
            Plateformes sociales
          </h1>
          <p className="text-xs text-slate-500 dark:text-emc-secondary md:text-sm">
            Canaux de conformité et réseaux ciblés pour les demandes de retrait de contenus.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Ajouter une plateforme
        </button>
      </div>

      <div className="emc-card p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher une plateforme..."
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
              <div className="h-3 w-4/5 rounded bg-slate-200 dark:bg-emc-elevated" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="emc-card p-8 text-center text-sm text-slate-500 dark:text-emc-secondary">
          Aucune plateforme ne correspond à votre recherche.
        </div>
      ) : (
        <>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {paginated.map((platform) => (
            <div key={platform.id} className="emc-card p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-white p-2 shadow-sm h-16 w-16 flex items-center justify-center overflow-hidden">
                    {platform.icon ? (
                      <img src={platform.icon} alt={`${platform.name} logo`} className="h-full w-full object-cover rounded-lg" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-blue-600 dark:text-blue-400">
                        <Globe className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-emc-primary">{platform.name}</h3>
                    <span className="text-[11px] text-slate-400">ID #{platform.id}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-xs dark:bg-emc-elevated/60">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Contact de suppression</div>
                <div className="mt-2 flex items-center gap-2 font-mono text-slate-700 dark:text-emc-secondary">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span className="truncate">{platform.email}</span>
                </div>
              </div>

              

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => openEditModal(platform)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Modifier
                </button>
                <button
                  onClick={() => setDeleteTarget(platform)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Affichage de {startIndex + 1} à {endIndex} sur {total} plateformes
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="rounded-md border px-2 py-1 text-xs"
              >
                ←
              </button>
              <div className="px-2 text-xs">{currentPage}</div>
              <button
                disabled={endIndex >= total}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="rounded-md border px-2 py-1 text-xs"
              >
                →
              </button>
            </div>
            <select className="rounded-xl border px-2 py-1 text-xs" value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}>
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
            </select>
          </div>
        </div>
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-emc-border dark:bg-emc-surface">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-blue-600">
                  {editingId ? 'Modifier' : 'Créer'}
                </p>
                <h2 className="text-lg font-bold text-slate-900 dark:text-emc-primary">
                  {editingId ? 'Plateforme' : 'Nouvelle plateforme'}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-sm text-slate-400 hover:text-slate-700 dark:hover:text-emc-primary"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-emc-secondary">Nom</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
                    placeholder="Ex: Twitter"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                  />
                  {fieldErrors.name && <div className="mt-1 text-xs text-red-600">{fieldErrors.name}</div>}
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-emc-secondary">E-mail de contact</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
                    placeholder="support@platform.com"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                  />
                  {fieldErrors.email && <div className="mt-1 text-xs text-red-600">{fieldErrors.email}</div>}
                </div>

                {/* remarks removed by design */}
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-emc-secondary">Icône de la plateforme</label>
                <div className="mt-2 flex flex-col items-center gap-3">
                  <div className="h-36 w-36 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                    {iconPreview || (form.icon && (form.icon.startsWith('http') || form.icon.startsWith('data:'))) ? (
                      <img src={iconPreview ?? form.icon} alt="Aperçu icône" className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-slate-400 text-xs text-center px-3">Aucune icône sélectionnée</div>
                    )}
                  </div>

                  <div className="flex w-full items-center gap-2">
                    <label className="flex-1">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                          const f = e.target.files?.[0] ?? null;
                          setIconFile(f);
                          if (f) {
                            setIconPreview(URL.createObjectURL(f));
                            setForm((c) => ({ ...c, icon: '' }));
                          } else {
                            setIconPreview(null);
                          }
                        }}
                        className="hidden"
                        id="platform-icon-input"
                      />
                      <label htmlFor="platform-icon-input" className="cursor-pointer inline-flex w-full items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        Choisir une image
                      </label>
                    </label>
                    { (iconPreview || form.icon) && (
                      <button type="button" onClick={() => { setIconFile(null); setIconPreview(null); setForm((c)=>({ ...c, icon: null as any })); }} className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-600">Supprimer</button>
                    )}
                  </div>

                  <div className="text-xs text-slate-500">Formats: JPG, PNG, WEBP — max 5MB.</div>
                  {fieldErrors.icon && <div className="mt-1 text-xs text-red-600">{fieldErrors.icon}</div>}
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                {editingId ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-emc-border dark:bg-emc-surface">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-red-600">Confirmation</p>
            <h2 className="mt-2 text-lg font-bold text-slate-900 dark:text-emc-primary">Supprimer la plateforme</h2>
            <p className="mt-2 text-xs text-slate-500 dark:text-emc-secondary">
              Voulez-vous vraiment supprimer <span className="font-semibold text-slate-800 dark:text-emc-primary">{deleteTarget.name}</span> ?
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

