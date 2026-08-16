import React from 'react';
import { Pencil, User, FileWarning, Globe, HeartHandshake, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import type { SignalementFormData } from './SignalementForm';

interface ReviewStepProps {
  data: SignalementFormData;
  confirmed: boolean;
  onConfirmChange: (v: boolean) => void;
  onGoToStep: (step: number) => void;
  onSubmit: () => void;
  submitting: boolean;
  submitError?: string;
}

const SectionCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  onEdit: () => void;
  children: React.ReactNode;
}> = ({ title, icon, onEdit, children }) => (
  <div className="border border-slate-200 dark:border-emc-border-strong rounded-2xl overflow-hidden bg-white dark:bg-emc-elevated/40 shadow-xs">
    <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50/80 dark:bg-emc-elevated/70 border-b border-slate-200 dark:border-emc-border-strong">
      <div className="flex items-center gap-2">
        <span className="text-blue-600 dark:text-blue-400">{icon}</span>
        <span className="text-xs font-bold text-slate-800 dark:text-emc-primary uppercase tracking-wide">{title}</span>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
      >
        <Pencil className="w-3.5 h-3.5" />
        Modifier
      </button>
    </div>
    <div className="p-5 space-y-3.5">{children}</div>
  </div>
);

const ReviewRow: React.FC<{ label: string; value?: string | string[] }> = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
    <span className="text-xs font-semibold text-slate-500 dark:text-emc-secondary min-w-[150px] uppercase tracking-wide">
      {label}
    </span>
    <span className="text-sm font-medium text-slate-900 dark:text-emc-primary">
      {Array.isArray(value) ? value.join(', ') || '—' : value || '—'}
    </span>
  </div>
);

export const ReviewStep: React.FC<ReviewStepProps> = ({
  data,
  confirmed,
  onConfirmChange,
  onGoToStep,
  onSubmit,
  submitting,
  submitError,
}) => {
  const { concerne, contenu, accompagnement } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
          <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Vérifiez vos informations</p>
          <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-0.5">
            Relisez attentivement les informations ci-dessous avant de soumettre votre signalement.
            Vous pouvez modifier chaque section en cliquant sur « Modifier ».
          </p>
        </div>
      </div>

      {/* Section 1 — Concernant */}
      <SectionCard title="Concernant" icon={<User className="w-4 h-4" />} onEdit={() => onGoToStep(1)}>
        <ReviewRow label="Personne concernée" value={concerne.concernePour === 'moi' ? 'Oui' : 'Non'} />
        <ReviewRow label="Tranche d'âge" value={concerne.ageGroup} />
        <ReviewRow label="Sexe" value={concerne.sexe} />
      </SectionCard>

      {/* Section 2 — Signalement */}
      <SectionCard title="Signalement" icon={<FileWarning className="w-4 h-4" />} onEdit={() => onGoToStep(2)}>
        <ReviewRow
          label="Type de cyberviolence"
          value={contenu.violenceType === 'OTHER' ? `Autre — ${contenu.violenceTypeOther}` : contenu.violenceType}
        />
        <ReviewRow label="Description" value={contenu.description || 'Aucune description fournie'} />
      </SectionCard>

      {/* Section 3 — Plateformes */}
      <SectionCard title="Plateformes et contenus" icon={<Globe className="w-4 h-4" />} onEdit={() => onGoToStep(2)}>
        {contenu.platforms.map((p, i) => (
          <div key={p.id} className={i > 0 ? 'pt-3 border-t border-slate-100 dark:border-emc-border-strong/60' : ''}>
            <p className="text-xs font-bold text-slate-700 dark:text-emc-secondary uppercase tracking-wide mb-2">
              Plateforme {i + 1}
            </p>
            <div className="space-y-2 pl-2">
              <ReviewRow label="Plateforme" value={p.platform} />
              <ReviewRow label="Type de contenu" value={p.contentType} />
              <ReviewRow label="Lien" value={p.link} />
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-emc-secondary min-w-[150px] uppercase tracking-wide">
                  Captures d'écran
                </span>
                {p.screenshotPreviews.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {p.screenshotPreviews.map((src, j) => (
                      <div key={j} className="relative">
                        <img
                          src={src}
                          alt={`Capture ${j + 1}`}
                          className="w-14 h-14 object-cover rounded-lg border border-slate-200 dark:border-emc-border-strong shadow-xs"
                        />
                        <span className="absolute bottom-0 right-0 bg-black/70 text-white text-[9px] font-bold rounded-tl px-1">
                          {j + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-slate-400 dark:text-emc-muted-fg flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5" /> Aucune capture
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </SectionCard>

      {/* Section 4 — Accompagnement */}
      <SectionCard title="Accompagnement" icon={<HeartHandshake className="w-4 h-4" />} onEdit={() => onGoToStep(3)}>
        <ReviewRow
          label="Accompagnement souhaité"
          value={accompagnement.souhaite === 'oui' ? 'Oui' : 'Non'}
        />
        {accompagnement.souhaite === 'oui' && (
          <>
            <ReviewRow label="Prénom" value={accompagnement.prenom} />
            <ReviewRow label="Nom" value={accompagnement.nom} />
            <ReviewRow label="Téléphone" value={accompagnement.telephone} />
            <ReviewRow label="Ville" value={accompagnement.ville} />
            <ReviewRow label="E-mail" value={accompagnement.email} />
            <ReviewRow
              label="Types d'accompagnement"
              value={((accompagnement.types as string[]) ?? []).map((t) => {
                if (t === 'SUP') return 'Soutien social';
                if (t === 'JUR') return 'Accompagnement juridique';
                if (t === 'PSY') return 'Accompagnement psychologique';
                return t;
              })}
            />
          </>
        )}
      </SectionCard>

      {/* Confirmation checkbox */}
      <div className="flex items-start gap-3 p-4 rounded-2xl border-2 border-slate-200 dark:border-emc-border-strong bg-white dark:bg-emc-elevated/40">
        <button
          type="button"
          onClick={() => onConfirmChange(!confirmed)}
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all cursor-pointer ${
            confirmed
              ? 'bg-blue-600 border-blue-600'
              : 'bg-white dark:bg-emc-elevated border-slate-300 dark:border-emc-border-strong hover:border-blue-400'
          }`}
        >
          {confirmed && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <p className="text-xs font-medium text-slate-800 dark:text-emc-primary leading-relaxed cursor-pointer" onClick={() => onConfirmChange(!confirmed)}>
          Je confirme que les informations fournies sont exactes et j'accepte l'envoi de ce signalement.{' '}
          <span className="text-rose-500">*</span>
        </p>
      </div>

      {/* Submit error */}
      {submitError && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-sm text-rose-700 dark:text-rose-400 font-medium">
          {submitError}
        </div>
      )}

      {/* Submit button */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={!confirmed || submitting}
        className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all ${
          confirmed && !submitting
            ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 cursor-pointer'
            : 'bg-slate-200 dark:bg-emc-surface-hover text-slate-400 dark:text-emc-muted-fg cursor-not-allowed'
        }`}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Envoi de votre signalement en cours…
          </span>
        ) : (
          'Envoyer le signalement'
        )}
      </button>

      {!confirmed && (
        <p className="text-center text-xs text-slate-400 dark:text-emc-muted-fg">
          Veuillez confirmer les informations avant l'envoi.
        </p>
      )}
    </div>
  );
};
