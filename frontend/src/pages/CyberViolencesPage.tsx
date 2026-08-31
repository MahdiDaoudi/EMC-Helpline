import React, { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  X,
  Shield,
  Check,
  Loader2,
} from 'lucide-react';
import { CyberViolencesService, type CyberViolenceWithCount } from '../services/cyberViolences.service';
import { TableSkeleton } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';

import { useAuth } from '../context/AuthContext';

/* ─── Modal Types ─────────────────────────────────────────────────── */
type ModalState =
  | { type: 'none' }
  | { type: 'add' }
  | { type: 'edit'; item: CyberViolenceWithCount }
  | { type: 'delete'; item: CyberViolenceWithCount };

/* ─── Small reusable Toast ────────────────────────────────────────── */
interface ToastProps {
  message: string;
  kind: 'success' | 'error';
  onClose: () => void;
}
const Toast: React.FC<ToastProps> = ({ message, kind, onClose }) => (
  <div
    className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border text-sm font-medium transition-all animate-in slide-in-from-bottom-4 duration-300 ${
      kind === 'success'
        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
        : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-700 text-rose-700 dark:text-rose-300'
    }`}
  >
    {kind === 'success' ? (
      <Check className="w-4 h-4 flex-shrink-0" />
    ) : (
      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
    )}
    <span>{message}</span>
    <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition">
      <X className="w-4 h-4" />
    </button>
  </div>
);

/* ─── Main Page ───────────────────────────────────────────────────── */
export const CyberViolencesPage: React.FC = () => {
  const { user } = useAuth();
  const isTechnician = user?.role?.name === 'TECHNICIAN';
  const [items, setItems] = useState<CyberViolenceWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<ModalState>({ type: 'none' });

  // Form state
  const [formName, setFormName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; kind: 'success' | 'error' } | null>(null);

  /* ── Data Loading ── */
  const load = async () => {
    setLoading(true);
    try {
      const data = await CyberViolencesService.getAll();
      setItems(data);
    } catch {
      showToast('Impossible de charger les types de cyberviolence.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  /* ── Toast Helper ── */
  const showToast = (message: string, kind: 'success' | 'error') => {
    setToast({ message, kind });
    setTimeout(() => setToast(null), 4000);
  };

  /* ── Modal Open Helpers ── */
  const openAdd = () => {
    setFormName('');
    setFormError(null);
    setModal({ type: 'add' });
  };

  const openEdit = (item: CyberViolenceWithCount) => {
    setFormName(item.name);
    setFormError(null);
    setModal({ type: 'edit', item });
  };

  const openDelete = (item: CyberViolenceWithCount) => {
    setModal({ type: 'delete', item });
  };

  const closeModal = () => {
    setModal({ type: 'none' });
    setFormName('');
    setFormError(null);
    setSubmitting(false);
  };

  /* ── Submit Add ── */
  const handleAdd = async () => {
    const name = formName.trim();
    if (!name) {
      setFormError('Le nom ne peut pas être vide.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const created = await CyberViolencesService.create(name);
      setItems((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      showToast(`"${created.name}" a été ajouté avec succès.`, 'success');
      closeModal();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Une erreur est survenue.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Submit Edit ── */
  const handleEdit = async () => {
    if (modal.type !== 'edit') return;
    const name = formName.trim();
    if (!name) {
      setFormError('Le nom ne peut pas être vide.');
      return;
    }
    if (name === modal.item.name) {
      closeModal();
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const updated = await CyberViolencesService.update(modal.item.id, name);
      setItems((prev) =>
        prev.map((i) => (i.id === updated.id ? { ...updated, _count: i._count } : i)).sort((a, b) => a.name.localeCompare(b.name))
      );
      showToast(`"${updated.name}" a été mis à jour.`, 'success');
      closeModal();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Une erreur est survenue.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Confirm Delete ── */
  const handleDelete = async () => {
    if (modal.type !== 'delete') return;
    setSubmitting(true);
    try {
      await CyberViolencesService.delete(modal.item.id);
      setItems((prev) => prev.filter((i) => i.id !== modal.item.id));
      showToast(`"${modal.item.name}" a été supprimé.`, 'success');
      closeModal();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Impossible de supprimer ce type.';
      showToast(msg, 'error');
      closeModal();
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Filtered items ── */
  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  /* ─── Render ───────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-emc-primary">
            Types de Cyberviolence
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-emc-secondary">
            Gérez le référentiel des catégories de cyberviolence utilisées dans les signalements.
          </p>
        </div>

        {!isTechnician && (
          <button
            id="cyberviolence-add-btn"
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Ajouter un type
          </button>
        )}
      </div>

      {/* Search + Summary Bar */}
      <div className="emc-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            id="cyberviolence-search"
            type="text"
            placeholder="Rechercher par nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border-strong text-slate-900 dark:text-emc-primary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <span className="text-xs text-slate-500 dark:text-emc-secondary font-medium whitespace-nowrap">
          {filtered.length} type{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={8} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Aucun type trouvé"
          description={search ? `Aucun type ne correspond à "${search}".` : 'Aucun type de cyberviolence n\'a encore été créé.'}
          actionLabel={search ? 'Réinitialiser la recherche' : 'Ajouter un type'}
          onAction={search ? () => setSearch('') : openAdd}
        />
      ) : (
        <div className="emc-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/60 dark:bg-emc-elevated/40 border-b border-slate-200 dark:border-emc-border text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-16">#</th>
                  <th className="py-3 px-4">Nom du type</th>
                  <th className="py-3 px-4 text-center">Signalements associés</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-emc-border/60 text-xs">
                {filtered.map((item, idx) => {
                  const count = item._count?.signalement ?? 0;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-emc-elevated/50 transition-colors group"
                    >
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="font-semibold text-slate-900 dark:text-emc-primary">
                            {item.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            count > 0
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                              : 'bg-slate-100 dark:bg-emc-elevated text-slate-500 dark:text-emc-secondary border-slate-200 dark:border-emc-border'
                          }`}
                        >
                          {count} signalement{count > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {!isTechnician && (
                          <div className="flex items-center justify-end gap-2 transition-opacity">
                            <button
                              id={`edit-cyberviolence-${item.id}`}
                              onClick={() => openEdit(item)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-emc-secondary hover:bg-slate-100 dark:hover:bg-emc-elevated border border-slate-200 dark:border-emc-border transition"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Modifier
                            </button>
                            <button
                              id={`delete-cyberviolence-${item.id}`}
                              onClick={() => openDelete(item)}
                              disabled={count > 0}
                              title={count > 0 ? `Impossible — ${count} signalement${count > 1 ? 's' : ''} lié${count > 1 ? 's' : ''}` : 'Supprimer'}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 transition disabled:opacity-40 disabled:pointer-events-none"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Supprimer
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-4 py-3 border-t border-slate-200 dark:border-emc-border bg-slate-50/60 dark:bg-emc-elevated/30 text-xs text-slate-500 dark:text-emc-secondary flex items-center justify-between">
            <span>
              <span className="font-bold text-slate-700 dark:text-emc-primary">{filtered.length}</span>{' '}
              type{filtered.length > 1 ? 's' : ''} de cyberviolence
              {search && ` correspondant à "${search}"`}
            </span>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── Add / Edit Modal ─────────────────────────────────────── */}
      {(modal.type === 'add' || modal.type === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-emc-sidebar border border-slate-200 dark:border-emc-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-emc-border/60 bg-slate-50/50 dark:bg-emc-elevated/30">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
                  {modal.type === 'add' ? (
                    <Plus className="w-5 h-5" />
                  ) : (
                    <Pencil className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-emc-primary">
                    {modal.type === 'add' ? 'Ajouter un type' : 'Modifier le type'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-emc-secondary">
                    {modal.type === 'add'
                      ? 'Saisir le nom du nouveau type de cyberviolence.'
                      : `Modifier "${modal.item.name}".`}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-emc-primary hover:bg-slate-100 dark:hover:bg-emc-elevated transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="cyberviolence-name-input"
                  className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-emc-secondary"
                >
                  Nom du type <span className="text-rose-500">*</span>
                </label>
                <input
                  id="cyberviolence-name-input"
                  type="text"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    setFormError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      void (modal.type === 'add' ? handleAdd() : handleEdit());
                    }
                  }}
                  placeholder="ex. Cyberharcèlement, Chantage, Diffamation..."
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border-strong text-slate-900 dark:text-emc-primary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formError && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mt-1">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    {formError}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 p-5 border-t border-slate-100 dark:border-emc-border/60 bg-slate-50/50 dark:bg-emc-elevated/20">
              <button
                onClick={closeModal}
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-emc-elevated text-slate-800 dark:text-emc-primary hover:bg-slate-300 dark:hover:bg-emc-border transition"
              >
                Annuler
              </button>
              <button
                id="cyberviolence-submit-btn"
                onClick={() => void (modal.type === 'add' ? handleAdd() : handleEdit())}
                disabled={submitting || !formName.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition disabled:opacity-50 disabled:pointer-events-none shadow-sm"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {modal.type === 'add' ? 'Ajouter' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm Modal ─────────────────────────────────── */}
      {modal.type === 'delete' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-emc-sidebar border border-slate-200 dark:border-emc-border rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center gap-3 p-5 border-b border-slate-100 dark:border-emc-border/60 bg-rose-50/60 dark:bg-rose-950/20">
              <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-emc-primary">
                  Confirmer la suppression
                </h2>
                <p className="text-xs text-slate-500 dark:text-emc-secondary">
                  Cette action est irréversible.
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-5">
              <p className="text-sm text-slate-700 dark:text-emc-secondary">
                Voulez-vous vraiment supprimer le type{' '}
                <span className="font-bold text-slate-900 dark:text-emc-primary">
                  &ldquo;{modal.item.name}&rdquo;
                </span>{' '}?
              </p>
              {(modal.item._count?.signalement ?? 0) > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Ce type est lié à{' '}
                    <strong>{modal.item._count?.signalement}</strong>{' '}
                    signalement{(modal.item._count?.signalement ?? 0) > 1 ? 's' : ''}.
                    La suppression sera bloquée par le serveur.
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2.5 p-5 border-t border-slate-100 dark:border-emc-border/60 bg-slate-50/50 dark:bg-emc-elevated/20">
              <button
                onClick={closeModal}
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-emc-elevated text-slate-800 dark:text-emc-primary hover:bg-slate-300 dark:hover:bg-emc-border transition"
              >
                Annuler
              </button>
              <button
                id="cyberviolence-confirm-delete-btn"
                onClick={() => void handleDelete()}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 transition disabled:opacity-50 disabled:pointer-events-none shadow-sm"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          kind={toast.kind}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
