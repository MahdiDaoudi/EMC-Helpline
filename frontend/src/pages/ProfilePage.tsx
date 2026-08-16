import React, { useEffect, useState } from 'react';
import { Check, Lock, Mail, ShieldCheck, UserCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ProfileService } from '../services/profile.service';
import type { User } from '../types';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(user ?? null);
  const [loading, setLoading] = useState(!user);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setProfile(user);
      setForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await ProfileService.getProfile();
        setProfile(data);
        setForm({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
        });
        updateUser(data);
      } catch (error) {
        console.error('Failed to load profile', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, updateUser]);

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setSuccess(null);
    setFieldErrors({});
    try {
      const { profileSchema } = await import('../validation/schemas');
      const payload = { firstName: form.firstName, lastName: form.lastName, email: form.email };
      const result = profileSchema.safeParse(payload);
      if (!result.success) {
        const f: Record<string, string> = {};
        result.error.issues.forEach((e: any) => {
          if (e.path && e.path[0]) f[String(e.path[0])] = e.message;
        });
        setFieldErrors(f);
        return;
      }

      const updated = await ProfileService.updateProfile(payload);
      setProfile(updated);
      updateUser(updated);
      setSuccess('Profil mis à jour avec succès.');
    } catch (error: any) {
      console.error('Profile update failed', error);
      setSuccess(error?.response?.data?.message ?? 'Impossible de mettre à jour votre profil.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError(null);
    setSuccess(null);
    setPasswordFieldErrors({});
    try {
      const { changePasswordSchema } = await import('../validation/schemas');
      const payload = {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      };
      const result = changePasswordSchema.safeParse(payload);
      if (!result.success) {
        const f: Record<string, string> = {};
        result.error.issues.forEach((e: any) => {
          if (e.path && e.path[0]) f[String(e.path[0])] = e.message;
        });
        setPasswordFieldErrors(f);
        return;
      }

      setPasswordSaving(true);
      await ProfileService.changePassword(payload);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Mot de passe mis à jour avec succès.');
    } catch (error: any) {
      console.error('Password update failed', error);
      setPasswordError(error?.response?.data?.message ?? 'Le mot de passe actuel est incorrect.');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
            Mon profil
          </p>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-emc-primary">
            Gestion du compte
          </h1>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-700 dark:text-emerald-300">
          <Check className="h-4 w-4" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="emc-card p-5">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              {profile?.profileImageUrl ? (
                <img
                  src={profile.profileImageUrl}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-blue-500/10"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 ring-4 ring-blue-500/10">
                  <UserCircle2 className="h-12 w-12" />
                </div>
              )}
            </div>

            <div className="mt-4 space-y-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-emc-primary">
                {profile ? `${profile.firstName} ${profile.lastName}` : 'Chargement...'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-emc-secondary">{profile?.email}</p>
            </div>

            <div className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-emc-border dark:bg-emc-elevated/60">
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-emc-secondary">
                <span>Rôle</span>
                <span className="font-semibold text-slate-800 dark:text-emc-primary">{profile?.role?.name ?? '—'}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-emc-secondary">
                <span>Organisation</span>
                <span className="font-semibold text-slate-800 dark:text-emc-primary">
                  {profile?.organization?.nickname ?? '—'}
                </span>
              </div>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <form onSubmit={handleProfileSubmit} className="emc-card p-5 md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600">
                <UserCircle2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-emc-primary">Informations personnelles</h3>
                <p className="text-[11px] text-slate-500 dark:text-emc-secondary">
                  Mettez à jour les informations visibles dans votre profil EMC Helpline.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                <div className="h-10 animate-pulse rounded-lg bg-slate-200 dark:bg-emc-elevated" />
                <div className="h-10 animate-pulse rounded-lg bg-slate-200 dark:bg-emc-elevated" />
                <div className="h-10 animate-pulse rounded-lg bg-slate-200 dark:bg-emc-elevated" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-emc-secondary">
                    Prénom
                    <input
                      value={form.firstName}
                      onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                    />
                    {fieldErrors.firstName && <div className="mt-1 text-xs text-red-600">{fieldErrors.firstName}</div>}
                  </label>

                  <label className="block text-[11px] font-medium text-slate-600 dark:text-emc-secondary">
                    Nom
                    <input
                      value={form.lastName}
                      onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                    />
                    {fieldErrors.lastName && <div className="mt-1 text-xs text-red-600">{fieldErrors.lastName}</div>}
                  </label>
                </div>

                <label className="block text-[11px] font-medium text-slate-600 dark:text-emc-secondary">
                  Adresse e-mail
                  <div className="relative mt-1.5">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                    />
                    {fieldErrors.email && <div className="mt-1 text-xs text-red-600">{fieldErrors.email}</div>}
                  </div>
                </label>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <form onSubmit={handlePasswordSubmit} className="emc-card p-5 md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-emc-primary">Sécurité du compte</h3>
                <p className="text-[11px] text-slate-500 dark:text-emc-secondary">
                  Changez votre mot de passe pour sécuriser votre accès au tableau de bord.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[11px] font-medium text-slate-600 dark:text-emc-secondary">
                Mot de passe actuel
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                  />
                  {passwordFieldErrors.currentPassword && <div className="mt-1 text-xs text-red-600">{passwordFieldErrors.currentPassword}</div>}
                </div>
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-[11px] font-medium text-slate-600 dark:text-emc-secondary">
                  Nouveau mot de passe
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                  />
                  {passwordFieldErrors.newPassword && <div className="mt-1 text-xs text-red-600">{passwordFieldErrors.newPassword}</div>}
                </label>

                <label className="block text-[11px] font-medium text-slate-600 dark:text-emc-secondary">
                  Confirmer le mot de passe
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                  />
                  {passwordFieldErrors.confirmPassword && <div className="mt-1 text-xs text-red-600">{passwordFieldErrors.confirmPassword}</div>}
                </label>
              </div>

              {passwordError && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-[11px] text-red-700 dark:text-red-300">
                  {passwordError}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emc-primary dark:text-slate-900 dark:hover:bg-white"
                >
                  {passwordSaving ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
