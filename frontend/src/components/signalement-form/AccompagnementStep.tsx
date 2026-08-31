import React from 'react';
import { HeartHandshake, UserCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FormField, inputCls } from './FormField';
import type { SignalementFormData } from './SignalementForm';

interface AccompagnementStepProps {
  data: SignalementFormData['accompagnement'];
  errors: Partial<Record<keyof SignalementFormData['accompagnement'] | 'types', string>>;
  onChange: (field: keyof SignalementFormData['accompagnement'], value: unknown) => void;
}

export const AccompagnementStep: React.FC<AccompagnementStepProps> = ({ data, errors, onChange }) => {
  const { t } = useTranslation();
  const currentTypes = (data.types as string[]) ?? [];

  const accompanimentTypes = [
    { value: 'JUR', label: t('form.accompagnement.typeLegal') },
    { value: 'PSY', label: t('form.accompagnement.typePsych') },
  ];

  const toggleType = (value: string) => {
    const updated = currentTypes.includes(value)
      ? currentTypes.filter((t) => t !== value)
      : [...new Set([...currentTypes, value])];
    onChange('types', updated);
  };

  return (
    <div className="space-y-8">
      {/* Context banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
          <HeartHandshake className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">{t('form.accompagnement.wishTitle')}</p>
          <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
            {t('form.confidentialNotice')}
          </p>
        </div>
      </div>

      {/* Accompagnement choice */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-800 dark:text-emc-primary">
          {t('form.accompagnement.wishTitle')} <span className="text-rose-500">*</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              value: 'oui',
              label: t('form.accompagnement.wishYes'),
              sublabel: '',
              color: 'emerald',
            },
            {
              value: 'non',
              label: t('form.accompagnement.wishNo'),
              sublabel: '',
              color: 'slate',
            },
          ].map(({ value, label, sublabel, color }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange('souhaite', value)}
              className={`relative flex items-start gap-3 p-4 rounded-2xl border-2 text-left rtl:text-right transition-all cursor-pointer ${
                data.souhaite === value
                  ? color === 'emerald'
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 dark:border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'border-slate-400 bg-slate-100/70 dark:bg-emc-elevated/80 dark:border-emc-border-strong'
                  : 'border-slate-200 dark:border-emc-border-strong bg-white dark:bg-emc-elevated/40 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                data.souhaite === value
                  ? color === 'emerald'
                    ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-200 dark:bg-emc-surface-hover text-slate-700 dark:text-emc-secondary'
                  : 'bg-slate-100 dark:bg-emc-surface-hover text-slate-400'
              }`}>
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${
                  data.souhaite === value
                    ? color === 'emerald'
                      ? 'text-emerald-800 dark:text-emerald-300'
                      : 'text-slate-800 dark:text-emc-primary'
                    : 'text-slate-800 dark:text-emc-primary'
                }`}>{label}</p>
                {sublabel && <p className="text-xs text-slate-500 dark:text-emc-secondary mt-0.5 leading-relaxed">{sublabel}</p>}
              </div>
              {data.souhaite === value && (
                <div className={`absolute top-3 ltr:right-3 rtl:left-3 w-4 h-4 rounded-full flex items-center justify-center ${
                  color === 'emerald' ? 'bg-emerald-600' : 'bg-slate-600'
                }`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              )}
            </button>
          ))}
        </div>
        {errors.souhaite && (
          <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{errors.souhaite}</p>
        )}
      </div>

      {/* Contact info — shown only if accompaniment is desired */}
      {data.souhaite === 'oui' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-t border-slate-100 dark:border-emc-border pt-6">
            <UserCircle className="w-5 h-5 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-emc-primary uppercase tracking-wide">
              {t('form.accompagnement.identityTitle')}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label={t('form.accompagnement.firstName')} required error={errors.prenom} htmlFor="prenom">
              <input
                id="prenom"
                type="text"
                placeholder={t('form.accompagnement.firstName')}
                value={data.prenom || ''}
                onChange={(e) => onChange('prenom', e.target.value)}
                className={inputCls(!!errors.prenom)}
              />
            </FormField>

            <FormField label={t('form.accompagnement.lastName')} required error={errors.nom} htmlFor="nom">
              <input
                id="nom"
                type="text"
                placeholder={t('form.accompagnement.lastName')}
                value={data.nom || ''}
                onChange={(e) => onChange('nom', e.target.value)}
                className={inputCls(!!errors.nom)}
              />
            </FormField>

            <FormField
              label={t('form.accompagnement.phone')}
              required
              error={errors.telephone}
              htmlFor="telephone"
            >
              <input
                id="telephone"
                type="tel"
                placeholder="+212 6 XX XX XX XX"
                value={data.telephone || ''}
                onChange={(e) => onChange('telephone', e.target.value)}
                className={inputCls(!!errors.telephone)}
              />
            </FormField>

            <FormField label={t('form.accompagnement.city')} required error={errors.ville} htmlFor="ville">
              <input
                id="ville"
                type="text"
                placeholder={t('form.accompagnement.city')}
                value={data.ville || ''}
                onChange={(e) => onChange('ville', e.target.value)}
                className={inputCls(!!errors.ville)}
              />
            </FormField>

            <FormField
              label={t('form.accompagnement.email')}
              required
              error={errors.email}
              htmlFor="email"
              className="sm:col-span-2"
            >
              <input
                id="email"
                type="email"
                placeholder="votre.email@exemple.com"
                value={data.email || ''}
                onChange={(e) => onChange('email', e.target.value)}
                className={inputCls(!!errors.email)}
              />
            </FormField>
          </div>

          {/* Type d'accompagnement */}
          <div className="space-y-3 border-t border-slate-100 dark:border-emc-border pt-6">
            <p className="text-sm font-semibold text-slate-800 dark:text-emc-primary">
              {t('form.accompagnement.typesTitle')} <span className="text-rose-500">*</span>
            </p>

            <div className="space-y-3">
              {accompanimentTypes.map(({ value, label }) => {
                const isChecked = currentTypes.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleType(value)}
                    className={`w-full flex items-start gap-3 p-4 rounded-2xl border-2 text-left rtl:text-right transition-all cursor-pointer ${
                      isChecked
                        ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 dark:border-blue-500 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-emc-border-strong bg-white dark:bg-emc-elevated/40 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    {/* Custom checkbox */}
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                      isChecked
                        ? 'bg-blue-600 border-blue-600'
                        : 'bg-white dark:bg-emc-elevated border-slate-300 dark:border-emc-border-strong'
                    } `}>
                      {isChecked && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${isChecked ? 'text-blue-800 dark:text-blue-300' : 'text-slate-800 dark:text-emc-primary'}`}>
                        {label}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.types && (
              <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{errors.types}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
