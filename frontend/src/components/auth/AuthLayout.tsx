import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import logoLightmode from '../../assets/logo-lightmode.png';
import logoDarkmode from '../../assets/logo-darkmode.png';

export const AuthLayout: React.FC = () => {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-8 bg-[#F4F6F8] dark:bg-emc-page text-slate-900 dark:text-emc-primary transition-colors">
      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 z-20 p-2 rounded-lg bg-white dark:bg-emc-surface border border-slate-200 dark:border-emc-border text-slate-500 hover:text-slate-800 dark:text-emc-secondary dark:hover:text-emc-primary transition-colors"
        title={resolvedTheme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
        aria-label={resolvedTheme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
      >
        {resolvedTheme === 'dark' ? (
          <Sun className="w-4 h-4" />
        ) : (
          <Moon className="w-4 h-4" />
        )}
      </button>

      <div className="w-full max-w-[400px]">
        <div className="bg-white dark:bg-emc-surface border border-slate-200 dark:border-emc-border rounded-lg shadow-sm">
          <div className="px-8 pt-8 pb-6 border-b border-slate-100 dark:border-emc-border">
            <div className="flex flex-col items-center text-center">
              <img
                src={resolvedTheme === 'dark' ? logoDarkmode : logoLightmode}
                alt="EMC Helpline"
                className="h-20 w-auto object-contain"
              />
              <p className="mt-3 text-xs text-slate-500 dark:text-emc-muted-fg tracking-wide">
                Plateforme de gestion des cas de cyber-violence
              </p>
            </div>
          </div>

          <div className="px-8 py-7">
            <Outlet />
          </div>

          <div className="px-8 py-4 border-t border-slate-100 dark:border-emc-border bg-slate-50/60 dark:bg-emc-muted/40 rounded-b-lg">
            <p className="text-[11px] text-center text-slate-400 dark:text-emc-muted-fg leading-relaxed">
              &copy; {new Date().getFullYear()} EMC Helpline — Portail institutionnel confidentiel
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
