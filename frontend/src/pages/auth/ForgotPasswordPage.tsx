import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, RefreshCw, Loader2 } from 'lucide-react';
import { resetPassword } from '../../services/auth.service'

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState('');
  const [requestError, setRequestError] = useState('');

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const requestReset = async () => {
    setLoading(true);
    setRequestError('');
    try {
      const data = await resetPassword(email);
      setMessage(data?.message ?? 'Si un compte existe, vous recevrez sous peu les instructions de réinitialisation.');
      setSubmitted(true);
      setCooldown(30);
    } catch (err) {
      setRequestError("Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    if (!email) {
      setEmailError('L\'adresse e-mail est obligatoire.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Veuillez saisir une adresse e-mail valide.');
      return;
    }

    await requestReset();
  };

  const handleResend = () => {
    if (cooldown > 0 || loading) return;
    requestReset();
  };

  return (
    <div className="space-y-6">
      <Link
        to="/login"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-emc-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Retour à la connexion</span>
      </Link>

      {!submitted ? (
        <>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-emc-primary">
              Mot de passe oublié
            </h2>
            <p className="text-sm text-slate-500 dark:text-emc-secondary mt-1 leading-relaxed">
              Saisissez votre adresse e-mail professionnelle. Nous vous enverrons les instructions de réinitialisation.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="reset-email" className="block text-sm font-medium text-slate-700 dark:text-emc-secondary">
                Adresse e-mail professionnelle
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="reset-email"
                  type="email"
                  placeholder="nom@emc-helpline.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm bg-white dark:bg-emc-elevated border text-slate-900 dark:text-emc-primary placeholder-slate-400 focus:outline-none transition-colors ${
                    emailError
                      ? 'border-rose-400 focus:border-rose-500'
                      : 'border-slate-200 dark:border-emc-border-strong focus:border-blue-600 dark:focus:border-blue-500'
                  }`}
                />
              </div>
              {emailError && <p className="text-xs text-rose-600 dark:text-rose-400">{emailError}</p>}
            </div>

            {requestError && (
              <p className="text-xs text-rose-600 dark:text-rose-400">{requestError}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Envoi en cours…</span>
                </>
              ) : (
                'Envoyer le lien de réinitialisation'
              )}
            </button>
          </form>
        </>
      ) : (
        <div className="space-y-5 text-center">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-emc-primary">
              Vérifiez votre boîte mail
            </h2>
            <p className="text-sm text-slate-500 dark:text-emc-secondary mt-2 leading-relaxed">
              {message}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-emc-border space-y-3">
            <button
              type="button"
              disabled={cooldown > 0 || loading}
              onClick={handleResend}
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 disabled:text-slate-400 hover:underline"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              {cooldown > 0
                ? `Renvoyer l'e-mail dans ${cooldown} s`
                : 'Renvoyer le lien de réinitialisation'}
            </button>

            <div>
              <Link to="/login" className="text-sm font-medium text-slate-700 dark:text-emc-secondary hover:underline">
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};