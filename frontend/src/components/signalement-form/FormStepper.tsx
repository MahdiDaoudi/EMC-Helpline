import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  number: number;
  label: string;
  sublabel: string;
}

interface FormStepperProps {
  currentStep: number;
  maxVisitedStep: number;
  steps: Step[];
  onStepClick: (stepNumber: number) => void;
}

export const FormStepper: React.FC<FormStepperProps> = ({
  currentStep,
  maxVisitedStep,
  steps,
  onStepClick,
}) => {
  return (
    <div className="w-full">
      {/* Desktop stepper */}
      <div className="hidden sm:flex items-center justify-between relative px-2">
        {/* Connecting background line */}
        <div className="absolute top-5 left-8 right-8 h-1 bg-slate-200 dark:bg-emc-surface-hover/80 rounded-full z-0" />

        {/* Connecting active progress line */}
        <div
          className="absolute top-5 left-8 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 rounded-full z-0 transition-all duration-500"
          style={{ width: `${((Math.min(currentStep, maxVisitedStep) - 1) / (steps.length - 1)) * 88}%` }}
        />

        {steps.map((step) => {
          const isDone = step.number < currentStep;
          const isActive = step.number === currentStep;
          const isAccessible = step.number <= maxVisitedStep;

          return (
            <button
              key={step.number}
              type="button"
              disabled={!isAccessible}
              onClick={() => isAccessible && onStepClick(step.number)}
              title={
                isAccessible
                  ? `Accéder à l'Étape ${step.number} — ${step.label}`
                  : `Étape ${step.number} non encore accessible`
              }
              className={`relative z-10 flex flex-col items-center gap-2 group outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 rounded-xl transition-all ${
                isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
              }`}
            >
              {/* Step Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-md ${
                  isActive
                    ? 'bg-blue-600 text-white ring-4 ring-blue-200 dark:ring-blue-800/60 scale-110 shadow-blue-500/30'
                    : isDone
                    ? 'bg-emerald-600 dark:bg-emerald-500 text-white ring-4 ring-emerald-100 dark:ring-emerald-950/40 group-hover:bg-emerald-700 group-hover:scale-105'
                    : isAccessible
                    ? 'bg-white dark:bg-emc-elevated text-blue-600 dark:text-blue-400 border-2 border-blue-400 dark:border-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-slate-700'
                    : 'bg-white dark:bg-emc-elevated text-slate-400 dark:text-emc-muted-fg border-2 border-slate-200 dark:border-emc-border-strong'
                }`}
              >
                {isDone ? <Check className="w-5 h-5" strokeWidth={3} /> : step.number}
              </div>

              {/* Step Label */}
              <div className="text-center min-w-[90px]">
                <p
                  className={`text-xs font-bold leading-tight transition-colors ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : isDone
                      ? 'text-emerald-700 dark:text-emerald-400 group-hover:underline'
                      : isAccessible
                      ? 'text-slate-700 dark:text-emc-primary group-hover:text-blue-600 dark:group-hover:text-blue-400'
                      : 'text-slate-400 dark:text-emc-muted-fg'
                  }`}
                >
                  {isDone ? `✓ ${step.label}` : `${step.number}. ${step.label}`}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-emc-muted-fg mt-0.5 hidden md:block">
                  {step.sublabel}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Mobile stepper */}
      <div className="sm:hidden flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 dark:text-emc-primary">
            Étape {currentStep} sur {steps.length} — {steps[currentStep - 1]?.label}
          </span>
          <span className="text-[10px] text-slate-400">
            {currentStep < steps.length ? `${steps.length - currentStep} étape(s) restante(s)` : 'Dernière étape'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 w-full">
          {steps.map((step) => {
            const isDone = step.number < currentStep;
            const isActive = step.number === currentStep;
            const isAccessible = step.number <= maxVisitedStep;

            return (
              <button
                key={step.number}
                type="button"
                disabled={!isAccessible}
                onClick={() => isAccessible && onStepClick(step.number)}
                title={`Aller à l'Étape ${step.number}`}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-600 dark:bg-blue-500 ring-2 ring-blue-300 dark:ring-blue-700'
                    : isDone
                    ? 'bg-emerald-500 dark:bg-emerald-400 cursor-pointer'
                    : isAccessible
                    ? 'bg-blue-300 dark:bg-blue-800 cursor-pointer'
                    : 'bg-slate-200 dark:bg-emc-surface-hover'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
