import React from 'react';
import { User, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FormField } from './FormField';
import { CustomSelect } from './CustomSelect';
import type { SignalementFormData } from './SignalementForm';

interface ConcerneStepProps {
  data: SignalementFormData['concerne'];
  errors: Partial<Record<keyof SignalementFormData['concerne'], string>>;
  onChange: (field: keyof SignalementFormData['concerne'], value: string) => void;
}

export const ConcerneStep: React.FC<ConcerneStepProps> = ({ data, errors, onChange }) => {
  const { t } = useTranslation();

  const ageGroups = [
    { label: t('form.concerne.ageOptions.child'), value: 'CHILD_5_12' },
    { label: t('form.concerne.ageOptions.teen'), value: 'TEEN_13_17' },
    { label: t('form.concerne.ageOptions.youngAdult'), value: 'YOUNG_ADULT_18_25' },
    { label: t('form.concerne.ageOptions.adult'), value: 'ADULT_26_PLUS' },
  ];

  const sexes = [
    { label: t('form.concerne.sexMale'), value: 'MALE' },
    { label: t('form.concerne.sexFemale'), value: 'FEMALE' },
  ];

  return (
    <div className="space-y-8">
      {/* Context banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
          <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">{t('form.concerne.questionTitle')}</p>
          <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-0.5">
            {t('form.confidentialNotice')}
          </p>
        </div>
      </div>

      {/* Concerné radio */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-800 dark:text-emc-primary">
          {t('form.concerne.questionTitle')} <span className="text-rose-500">*</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { value: 'moi', label: t('form.concerne.myself'), sublabel: t('form.concerne.myselfSub'), Icon: User },
            { value: 'autre', label: t('form.concerne.another'), sublabel: t('form.concerne.anotherSub'), Icon: Users },
          ].map(({ value, label, sublabel, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange('concernePour', value)}
              className={`relative flex items-start gap-3 p-4 rounded-2xl border-2 text-left rtl:text-right transition-all cursor-pointer ${
                data.concernePour === value
                  ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 dark:border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-emc-border-strong bg-white dark:bg-emc-elevated/40 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                data.concernePour === value
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                  : 'bg-slate-100 dark:bg-emc-surface-hover text-slate-400'
              }`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${
                  data.concernePour === value ? 'text-blue-700 dark:text-blue-300' : 'text-slate-800 dark:text-emc-primary'
                }`}>{label}</p>
                <p className="text-xs text-slate-500 dark:text-emc-secondary mt-0.5 leading-relaxed">{sublabel}</p>
              </div>
              {data.concernePour === value && (
                <div className="absolute top-3 ltr:right-3 rtl:left-3 w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              )}
            </button>
          ))}
        </div>
        {errors.concernePour && (
          <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{errors.concernePour}</p>
        )}
      </div>

      {/* Age group & Sex custom selects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField
          label={t('form.concerne.ageTitle')}
          required
          error={errors.ageGroup}
          htmlFor="ageGroup"
        >
          <CustomSelect
            id="ageGroup"
            options={ageGroups}
            value={data.ageGroup}
            onChange={(val) => onChange('ageGroup', val)}
            placeholder={t('form.concerne.ageTitle')}
            error={!!errors.ageGroup}
          />
        </FormField>

        <FormField
          label={t('form.concerne.sexTitle')}
          required
          error={errors.sexe}
          htmlFor="sexe"
        >
          <CustomSelect
            id="sexe"
            options={sexes}
            value={data.sexe}
            onChange={(val) => onChange('sexe', val)}
            placeholder={t('form.concerne.sexTitle')}
            error={!!errors.sexe}
          />
        </FormField>
      </div>
    </div>
  );
};
