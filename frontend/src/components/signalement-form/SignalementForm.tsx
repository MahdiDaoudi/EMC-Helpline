import React, { useState } from 'react';
import { Shield, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FormStepper } from './FormStepper';
import { ConcerneStep } from './ConcerneStep';
import { ContenuStep } from './ContenuStep';
import { AccompagnementStep } from './AccompagnementStep';
import { ReviewStep } from './ReviewStep';
import { SignalementSuccess } from './SignalementSuccess';
import type { PlatformEntryData } from './PlatformEntry';
import { SignalementsService } from '../../services/signalements.service';
import { trackingService } from '../../services/tracking.service';
import { useVictimAuth } from '../../context/VictimAuthContext';

// ─── Shared form data type (exported for child components) ───────────────────
export interface SignalementFormData {
  concerne: {
    concernePour: string;
    ageGroup: string;
    sexe: string;
  };
  contenu: {
    violenceType: string;
    violenceTypeOther: string;
    description: string;
    platforms: PlatformEntryData[];
  };
  accompagnement: {
    souhaite: string;
    prenom: string;
    nom: string;
    telephone: string;
    ville: string;
    email: string;
    types: string[];
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const generateId = () => Math.random().toString(36).slice(2, 10);

const emptyPlatform = (): PlatformEntryData => ({
  id: generateId(),
  platform: '',
  contentType: '',
  link: '',
  screenshots: [],
  screenshotPreviews: [],
});

const initialFormData = (): SignalementFormData => ({
  concerne: { concernePour: '', ageGroup: '', sexe: '' },
  contenu: {
    violenceType: '',
    violenceTypeOther: '',
    description: '',
    platforms: [emptyPlatform()],
  },
  accompagnement: {
    souhaite: '',
    prenom: '',
    nom: '',
    telephone: '',
    ville: '',
    email: '',
    types: ['SUP'],
  },
});

const mapContentType = (value: string): 'VIDEO' | 'IMAGE' | 'PROFILE' | 'POST' | 'COMMENT' | 'PAGE' => {
  switch (value) {
    case 'Publication':
      return 'POST';
    case 'Commentaire':
      return 'COMMENT';
    case 'Photo':
      return 'IMAGE';
    case 'Vidéo':
      return 'VIDEO';
    case 'Profil':
      return 'PROFILE';
    case 'Compte':
      return 'PROFILE';
    case 'Groupe':
      return 'PAGE';
    case 'Story':
    case 'Message':
    case 'Autre':
    default:
      return 'POST';
  }
};

const buildCreateSignalementDto = (data: SignalementFormData) => {
  const clean = (value?: string) => value?.trim() || undefined;

  const titulaire: 'MOI_MEME' | 'AUTRE_PERSONNE' = data?.concerne?.concernePour === 'autre'
    ? 'AUTRE_PERSONNE'
    : 'MOI_MEME';

  const rawTypes = Array.isArray(data?.accompagnement?.types) ? data.accompagnement.types : ['SUP'];
  const accompanimentTypes: Array<'SUP' | 'PSY' | 'JUR'> = rawTypes.map((type) => {
    if (type === 'JUR') return 'JUR';
    if (type === 'PSY') return 'PSY';
    return 'SUP';
  });

  const hasAccomp = data?.accompagnement?.souhaite === 'oui';

  const victim = {
    ...(hasAccomp && clean(data?.accompagnement?.prenom) ? { firstName: clean(data.accompagnement.prenom) } : {}),
    ...(hasAccomp && clean(data?.accompagnement?.nom) ? { lastName: clean(data.accompagnement.nom) } : {}),
    ...(hasAccomp && clean(data?.accompagnement?.email) ? { email: clean(data.accompagnement.email) } : {}),
    ...(hasAccomp && clean(data?.accompagnement?.telephone) ? { telephone: clean(data.accompagnement.telephone) } : {}),
    ...(hasAccomp && clean(data?.accompagnement?.ville) ? { city: clean(data.accompagnement.ville) } : {}),
    sex: (data?.concerne?.sexe || 'MALE') as 'MALE' | 'FEMALE',
    ageGroup: (data?.concerne?.ageGroup || 'YOUNG_ADULT_18_25') as
      | 'CHILD_5_12'
      | 'TEEN_13_17'
      | 'YOUNG_ADULT_18_25'
      | 'ADULT_26_PLUS',
  };

  const platforms = Array.isArray(data?.contenu?.platforms) ? data.contenu.platforms : [];

  const rawCyberId = Number(data?.contenu?.violenceType);
  const validCyberId = !isNaN(rawCyberId) && rawCyberId > 0 ? rawCyberId : undefined;

  return {
    description: clean(data?.contenu?.description),
    titulaire,
    accompanimentTypes,
    ...(data?.contenu?.violenceType !== 'OTHER' && validCyberId
      ? { cyberViolenceId: validCyberId }
      : {}),
    ...(data?.contenu?.violenceType === 'OTHER' && clean(data?.contenu?.violenceTypeOther)
      ? { otherCyberViolence: clean(data.contenu.violenceTypeOther) }
      : {}),
    victim,
    reportedItems: platforms.map((platform) => {
      const rawPlatId = Number(platform.platform);
      const validPlatId = !isNaN(rawPlatId) && rawPlatId > 0 ? rawPlatId : 1;
      return {
        contentUrl: (platform.link || '').trim(),
        type: mapContentType(platform.contentType || ''),
        platformId: validPlatId,
        screenshots: [],
      };
    }),
  };
};

// ─── Validation ───────────────────────────────────────────────────────────────
const isValidUrl = (url: string) => {
  try { new URL(url); return true; } catch { return false; }
};
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (tel: string) => /^[+]?[\d\s\-().]{8,20}$/.test(tel.trim());

type ConcerneErrors = Partial<Record<keyof SignalementFormData['concerne'], string>>;
type PlatformErrors = Partial<Record<keyof PlatformEntryData, string>>;
type ContenuErrors = { violenceType?: string; violenceTypeOther?: string; description?: string; platforms?: PlatformErrors[] };
type AccompErrors = Partial<Record<keyof SignalementFormData['accompagnement'] | 'types', string>>;
type TFn = (key: string) => string;

function validateStep1(d: SignalementFormData['concerne'], t: TFn): ConcerneErrors {
  const e: ConcerneErrors = {};
  if (!d.concernePour) e.concernePour = t('form.validation.requiredField');
  if (!d.ageGroup) e.ageGroup = t('form.validation.ageGroupRequired');
  if (!d.sexe) e.sexe = t('form.validation.sexRequired');
  return e;
}

function validateStep2(d: SignalementFormData['contenu'], t: TFn): ContenuErrors {
  const e: ContenuErrors = {};
  if (!d.violenceType) e.violenceType = t('form.validation.violenceTypeRequired');
  if (d.violenceType === 'OTHER' && !d.violenceTypeOther?.trim()) {
    e.violenceTypeOther = t('form.validation.requiredField');
  }
  const platformErrors: PlatformErrors[] = d.platforms.map((p) => {
    const pe: PlatformErrors = {};
    if (!p.platform) pe.platform = t('form.validation.platformRequired');
    if (!p.contentType) pe.contentType = t('form.validation.contentTypeRequired');
    if (!p.link) pe.link = t('form.validation.requiredField');
    else if (!isValidUrl(p.link)) pe.link = t('form.validation.urlInvalid');
    if (p.screenshots.length > 2) pe.screenshots = t('form.validation.screenshotsMaxExceeded');
    return pe;
  });
  if (platformErrors.some((pe) => Object.keys(pe).length > 0)) e.platforms = platformErrors;
  return e;
}

function validateStep3(d: SignalementFormData['accompagnement'], t: TFn): AccompErrors {
  const e: AccompErrors = {};
  if (!d.souhaite) e.souhaite = t('form.validation.requiredField');
  if (d.souhaite === 'oui') {
    if (!d.prenom?.trim()) e.prenom = t('form.validation.requiredField');
    if (!d.nom?.trim()) e.nom = t('form.validation.requiredField');
    if (!d.telephone?.trim()) e.telephone = t('form.validation.requiredField');
    else if (!isValidPhone(d.telephone)) e.telephone = t('form.validation.phoneInvalid');
    if (!d.ville?.trim()) e.ville = t('form.validation.requiredField');
    if (!d.email?.trim()) e.email = t('form.validation.requiredField');
    else if (!isValidEmail(d.email)) e.email = t('form.validation.emailInvalid');
    if ((d.types as string[]).length === 0) e.types = t('form.validation.typesRequired');
  }
  return e;
}

import { useTranslation } from 'react-i18next';

interface SignalementFormProps {
  isPublic?: boolean;
  isVictimAuth?: boolean;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const SignalementForm: React.FC<SignalementFormProps> = ({ isPublic = false, isVictimAuth = false }) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');
  const navigate = useNavigate();

  // Victim auth context — only used when isVictimAuth=true (safe to call always due to hooks rules)
  const { referenceNumber: victimRef } = useVictimAuth();

  const steps = [
    { number: 1, label: t('form.steps.step1.label'), sublabel: t('form.steps.step1.sublabel') },
    { number: 2, label: t('form.steps.step2.label'), sublabel: t('form.steps.step2.sublabel') },
    { number: 3, label: t('form.steps.step3.label'), sublabel: t('form.steps.step3.sublabel') },
    { number: 4, label: t('form.steps.step4.label'), sublabel: t('form.steps.step4.sublabel') },
  ];

  const [step, setStep] = useState(1);
  const [maxVisitedStep, setMaxVisitedStep] = useState(1);
  const [formData, setFormData] = useState<SignalementFormData>(initialFormData);
  const [step1Errors, setStep1Errors] = useState<ConcerneErrors>({});
  const [step2Errors, setStep2Errors] = useState<ContenuErrors>({});
  const [step3Errors, setStep3Errors] = useState<AccompErrors>({});
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [successPassword, setSuccessPassword] = useState('');

  // ─── Concerne handlers ────
  const handleConcerneChange = (field: keyof SignalementFormData['concerne'], value: string) => {
    setFormData((prev) => ({ ...prev, concerne: { ...prev.concerne, [field]: value } }));
    setStep1Errors((prev) => ({ ...prev, [field]: undefined }));
  };

  // ─── Contenu handlers ────
  const handleContenuChange = (field: keyof SignalementFormData['contenu'], value: unknown) => {
    setFormData((prev) => ({ ...prev, contenu: { ...prev.contenu, [field]: value } }));
    setStep2Errors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handlePlatformChange = (id: string, field: keyof PlatformEntryData, value: string | File[]) => {
    setFormData((prev) => ({
      ...prev,
      contenu: {
        ...prev.contenu,
        platforms: prev.contenu.platforms.map((p) =>
          p.id === id ? { ...p, [field]: value } : p
        ),
      },
    }));
  };

  const handleAddPlatform = () => {
    if (formData.contenu.platforms.length >= 5) return;
    setFormData((prev) => ({
      ...prev,
      contenu: { ...prev.contenu, platforms: [...prev.contenu.platforms, emptyPlatform()] },
    }));
  };

  const handleRemovePlatform = (id: string) => {
    if (formData.contenu.platforms.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      contenu: { ...prev.contenu, platforms: prev.contenu.platforms.filter((p) => p.id !== id) },
    }));
  };

  // ─── Accompagnement handlers ────
  const handleAccompChange = (field: keyof SignalementFormData['accompagnement'], value: unknown) => {
    setFormData((prev) => ({ ...prev, accompagnement: { ...prev.accompagnement, [field]: value } }));
    setStep3Errors((prev) => ({ ...prev, [field]: undefined }));
  };

  // ─── Navigation ────
  const goNext = () => {
    if (step === 1) {
      const errors = validateStep1(formData.concerne, t);
      setStep1Errors(errors);
      if (Object.keys(errors).length > 0) return;
    }
    if (step === 2) {
      const errors = validateStep2(formData.contenu, t);
      setStep2Errors(errors);
      if (Object.keys(errors).length > 0 || (errors.platforms && errors.platforms.some((e) => Object.keys(e).length > 0))) return;
    }
    if (step === 3) {
      const errors = validateStep3(formData.accompagnement, t);
      setStep3Errors(errors);
      if (Object.keys(errors).length > 0) return;
    }
    const nextStep = Math.min(step + 1, 4);
    setStep(nextStep);
    setMaxVisitedStep((prev) => Math.max(prev, nextStep));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStepClick = (targetStep: number) => {
    // Going backwards is always allowed without validation errors blocking
    if (targetStep < step) {
      setStep(targetStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Going forward requires current step validation
    if (targetStep > step) {
      if (step === 1) {
        const errors = validateStep1(formData.concerne, t);
        setStep1Errors(errors);
        if (Object.keys(errors).length > 0) return;
      }
      if (step === 2) {
        const errors = validateStep2(formData.contenu, t);
        setStep2Errors(errors);
        if (Object.keys(errors).length > 0 || (errors.platforms && errors.platforms.some((e) => Object.keys(e).length > 0))) return;
      }
      if (step === 3) {
        const errors = validateStep3(formData.accompagnement, t);
        setStep3Errors(errors);
        if (Object.keys(errors).length > 0) return;
      }
      setStep(targetStep);
      setMaxVisitedStep((prev) => Math.max(prev, targetStep));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ─── Submit ────
  const handleSubmit = async () => {
    const err1 = validateStep1(formData.concerne, t);
    const err2 = validateStep2(formData.contenu, t);
    const err3 = validateStep3(formData.accompagnement, t);
    setStep1Errors(err1);
    setStep2Errors(err2);
    setStep3Errors(err3);

    if (
      Object.keys(err1).length > 0 ||
      Object.keys(err2).length > 0 ||
      (err2.platforms && err2.platforms.some((e) => Object.keys(e).length > 0)) ||
      Object.keys(err3).length > 0
    ) {
      setSubmitError(t('form.validation.formErrorSummary'));
      return;
    }

    if (!confirmed) return;
    setSubmitting(true);
    setSubmitError(undefined);
    try {
      const dto = buildCreateSignalementDto(formData);
      const filesByReportedItem = (formData?.contenu?.platforms || []).map((platform) => platform.screenshots || []);

      if (isVictimAuth) {
        const { victim: _omit, ...victimDto } = dto;
        await trackingService.createVictimSignalement(victimDto as any, filesByReportedItem);
        setReferenceNumber(victimRef || '');
        setSubmitted(true);
      } else {
        const response = isPublic
          ? await SignalementsService.createPublicSignalement(dto, filesByReportedItem)
          : await SignalementsService.createSignalement(dto, filesByReportedItem);

        const ref = response.victim?.referenceNumber || '';
        const password = response.password || '';
        setReferenceNumber(ref);
        setSuccessPassword(password);
        setSubmitted(true);
      }
    } catch (err: any) {
      console.error('Signalement submit error:', err, err?.response?.data);
      const responseData = err?.response?.data;
      let serverMessage: string | undefined;

      if (responseData) {
        if (responseData.error && typeof responseData.error === 'object') {
          const fieldErrors = Object.entries(responseData.error)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join(' | ');
          serverMessage = `${responseData.message || 'Erreur de validation'}: ${fieldErrors}`;
        } else if (typeof responseData.message === 'string') {
          serverMessage = responseData.message;
        }
      }

      setSubmitError(serverMessage || err?.message || t('form.validation.submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Success screen ────
  if (submitted) {
    if (isVictimAuth) {
      return (
        <div className="mx-auto max-w-2xl bg-white dark:bg-emc-surface border border-slate-200 dark:border-emc-border rounded-3xl p-8 shadow-sm text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-emc-primary">
              {t('tracking.newSuccess.title')}
            </h2>
            <p className="text-xs text-slate-600 dark:text-emc-secondary max-w-md mx-auto leading-relaxed">
              {t('tracking.newSuccess.description')}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 inline-block">
            <span className="text-xs text-slate-500 dark:text-emc-secondary uppercase font-bold block mb-1">
              {t('tracking.newSuccess.accountRefLabel')}
            </span>
            <span className="font-mono text-xl font-bold text-blue-700 dark:text-blue-300">
              {victimRef}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-emc-secondary">
            {t('tracking.newSuccess.samePasswordNotice')}
          </p>

          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={() => navigate('/suivi/tableau-de-bord')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-sm shadow-md hover:from-blue-700 hover:to-blue-600 transition-all cursor-pointer"
            >
              <span>{t('tracking.newSuccess.viewDashboardBtn')}</span>
              {isArabic ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      );
    }

    return (
      <SignalementSuccess
        referenceNumber={referenceNumber}
        password={successPassword}
        onFinish={() => {
          setSubmitted(false);
          setReferenceNumber('');
          setSuccessPassword('');
          setFormData(initialFormData());
          setStep(1);
          setMaxVisitedStep(1);
          setConfirmed(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Interactive Stepper */}
      <div className="bg-white dark:bg-emc-surface border border-slate-200 dark:border-emc-border rounded-2xl p-5 shadow-sm">
        <FormStepper
          currentStep={step}
          maxVisitedStep={maxVisitedStep}
          steps={steps}
          onStepClick={handleStepClick}
        />
      </div>

      {/* Step content card */}
      <div className="bg-white dark:bg-emc-surface border border-slate-200 dark:border-emc-border rounded-2xl shadow-sm">
        {/* Card header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-emc-border flex items-center gap-3 bg-slate-50/50 dark:bg-emc-elevated/30">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-sm flex-shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-emc-primary">
              {t('form.stepOf', { current: step, total: steps.length })} — {steps[step - 1]?.label}
            </h2>
            <p className="text-xs text-slate-500 dark:text-emc-secondary">{steps[step - 1]?.sublabel}</p>
          </div>
        </div>

        {/* Step body */}
        <div className="p-6">
          {step === 1 && (
            <ConcerneStep
              data={formData.concerne}
              errors={step1Errors}
              onChange={handleConcerneChange}
            />
          )}
          {step === 2 && (
            <ContenuStep
              data={formData.contenu}
              errors={step2Errors}
              onChange={handleContenuChange}
              onPlatformChange={handlePlatformChange}
              onAddPlatform={handleAddPlatform}
              onRemovePlatform={handleRemovePlatform}
            />
          )}
          {step === 3 && (
            <AccompagnementStep
              data={formData.accompagnement}
              errors={step3Errors}
              onChange={handleAccompChange}
            />
          )}
          {step === 4 && (
            <ReviewStep
              data={formData}
              confirmed={confirmed}
              onConfirmChange={setConfirmed}
              onGoToStep={handleStepClick}
              onSubmit={handleSubmit}
              submitting={submitting}
              submitError={submitError}
            />
          )}
        </div>

        {/* Navigation footer */}
        {step < 4 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-emc-border flex items-center justify-between bg-slate-50/50 dark:bg-emc-elevated/20">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 1}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${step === 1
                ? 'text-slate-300 dark:text-emc-muted-fg cursor-not-allowed'
                : 'text-slate-700 dark:text-emc-secondary hover:bg-slate-100 dark:hover:bg-emc-elevated border border-slate-200 dark:border-emc-border-strong'
                }`}
            >
              {isArabic ? `← ${t('form.previousStep')}` : `← ${t('form.previousStep')}`}
            </button>

            <div className="text-xs font-medium text-slate-500 dark:text-emc-secondary">
              {t('form.stepOf', { current: step, total: steps.length })}
            </div>

            <button
              type="button"
              onClick={goNext}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-sm shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
            >
              {isArabic ? `${t('form.nextStep')} ←` : `${t('form.nextStep')} →`}
            </button>
          </div>
        )}
      </div>

      {/* Privacy notice */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-emc-secondary px-1">
        <Shield className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
        <span>
          {t('form.confidentialNotice')}
        </span>
      </div>
    </div>
  );
};
