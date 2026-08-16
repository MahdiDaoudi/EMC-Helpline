import React from 'react';
import { HeartHandshake, UserCircle } from 'lucide-react';
import { FormField, inputCls } from './FormField';
import type { SignalementFormData } from './SignalementForm';

interface AccompagnementStepProps {
  data: SignalementFormData['accompagnement'];
  errors: Partial<Record<keyof SignalementFormData['accompagnement'] | 'types', string>>;
  onChange: (field: keyof SignalementFormData['accompagnement'], value: unknown) => void;
}

const ACCOMPAGNEMENT_TYPES = [
  { value: 'JUR', label: 'Accompagnement juridique', desc: 'Aide et conseil juridique pour vos démarches légales.' },
  { value: 'PSY', label: 'Accompagnement psychologique', desc: 'Soutien psychologique avec un professionnel de santé.' },
  { value: 'SUP', label: 'Soutien social', desc: 'Accompagnement général et orientation vers les services utiles.' },
];

export const AccompagnementStep: React.FC<AccompagnementStepProps> = ({ data, errors, onChange }) => {
  const currentTypes = (data.types as string[]) ?? [];

  const toggleType = (value: string) => {
    if (value === 'SUP') {
      onChange('types', ['SUP']);
      return;
    }

    const updated = currentTypes.includes(value)
      ? currentTypes.filter((t) => t !== value)
      : [...new Set([...currentTypes, value])];

    const normalized = Array.from(new Set(['SUP', ...updated]));
    onChange('types', normalized);
  };

  return (
    <div className="space-y-8">
      {/* Context banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
          <HeartHandshake className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Accompagnement disponible</p>
          <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
            Notre équipe peut vous accompagner gratuitement et de manière confidentielle dans vos démarches.
            Vous pouvez refuser si vous souhaitez uniquement signaler les faits.
          </p>
        </div>
      </div>

      {/* Accompagnement choice */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-800 dark:text-emc-primary">
          Souhaitez-vous bénéficier d'un accompagnement ? <span className="text-rose-500">*</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              value: 'oui',
              label: 'Oui, je souhaite être accompagné(e)',
              sublabel: 'Je souhaite être contacté(e) par un conseiller.',
              color: 'emerald',
            },
            {
              value: 'non',
              label: 'Non, je ne souhaite pas être accompagné(e)',
              sublabel: 'Je préfère uniquement signaler les faits.',
              color: 'slate',
            },
          ].map(({ value, label, sublabel, color }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange('souhaite', value)}
              className={`relative flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
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
                <p className="text-xs text-slate-500 dark:text-emc-secondary mt-0.5 leading-relaxed">{sublabel}</p>
              </div>
              {data.souhaite === value && (
                <div className={`absolute top-3 right-3 w-4 h-4 rounded-full flex items-center justify-center ${
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
              Vos coordonnées
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Prénom" required error={errors.prenom} htmlFor="prenom">
              <input
                id="prenom"
                type="text"
                placeholder="Votre prénom"
                value={data.prenom || ''}
                onChange={(e) => onChange('prenom', e.target.value)}
                className={inputCls(!!errors.prenom)}
              />
            </FormField>

            <FormField label="Nom" required error={errors.nom} htmlFor="nom">
              <input
                id="nom"
                type="text"
                placeholder="Votre nom de famille"
                value={data.nom || ''}
                onChange={(e) => onChange('nom', e.target.value)}
                className={inputCls(!!errors.nom)}
              />
            </FormField>

            <FormField
              label="Téléphone"
              required
              error={errors.telephone}
              htmlFor="telephone"
              helpText="Nous vous contacterons sur ce numéro pour organiser l'accompagnement."
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

            <FormField label="Ville" required error={errors.ville} htmlFor="ville">
              <input
                id="ville"
                type="text"
                placeholder="Votre ville de résidence"
                value={data.ville || ''}
                onChange={(e) => onChange('ville', e.target.value)}
                className={inputCls(!!errors.ville)}
              />
            </FormField>

            <FormField
              label="Adresse e-mail"
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
              Quel type d'accompagnement souhaitez-vous ? <span className="text-rose-500">*</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-emc-secondary">Le soutien social est obligatoire et ne peut pas être retiré.</p>

            <div className="space-y-3">
              {ACCOMPAGNEMENT_TYPES.map(({ value, label, desc }) => {
                const isChecked = currentTypes.includes(value);
                const isDisabled = value === 'SUP';
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleType(value)}
                    disabled={isDisabled}
                    className={`w-full flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                      isDisabled ? 'cursor-not-allowed opacity-95' : 'cursor-pointer'
                    } ${
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
                    } ${isDisabled ? 'ring-1 ring-blue-200' : ''}`}>
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
                      <p className="text-xs text-slate-500 dark:text-emc-secondary mt-0.5">{desc}</p>
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
