import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { SignalementForm } from '../../components/signalement-form/SignalementForm';
import { useVictimAuth } from '../../context/VictimAuthContext';
import logo from '../../assets/logo-lightmode.png';

export const VictimNewSignalementPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { referenceNumber, isAuthenticated } = useVictimAuth();
  const isArabic = i18n.language?.startsWith('ar');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/suivi');
    }
  }, [isAuthenticated, navigate]);

  const changeLanguage = (lang: 'fr' | 'ar') => {
    i18n.changeLanguage(lang);
  };

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-50 dark:bg-emc-surface text-slate-900 dark:text-emc-primary flex flex-col justify-between"
    >
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-emc-border bg-white dark:bg-emc-surface/90 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src={logo} alt="EMC Helpline" className="h-12 w-auto object-contain" />
          </a>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/40 text-xs font-mono font-bold text-blue-700 dark:text-blue-300">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{referenceNumber}</span>
            </div>

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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <button
            type="button"
            onClick={() => navigate('/suivi/tableau-de-bord')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors mb-2"
          >
            {isArabic ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{t('tracking.detail.backToDashboard')}</span>
          </button>
        </div>

        <SignalementForm isVictimAuth={true} />
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 dark:border-emc-border text-center text-xs text-slate-500 dark:text-emc-secondary">
        <p>© {new Date().getFullYear()} EMC HELPLINE. {t('footer.rights')}</p>
      </footer>
    </div>
  );
};
