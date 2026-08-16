import React from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  required,
  error,
  helpText,
  children,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1 text-sm font-semibold text-slate-800 dark:text-emc-primary"
      >
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
        {helpText && (
          <span className="relative group ml-1 cursor-help">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400 dark:text-emc-muted-fg hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
            <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-60 bg-slate-900 dark:bg-emc-surface-hover text-white text-[11px] font-normal rounded-xl px-3 py-2 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none leading-relaxed">
              {helpText}
            </span>
          </span>
        )}
      </label>

      {children}

      {error && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

// Shared input/textarea CSS classes with crisp contrast for Light & Dark mode
export const inputCls = (hasError?: boolean) =>
  `w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all outline-none focus:ring-2 focus:ring-offset-0 bg-white dark:bg-emc-elevated/80 text-slate-900 dark:text-emc-primary placeholder-slate-400 dark:placeholder-emc-muted-fg ${
    hasError
      ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-300 dark:focus:ring-rose-500/40 text-slate-900 dark:text-emc-primary'
      : 'border-slate-200 dark:border-emc-border-strong focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-200 dark:focus:ring-blue-500/30 text-slate-900 dark:text-emc-primary hover:border-slate-300 dark:hover:border-slate-600'
  }`;
