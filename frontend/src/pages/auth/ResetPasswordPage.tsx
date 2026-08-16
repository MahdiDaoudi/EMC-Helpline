import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { PasswordStrength } from '../../components/auth/PasswordStrength';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const isInvalidToken = !token || token === 'expired' || token === 'invalid';

  const validate = () => {
    let valid = true;
    setPasswordError('');
    setConfirmError('');

    if (!password) {
      setPasswordError('Le nouveau mot de passe est obligatoire.');
      valid = false;
    } else if (password.length < 8) {
      setPasswordError('Le mot de passe doit contenir au moins 8 caractères.');
      valid = false;
    }

    if (password !== confirmPassword) {
      setConfirmError('Les mots de passe ne correspondent pas.');
      valid = false;
    }

    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setResetSuccess(true);
    }, 1000);
  };

  if (isInvalidToken) {
    return (
      <div className="space-y-5 text-center">
        <div className="w-11 h-11 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-emc-primary">
            Lien expiré ou invalide
          </h2>
          <p className="text-sm text-slate-500 dark:text-emc-secondary mt-2 leading-relaxed">
            Ce lien de réinitialisation n&apos;est plus valide, a déjà été utilisé ou a expiré.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <Link
            to="/forgot-password"
            className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors block"
          >
            Demander un nouveau lien
          </Link>
          <Link
            to="/login"
            className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-slate-700 dark:text-emc-secondary hover:bg-slate-50 dark:hover:bg-emc-elevated transition-colors block"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="space-y-5 text-center">
        <div className="w-11 h-11 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-emc-primary">
            Mot de passe réinitialisé
          </h2>
          <p className="text-sm text-slate-500 dark:text-emc-secondary mt-2 leading-relaxed">
            Vos identifiants ont été mis à jour. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
          </p>
        </div>

        <Link
          to="/login"
          className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors block"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-emc-primary">
          Réinitialiser le mot de passe
        </h2>
        <p className="text-sm text-slate-500 dark:text-emc-secondary mt-1">
          Choisissez un mot de passe sécurisé pour votre compte EMC Helpline.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordInput
          id="new-password"
          label="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={passwordError}
        />

        <PasswordStrength password={password} />

        <PasswordInput
          id="confirm-password"
          label="Confirmer le mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={confirmError}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Réinitialisation…</span>
            </>
          ) : (
            'Mettre à jour le mot de passe'
          )}
        </button>
      </form>
    </div>
  );
};
