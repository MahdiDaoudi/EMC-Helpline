import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  if (!password) return null;

  const checks = [
    { label: 'Au moins 8 caractères', valid: password.length >= 8 },
    { label: 'Contient un chiffre (0-9)', valid: /\d/.test(password) },
    { label: 'Contient un caractère spécial', valid: /[^A-Za-z0-9]/.test(password) },
  ];

  const passedCount = checks.filter((c) => c.valid).length;

  const getStrengthLabel = () => {
    if (passedCount <= 1) return { label: 'Faible', color: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400' };
    if (passedCount === 2) return { label: 'Moyen', color: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' };
    return { label: 'Fort', color: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' };
  };

  const strength = getStrengthLabel();

  return (
    <div className="space-y-2 pt-1 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-slate-500 dark:text-emc-secondary">Robustesse du mot de passe</span>
        <span className={`font-medium ${strength.text}`}>{strength.label}</span>
      </div>

      <div className="grid grid-cols-3 gap-1 h-1 w-full bg-slate-100 dark:bg-emc-elevated rounded-full overflow-hidden">
        <div className={`h-full ${passedCount >= 1 ? strength.color : 'bg-slate-200 dark:bg-emc-surface-hover'}`} />
        <div className={`h-full ${passedCount >= 2 ? strength.color : 'bg-slate-200 dark:bg-emc-surface-hover'}`} />
        <div className={`h-full ${passedCount >= 3 ? strength.color : 'bg-slate-200 dark:bg-emc-surface-hover'}`} />
      </div>

      <div className="space-y-1 pt-1">
        {checks.map((c, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            {c.valid ? (
              <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
            ) : (
              <X className="w-3 h-3 text-slate-400 flex-shrink-0" />
            )}
            <span className={c.valid ? 'text-slate-600 dark:text-emc-secondary' : 'text-slate-400 dark:text-emc-muted-fg'}>
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
