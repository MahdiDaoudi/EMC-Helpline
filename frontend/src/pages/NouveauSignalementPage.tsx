import React from 'react';
import { Plus } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { SignalementForm } from '../components/signalement-form/SignalementForm';

export const NouveauSignalementPage: React.FC = () => {
  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-emc-muted-fg">
        <NavLink
          to="/signalements"
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
        >
          Signalements
        </NavLink>
        <span>/</span>
        <span className="text-slate-600 dark:text-emc-secondary font-semibold">Nouveau signalement</span>
      </div>

      {/* Page header */}
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0">
          <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-emc-primary">
            Nouveau signalement
          </h1>
          <p className="text-sm text-slate-500 dark:text-emc-secondary mt-0.5 leading-relaxed">
            Signalez un cas de cyberviolence en toute confidentialité.
            Remplissez le formulaire en 4 étapes et notre équipe prendra en charge votre dossier.
          </p>
        </div>
      </div>

      {/* Form */}
      <SignalementForm />
    </div>
  );
};
