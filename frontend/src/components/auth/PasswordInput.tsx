import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label = 'Mot de passe',
  error,
  id = 'password',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-emc-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Lock className="w-4 h-4" />
        </div>
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          className={`w-full pl-10 pr-10 py-2.5 rounded-lg text-sm bg-white dark:bg-emc-elevated border text-slate-900 dark:text-emc-primary placeholder-slate-400 dark:placeholder-emc-muted-fg focus:outline-none transition-colors ${
            error
              ? 'border-rose-400 focus:border-rose-500'
              : 'border-slate-200 dark:border-emc-border-strong focus:border-blue-600 dark:focus:border-blue-500'
          }`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-emc-primary focus:outline-none"
          aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
};
