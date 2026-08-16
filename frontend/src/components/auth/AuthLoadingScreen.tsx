import React from 'react';
import { Loader2 } from 'lucide-react';

export const AuthLoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F4F6F8] dark:bg-emc-page flex flex-col items-center justify-center p-4 text-center">
      <Loader2 className="w-6 h-6 text-slate-600 dark:text-emc-secondary animate-spin mb-4" />
      <h3 className="text-sm font-medium text-slate-900 dark:text-emc-primary">
        EMC Helpline
      </h3>
      <p className="text-xs text-slate-500 dark:text-emc-secondary mt-1">
        Initialisation de la session sécurisée…
      </p>
    </div>
  );
};
