import React, { useEffect, useState } from 'react';
import { Pencil, User, FileWarning, Globe, HeartHandshake, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SignalementFormData } from './SignalementForm';
import { PlatformsService } from '../../services/platforms.service';

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
}> = ({ title, icon, onEdit, children }) => {
  const { t } = useTranslation();
  return (
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
          {t('common.edit')}
        </button>
      </div>
      <div className="p-5 space-y-3.5">{children}</div>
    </div>
  );
};

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
  const { t } = useTranslation();
  const { concerne, contenu, accompagnement } = data;

  // ── Fetch platform names to resolve IDs ──
  const [platformMap, setPlatformMap] = useState<Record<string, string>>({});
  useEffect(() => {
    PlatformsService.getPlatforms()
      .then((platforms) => {
        const map: Record<string, string> = {};
        platforms.forEach((p) => { map[String(p.id)] = p.name; });
        setPlatformMap(map);
      })
      .catch(() => {/* ignore */});
  }, []);

  // ── Generate fresh Object URLs from File objects (ContenuStep revokes its own URLs on unmount) ──
  const [localPreviews, setLocalPreviews] = useState<string[][]>([]);
  useEffect(() => {
    const previews = contenu.platforms.map((p) =>
      (p.screenshots || []).map((file) =>
        file instanceof File ? URL.createObjectURL(file) : ''
      )
    );
    setLocalPreviews(previews);
    // Revoke on cleanup to avoid memory leaks
    return () => {
      previews.flat().forEach((url) => { if (url) URL.revokeObjectURL(url); });
    };
  // Re-run whenever the screenshots array changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contenu.platforms.map((p) => p.screenshots.length).join(',')]);

  const resolvePlatformName = (id: string) => platformMap[id] || id;

  const formatAgeGroup = (val: string) => {
    switch (val) {
      case 'CHILD_5_12': return t('form.concerne.ageOptions.child');
      case 'TEEN_13_17': return t('form.concerne.ageOptions.teen');
      case 'YOUNG_ADULT_18_25': return t('form.concerne.ageOptions.youngAdult');
      case 'ADULT_26_PLUS': return t('form.concerne.ageOptions.adult');
      default: return val;
    }
  };

  const formatSex = (val: string) => {
    switch (val) {
      case 'MALE': return t('form.concerne.sexMale');
      case 'FEMALE': return t('form.concerne.sexFemale');
      default: return val;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
          <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">{t('form.review.title')}</p>
          <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-0.5">
            {t('form.review.summaryTitle')}
          </p>
        </div>
      </div>

      {/* Section 1 — Concernant */}
      <SectionCard title={t('form.steps.step1.label')} icon={<User className="w-4 h-4" />} onEdit={() => onGoToStep(1)}>
        <ReviewRow label={t('form.concerne.questionTitle')} value={concerne.concernePour === 'moi' ? t('form.concerne.myself') : t('form.concerne.another')} />
        <ReviewRow label={t('form.concerne.ageTitle')} value={formatAgeGroup(concerne.ageGroup)} />
        <ReviewRow label={t('form.concerne.sexTitle')} value={formatSex(concerne.sexe)} />
      </SectionCard>

      {/* Section 2 — Signalement */}
      <SectionCard title={t('form.steps.step2.label')} icon={<FileWarning className="w-4 h-4" />} onEdit={() => onGoToStep(2)}>
        <ReviewRow
          label={t('form.contenu.violenceTypeTitle')}
          value={contenu.violenceType === 'OTHER' ? `Autre — ${contenu.violenceTypeOther}` : contenu.violenceType}
        />
        <ReviewRow label={t('form.contenu.descriptionTitle')} value={contenu.description || '—'} />
      </SectionCard>

      {/* Section 3 — Plateformes */}
      <SectionCard title={t('form.contenu.platformsTitle')} icon={<Globe className="w-4 h-4" />} onEdit={() => onGoToStep(2)}>
        {contenu.platforms.map((p: any, i: number) => {
          const previews: string[] = localPreviews[i] || [];
          return (
          <div key={p.id} className={i > 0 ? 'pt-4 border-t border-slate-100 dark:border-emc-border-strong/60' : ''}>
            <p className="text-xs font-bold text-slate-700 dark:text-emc-secondary uppercase tracking-wide mb-3">
              {t('form.contenu.platformEntry', { index: i + 1 })}
            </p>
            <div className="space-y-2.5 ps-2">
              {/* Platform name resolved from ID */}
              <ReviewRow label={t('form.contenu.platformsTitle')} value={resolvePlatformName(p.platform)} />
              <ReviewRow label={t('form.contenu.selectContentType')} value={p.contentType} />
              <ReviewRow label={t('form.contenu.contentUrlLabel')} value={p.link} />

              {/* Screenshot thumbnails */}
              {previews.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-slate-500 dark:text-emc-secondary uppercase tracking-wide">
                    {t('form.contenu.screenshotsLabel')}
                  </span>
                  <div className="flex gap-2 flex-wrap mt-1">
                    {previews.filter(Boolean).map((src: string, idx: number) => (
                      <a
                        key={idx}
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative block w-20 h-20 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-emc-border-strong hover:border-blue-400 dark:hover:border-blue-500 transition-colors shadow-sm"
                        title={`Screenshot ${idx + 1}`}
                      >
                        <img
                          src={src}
                          alt={`Screenshot ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl" />
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-slate-500 dark:text-emc-secondary uppercase tracking-wide">
                    {t('form.contenu.screenshotsLabel')}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-emc-muted-fg italic mt-1">
                    <ImageIcon className="w-4 h-4 flex-shrink-0" />
                    <span>{t('form.contenu.noScreenshots', "Aucune capture d'écran")}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          );
        })}
      </SectionCard>

      {/* Section 4 — Accompagnement */}
      <SectionCard title={t('form.steps.step3.label')} icon={<HeartHandshake className="w-4 h-4" />} onEdit={() => onGoToStep(3)}>
        <ReviewRow label={t('form.accompagnement.wishTitle')} value={accompagnement.souhaite === 'oui' ? t('form.accompagnement.wishYes') : t('form.accompagnement.wishNo')} />
        {accompagnement.souhaite === 'oui' && (
          <>
            <ReviewRow label={t('form.accompagnement.firstName')} value={accompagnement.prenom} />
            <ReviewRow label={t('form.accompagnement.lastName')} value={accompagnement.nom} />
            <ReviewRow label={t('form.accompagnement.phone')} value={accompagnement.telephone} />
            <ReviewRow label={t('form.accompagnement.email')} value={accompagnement.email} />
            <ReviewRow label={t('form.accompagnement.city')} value={accompagnement.ville} />
            <ReviewRow
              label={t('form.accompagnement.typesTitle')}
              value={((accompagnement.types as string[]) ?? []).map((tVal) => {
                if (tVal === 'SUP') return t('form.accompagnement.typeSupport');
                if (tVal === 'JUR') return t('form.accompagnement.typeLegal');
                if (tVal === 'PSY') return t('form.accompagnement.typePsych');
                return tVal;
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
          {t('form.review.confirmLabel')}{' '}
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
            {t('form.review.submitting')}
          </span>
        ) : (
          t('form.review.submitBtn')
        )}
      </button>

      {!confirmed && (
        <p className="text-center text-xs text-slate-400 dark:text-emc-muted-fg">
          {t('form.review.mustConfirm')}
        </p>
      )}
    </div>
  );
};
