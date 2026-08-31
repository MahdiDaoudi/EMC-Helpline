import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, ShieldCheck, ArrowLeft, ArrowRight, Lock, KeyRound, Search } from 'lucide-react';
import { trackingService } from '../../services/tracking.service';
import { useVictimAuth } from '../../context/VictimAuthContext';
import logo from '../../assets/logo-lightmode.png';

export const VictimLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { login } = useVictimAuth();
  const isArabic = i18n.language?.startsWith('ar');

  const [referenceNumber, setReferenceNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changeLanguage = (lang: 'fr' | 'ar') => {
    i18n.changeLanguage(lang);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceNumber.trim() || !password.trim()) {
      setError(t('tracking.login.error'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await trackingService.accessTracking(referenceNumber, password);
      login(res.token, res.referenceNumber);
      navigate('/suivi/tableau-de-bord');
    } catch {
      setError(t('tracking.login.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-50 dark:bg-emc-surface text-slate-900 dark:text-emc-primary flex flex-col justify-between"
    >
      {/* Top Header */}
      <header className="border-b border-slate-200 dark:border-emc-border bg-white dark:bg-emc-surface/90 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 group">
            <img src={logo} alt="EMC Helpline" className="h-12 w-auto object-contain transition-transform group-hover:scale-105" />
          </a>

          <div className="flex items-center gap-4">
            {/* Language switch */}
            <div dir="ltr" className="relative flex h-9 overflow-hidden rounded-full border border-slate-200 bg-slate-100 p-0.5 shadow-xs">
              <button
                type="button"
                onClick={() => changeLanguage('fr')}
                className={`relative z-10 h-8 w-12 text-xs font-semibold uppercase transition-colors rounded-full ${
                  !isArabic ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => changeLanguage('ar')}
                className={`relative z-10 h-8 w-12 text-xs font-semibold uppercase transition-colors rounded-full ${
                  isArabic ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                AR
              </button>
            </div>

            <a
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-emc-secondary hover:text-blue-600 transition-colors"
            >
              {isArabic ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              <span>{t('form.backToHome')}</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-emc-surface border border-slate-200 dark:border-emc-border rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
            {/* Icon & Title */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 mb-1">
                <Search className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-emc-primary tracking-tight">
                {t('tracking.login.title')}
              </h1>
              <p className="text-xs text-slate-500 dark:text-emc-secondary leading-relaxed">
                {t('tracking.login.subtitle')}
              </p>
            </div>

            {/* Error state */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs font-semibold text-rose-700 dark:text-rose-400">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-emc-primary uppercase tracking-wide">
                  {t('tracking.login.refLabel')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value.toUpperCase())}
                    placeholder={t('tracking.login.refPlaceholder')}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-emc-border-strong bg-slate-50/50 dark:bg-emc-elevated/50 text-sm font-mono tracking-wider font-semibold text-slate-900 dark:text-emc-primary placeholder-slate-400 dark:placeholder-emc-muted-fg focus:border-blue-500 focus:bg-white dark:focus:bg-emc-elevated focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-emc-primary uppercase tracking-wide">
                  {t('tracking.login.passwordLabel')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('tracking.login.passwordPlaceholder')}
                    className="w-full ltr:pr-10 rtl:pl-10 px-4 py-3 rounded-xl border border-slate-200 dark:border-emc-border-strong bg-slate-50/50 dark:bg-emc-elevated/50 text-sm font-mono tracking-wider font-semibold text-slate-900 dark:text-emc-primary placeholder-slate-400 dark:placeholder-emc-muted-fg focus:border-blue-500 focus:bg-white dark:focus:bg-emc-elevated focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <span>{t('tracking.login.submitting')}</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>{t('tracking.login.submitBtn')}</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 dark:border-emc-border flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-emc-secondary">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('tracking.login.confidentialNotice')}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 dark:border-emc-border text-center text-xs text-slate-500 dark:text-emc-secondary">
        <p>© {new Date().getFullYear()} EMC HELPLINE. {t('footer.rights')}</p>
      </footer>
    </div>
  );
};
