import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Mail, ArrowLeft } from 'lucide-react';

export const AccountLockedPage: React.FC = () => {
  return (
    <div className="space-y-5 text-center">
      <div className="w-11 h-11 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
        <Lock className="w-6 h-6" />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-emc-primary">
          Compte temporairement indisponible
        </h2>
        <p className="text-sm text-slate-500 dark:text-emc-secondary mt-2 leading-relaxed">
          Pour des raisons de sécurité et de conformité, l&apos;accès à ce compte a été restreint par l&apos;administration système.
        </p>
      </div>

      <div className="p-4 rounded-lg bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border-strong text-sm text-left">
        <span className="text-xs font-medium text-slate-400 dark:text-emc-muted-fg uppercase tracking-wide">
          Contacter l&apos;administration
        </span>
        <p className="font-medium text-slate-900 dark:text-emc-primary flex items-center gap-2 pt-1.5">
          <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          support@emc-helpline.org
        </p>
      </div>

      <Link
        to="/login"
        className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg text-sm font-medium text-slate-700 dark:text-emc-secondary hover:bg-slate-50 dark:hover:bg-emc-elevated transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Retour à la connexion</span>
      </Link>
    </div>
  );
};
