import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Check, Lock, Mail, UserCircle2, Upload, X, Camera, AlertTriangle } from 'lucide-react';
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<Record<string, string>>({});

  // Form inputs state
  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
  });

  // Baseline state for dirty checking
  const [baseline, setBaseline] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    profileImageUrl: user?.profileImageUrl ?? null,
  });

  // Image Upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const syncBaseline = (userData: User) => {
    setProfile(userData);
    const b = {
      firstName: userData.firstName ?? '',
      lastName: userData.lastName ?? '',
      email: userData.email ?? '',
      profileImageUrl: userData.profileImageUrl ?? null,
    };
    setForm({
      firstName: b.firstName,
      lastName: b.lastName,
      email: b.email,
    });
    setBaseline(b);
    setImageFile(null);
    setImagePreview(null);
    setRemoveExistingImage(false);
    setImageError(null);
    setAvatarLoadError(false);
  };

  useEffect(() => {
    if (user) {
      syncBaseline(user);
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await ProfileService.getProfile();
        syncBaseline(data);
        updateUser(data);
      } catch (error) {
        console.error('Failed to load profile', error);
        setErrorMsg('Impossible de charger les données du profil.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, updateUser]);

  // Dirty state calculation
  const isDirty = useMemo(() => {
    const textChanged =
      form.firstName.trim() !== baseline.firstName ||
      form.lastName.trim() !== baseline.lastName ||
      form.email.trim().toLowerCase() !== baseline.email.toLowerCase();

    const imageFileSelected = imageFile !== null;
    const imageRemoved = removeExistingImage && Boolean(baseline.profileImageUrl);

    return textChanged || imageFileSelected || imageRemoved;
  }, [form, baseline, imageFile, removeExistingImage]);

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
    setRemoveExistingImage(false);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveExistingImage(true);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRestoreImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveExistingImage(false);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isDirty) return;

    setSaving(true);
    setSuccess(null);
    setErrorMsg(null);
    setFieldErrors({});

    try {
      const { profileSchema } = await import('../validation/schemas');
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        profileImageUrl: removeExistingImage && !imageFile ? null : undefined,
      };

      const result = profileSchema.safeParse(payload);
      if (!result.success) {
        const f: Record<string, string> = {};
        result.error.issues.forEach((e: any) => {
          if (e.path && e.path[0]) f[String(e.path[0])] = e.message;
        });
        setFieldErrors(f);
        return;
      }

      const updated = await ProfileService.updateProfile(payload, imageFile);
      syncBaseline(updated);
      updateUser(updated);
      setSuccess('Profil et image mis à jour avec succès.');
      setTimeout(() => setSuccess(null), 4000);
    } catch (error: any) {
      console.error('Profile update failed', error);
      setErrorMsg(error?.response?.data?.message ?? 'Impossible de mettre à jour votre profil.');
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
      setTimeout(() => setSuccess(null), 4000);
    } catch (error: any) {
      console.error('Password update failed', error);
      setPasswordError(error?.response?.data?.message ?? 'Le mot de passe actuel est incorrect.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const currentAvatarSrc = removeExistingImage
    ? null
    : imagePreview || profile?.profileImageUrl || null;

  const userInitials = profile
    ? `${profile.firstName?.slice(0, 1) ?? ''}${profile.lastName?.slice(0, 1) ?? ''}`.toUpperCase()
    : 'EM';

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
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-3 text-xs text-emerald-700 dark:text-emerald-300">
          <Check className="h-4 w-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-3 text-xs text-red-700 dark:text-red-300">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        {/* Left Side Avatar & Info Card */}
        <aside className="emc-card p-6 flex flex-col items-center text-center space-y-4">
          <div className="relative group">
            {currentAvatarSrc && !avatarLoadError ? (
              <img
                src={currentAvatarSrc}
                alt={`${profile?.firstName} ${profile?.lastName}`}
                onError={() => setAvatarLoadError(true)}
                className="h-28 w-28 rounded-full object-cover ring-4 ring-blue-500/20 shadow-md"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 text-2xl font-bold ring-4 ring-blue-500/20 shadow-md">
                {userInitials}
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition"
              title="Modifier la photo de profil"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-emc-primary">
              {profile ? `${profile.firstName} ${profile.lastName}` : 'Chargement...'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-emc-secondary">{profile?.email}</p>
          </div>

          {/* Action buttons for Avatar */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-emc-border bg-slate-50 dark:bg-emc-elevated text-xs font-semibold text-slate-700 dark:text-emc-primary hover:bg-slate-100 transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{currentAvatarSrc ? 'Modifier' : 'Ajouter photo'}</span>
            </button>

            {currentAvatarSrc && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-xs font-semibold text-red-600 dark:text-red-300 hover:bg-red-100 transition"
                title="Supprimer la photo"
              >
                <X className="w-3.5 h-3.5" />
                <span>Supprimer</span>
              </button>
            )}

            {removeExistingImage && (
              <button
                type="button"
                onClick={handleRestoreImage}
                className="text-xs text-blue-600 dark:text-blue-400 underline font-medium"
              >
                Rétablir
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageSelect}
            className="hidden"
          />

          {imageError && <div className="text-xs text-red-600 font-medium text-center">{imageError}</div>}

          <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-emc-border dark:bg-emc-elevated/60">
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
        </aside>

        {/* Right Side Forms */}
        <div className="space-y-6">
          {/* Profile Form */}
          <form onSubmit={handleProfileSubmit} className="emc-card p-5 md:p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-emc-border">
              <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600">
                <UserCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-emc-primary">Informations personnelles</h3>
                <p className="text-[11px] text-slate-500 dark:text-emc-secondary">
                  Mettez à jour les informations de votre compte EMC Helpline.
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

                {/* Save Modifications Button */}
                <div className="flex items-center justify-between pt-3">
                  <span className="text-[11px] text-slate-400 italic">
                    {isDirty ? 'Modifications non enregistrées' : 'Aucune modification'}
                  </span>

                  <button
                    type="submit"
                    disabled={!isDirty || saving}
                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Security & Password Form */}
          <form onSubmit={handlePasswordSubmit} className="emc-card p-5 md:p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-emc-border">
              <div className="rounded-lg bg-purple-500/10 p-2 text-purple-600">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-emc-primary">Sécurité & Mot de passe</h3>
                <p className="text-[11px] text-slate-500 dark:text-emc-secondary">
                  Modifiez votre mot de passe pour sécuriser votre compte.
                </p>
              </div>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs">
                {passwordError}
              </div>
            )}

            <div className="space-y-4">
              <label className="block text-[11px] font-medium text-slate-600 dark:text-emc-secondary">
                Mot de passe actuel
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((c) => ({ ...c, currentPassword: e.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                />
                {passwordFieldErrors.currentPassword && (
                  <div className="mt-1 text-xs text-red-600">{passwordFieldErrors.currentPassword}</div>
                )}
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-[11px] font-medium text-slate-600 dark:text-emc-secondary">
                  Nouveau mot de passe
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((c) => ({ ...c, newPassword: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                  />
                  {passwordFieldErrors.newPassword && (
                    <div className="mt-1 text-xs text-red-600">{passwordFieldErrors.newPassword}</div>
                  )}
                </label>

                <label className="block text-[11px] font-medium text-slate-600 dark:text-emc-secondary">
                  Confirmer le mot de passe
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((c) => ({ ...c, confirmPassword: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-emc-border dark:bg-emc-elevated dark:text-emc-primary"
                  />
                  {passwordFieldErrors.confirmPassword && (
                    <div className="mt-1 text-xs text-red-600">{passwordFieldErrors.confirmPassword}</div>
                  )}
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={passwordSaving || !passwordForm.currentPassword || !passwordForm.newPassword}
                  className="rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  {passwordSaving ? 'Mise à jour...' : 'Changer le mot de passe'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
