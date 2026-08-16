import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export const AuthErrorPage: React.FC = () => {
  return (
    <div className="space-y-5 text-center">
      <div className="w-11 h-11 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
        <ShieldAlert className="w-6 h-6" />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-emc-primary">
          Erreur d&apos;authentification
        </h2>
        <p className="text-sm text-slate-500 dark:text-emc-secondary mt-2 leading-relaxed">
          Une erreur de session ou de jeton de sécurité s&apos;est produite. Veuillez réessayer de vous connecter.
        </p>
      </div>

      <Link
        to="/login"
        className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors block"
      >
        Réessayer la connexion
      </Link>
    </div>
  );
};
