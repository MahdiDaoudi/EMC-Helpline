import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, ShieldAlert, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PasswordInput } from '../../components/auth/PasswordInput';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [authError, setAuthError] = useState('');

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/';

  const validate = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');
    setAuthError('');

    if (!email) {
      setEmailError('L\'adresse e-mail est obligatoire.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Veuillez saisir une adresse e-mail valide.');
      valid = false;
    }

    if (!password) {
      setPasswordError('Le mot de passe est obligatoire.');
      valid = false;
    } else if (password.length < 4) {
      setPasswordError('Le mot de passe doit contenir au moins 4 caractères.');
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setAuthError('');

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'ACCOUNT_LOCKED') {
        navigate('/account-locked', { replace: true });
      } else {
        setAuthError('Identifiants incorrects. Vérifiez votre adresse e-mail et votre mot de passe.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full pl-10 pr-4 py-2.5 rounded-lg text-sm bg-white dark:bg-emc-elevated border text-slate-900 dark:text-emc-primary placeholder-slate-400 dark:placeholder-emc-muted-fg focus:outline-none transition-colors ${
      hasError
        ? 'border-rose-400 focus:border-rose-500'
        : 'border-slate-200 dark:border-emc-border-strong focus:border-blue-600 dark:focus:border-blue-500'
    }`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-emc-primary">
          Connexion
        </h1>
        <p className="text-sm text-slate-500 dark:text-emc-secondary mt-1">
          Accédez à votre espace de gestion des signalements.
        </p>
      </div>

      {authError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-sm"
        >
          <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{authError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-emc-secondary">
            Adresse e-mail professionnelle
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="nom@emc-helpline.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass(!!emailError)}
            />
          </div>
          {emailError && <p className="text-xs text-rose-600 dark:text-rose-400">{emailError}</p>}
        </div>

        <PasswordInput
          id="password"
          label="Mot de passe"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={passwordError}
        />

        <div className="flex items-center justify-between text-sm pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-emc-secondary select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded accent-blue-600 border-slate-300 dark:border-emc-border-strong"
            />
            <span>Se souvenir de moi</span>
          </label>

          <Link
            to="/forgot-password"
            className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Connexion en cours…
            </span>
          ) : (
            'Se connecter'
          )}
        </button>
      </form>

      <p className="text-xs text-slate-500 dark:text-emc-muted-fg leading-relaxed">
        Accès réservé au personnel autorisé. En cas de difficulté, contactez l&apos;administrateur système de votre organisation.
      </p>
    </div>
  );
};
