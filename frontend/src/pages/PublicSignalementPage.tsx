import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import logo from '../assets/logo-lightmode.png';
import { SignalementForm } from '../components/signalement-form/SignalementForm';

export const PublicSignalementPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith('ar') ? 'ar' : 'fr';
  const isArabic = currentLang === 'ar';

  useEffect(() => {
    document.documentElement.lang = currentLang;
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
  }, [currentLang, isArabic]);

  const changeLanguage = async (lang: 'fr' | 'ar') => {
    await i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      lang={currentLang}
      className="min-h-screen bg-slate-50 dark:bg-emc-sidebar text-slate-900 dark:text-emc-primary transition-colors flex flex-col justify-between"
    >
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-emc-sidebar/90 backdrop-blur-md border-b border-slate-200/80 dark:border-emc-border px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="group flex items-center gap-2 rounded-xl border border-slate-200 dark:border-emc-border bg-slate-50 dark:bg-emc-surface px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-emc-primary hover:bg-slate-100 transition"
          >
            <ArrowLeft className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
            <span>{t('form.backToHome')}</span>
          </Link>
          <img src={logo} alt="EMC Helpline" className="h-10 w-auto object-contain hidden sm:block" />
        </div>

        {/* Language Switcher FR / AR */}
        <div
          dir="ltr"
          className="relative flex h-9 overflow-hidden rounded-full border border-slate-200 bg-white p-0.5 shadow-sm dark:border-emc-border dark:bg-emc-surface"
        >
          <div
            className={`absolute top-0.5 h-8 w-14 rounded-full bg-blue-600 shadow-sm shadow-blue-600/20 transition-all duration-300 ${
              currentLang === 'fr' ? 'left-0.5' : 'left-[58px]'
            }`}
          />

          <button
            type="button"
            onClick={() => changeLanguage('fr')}
            className={`relative z-10 h-8 w-14 text-xs font-semibold uppercase transition-colors ${
              currentLang === 'fr' ? 'text-white' : 'text-slate-500 hover:text-slate-800 dark:text-emc-secondary'
            }`}
          >
            FR
          </button>

          <button
            type="button"
            onClick={() => changeLanguage('ar')}
            className={`relative z-10 h-8 w-14 text-xs font-semibold uppercase transition-colors ${
              currentLang === 'ar' ? 'text-white' : 'text-slate-500 hover:text-slate-800 dark:text-emc-secondary'
            }`}
          >
            AR
          </button>
        </div>
      </header>

      {/* Main Body Container */}
      <main className="flex-1 py-8 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-600/10 text-blue-700 dark:text-blue-300 border border-blue-600/20">
            <Shield className="w-3.5 h-3.5" />
            <span>{t('hero.badge')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-emc-primary">
            {t('form.newSignalement')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-emc-secondary max-w-xl mx-auto">
            {t('form.subTitle')}
          </p>
        </div>

        {/* Signalement Form component with isPublic */}
        <SignalementForm isPublic={true} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-emc-border py-4 px-6 text-center text-xs text-slate-500 dark:text-emc-secondary">
        <p>© {new Date().getFullYear()} EMC HELPLINE. {t('footer.rights')}</p>
      </footer>
    </div>
  );
};
