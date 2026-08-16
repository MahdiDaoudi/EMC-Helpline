import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { FormStepper } from './FormStepper';
import { ConcerneStep } from './ConcerneStep';
import { ContenuStep } from './ContenuStep';
import { AccompagnementStep } from './AccompagnementStep';
import { ReviewStep } from './ReviewStep';
import { SignalementSuccess } from './SignalementSuccess';
import type { PlatformEntryData } from './PlatformEntry';
import { SignalementsService } from '../../services/signalements.service';

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
  const clean = <T extends string | undefined>(value: T) => value?.trim() || undefined;

  const titulaire: 'MOI_MEME' | 'AUTRE_PERSONNE' = data.concerne.concernePour === 'autre'
    ? 'AUTRE_PERSONNE'
    : 'MOI_MEME';

  const accompanimentTypes: Array<'SUP' | 'PSY' | 'JUR'> = (data.accompagnement.types as string[]).map((type) => {
    if (type === 'JUR') return 'JUR';
    if (type === 'PSY') return 'PSY';
    return 'SUP';
  });

  const victim = {
    ...(clean(data.accompagnement.prenom) ? { firstName: clean(data.accompagnement.prenom) } : {}),
    ...(clean(data.accompagnement.nom) ? { lastName: clean(data.accompagnement.nom) } : {}),
    ...(clean(data.accompagnement.email) ? { email: clean(data.accompagnement.email) } : {}),
    ...(clean(data.accompagnement.telephone) ? { telephone: clean(data.accompagnement.telephone) } : {}),
    ...(clean(data.accompagnement.ville) ? { city: clean(data.accompagnement.ville) } : {}),
    sex: data.concerne.sexe as 'MALE' | 'FEMALE',
    ageGroup: data.concerne.ageGroup as
      | 'CHILD_5_12'
      | 'TEEN_13_17'
      | 'YOUNG_ADULT_18_25'
      | 'ADULT_26_PLUS',
  };

  return {
    description: clean(data.contenu.description),
    titulaire,
    accompanimentTypes,
    ...(data.contenu.violenceType !== 'OTHER' && data.contenu.violenceType
      ? { cyberViolenceId: Number(data.contenu.violenceType) }
      : {}),
    ...(data.contenu.violenceType === 'OTHER' && clean(data.contenu.violenceTypeOther)
      ? { otherCyberViolence: clean(data.contenu.violenceTypeOther) }
      : {}),
    victim,
    reportedItems: data.contenu.platforms.map((platform) => ({
      contentUrl: platform.link.trim(),
      type: mapContentType(platform.contentType),
      platformId: Number(platform.platform),
      screenshots: [],
    })),
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

function validateStep1(d: SignalementFormData['concerne']): ConcerneErrors {
  const e: ConcerneErrors = {};
  if (!d.concernePour) e.concernePour = 'Ce champ est obligatoire.';
  if (!d.ageGroup) e.ageGroup = 'Veuillez sélectionner une tranche d\'âge.';
  if (!d.sexe) e.sexe = 'Veuillez sélectionner un sexe.';
  return e;
}

function validateStep2(d: SignalementFormData['contenu']): ContenuErrors {
  const e: ContenuErrors = {};
  if (!d.violenceType) e.violenceType = 'Veuillez sélectionner un type de cyberviolence.';
  if (d.violenceType === 'OTHER' && !d.violenceTypeOther?.trim()) {
    e.violenceTypeOther = 'Ce champ est obligatoire.';
  }
  const platformErrors: PlatformErrors[] = d.platforms.map((p) => {
    const pe: PlatformErrors = {};
    if (!p.platform) pe.platform = 'Veuillez sélectionner une plateforme.';
    if (!p.contentType) pe.contentType = 'Veuillez sélectionner un type de contenu.';
    if (!p.link) pe.link = 'Ce champ est obligatoire.';
    else if (!isValidUrl(p.link)) pe.link = 'Veuillez saisir une URL valide.';
    if (p.screenshots.length === 0) pe.screenshots = 'Veuillez ajouter au moins une capture d\'écran.';
    else if (p.screenshots.length > 2) pe.screenshots = 'Vous pouvez ajouter au maximum 2 captures d\'écran par lien.';
    return pe;
  });
  if (platformErrors.some((pe) => Object.keys(pe).length > 0)) e.platforms = platformErrors;
  return e;
}

function validateStep3(d: SignalementFormData['accompagnement']): AccompErrors {
  const e: AccompErrors = {};
  if (!d.souhaite) e.souhaite = 'Ce champ est obligatoire.';
  if (d.souhaite === 'oui') {
    if (!d.prenom?.trim()) e.prenom = 'Ce champ est obligatoire.';
    if (!d.nom?.trim()) e.nom = 'Ce champ est obligatoire.';
    if (!d.telephone?.trim()) e.telephone = 'Ce champ est obligatoire.';
    else if (!isValidPhone(d.telephone)) e.telephone = 'Veuillez saisir un numéro de téléphone valide.';
    if (!d.ville?.trim()) e.ville = 'Ce champ est obligatoire.';
    if (!d.email?.trim()) e.email = 'Ce champ est obligatoire.';
    else if (!isValidEmail(d.email)) e.email = 'Veuillez saisir une adresse e-mail valide.';
    if ((d.types as string[]).length === 0) e.types = 'Veuillez sélectionner au moins un type d\'accompagnement.';
  }
  return e;
}

// ─── STEPS definition ─────────────────────────────────────────────────────────
const STEPS = [
  { number: 1, label: 'Concerne', sublabel: 'Qui est concerné ?' },
  { number: 2, label: 'Contenu', sublabel: 'Décrire les faits' },
  { number: 3, label: 'Accompagnement', sublabel: 'Besoin d\'aide ?' },
  { number: 4, label: 'Vérification', sublabel: 'Relire et envoyer' },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export const SignalementForm: React.FC = () => {
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
      const errors = validateStep1(formData.concerne);
      setStep1Errors(errors);
      if (Object.keys(errors).length > 0) return;
    }
    if (step === 2) {
      const errors = validateStep2(formData.contenu);
      setStep2Errors(errors);
      if (Object.keys(errors).length > 0 || (errors.platforms && errors.platforms.some((e) => Object.keys(e).length > 0))) return;
    }
    if (step === 3) {
      const errors = validateStep3(formData.accompagnement);
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
        const errors = validateStep1(formData.concerne);
        setStep1Errors(errors);
        if (Object.keys(errors).length > 0) return;
      }
      if (step === 2) {
        const errors = validateStep2(formData.contenu);
        setStep2Errors(errors);
        if (Object.keys(errors).length > 0 || (errors.platforms && errors.platforms.some((e) => Object.keys(e).length > 0))) return;
      }
      if (step === 3) {
        const errors = validateStep3(formData.accompagnement);
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
    // Re-verify all steps before submit
    const err1 = validateStep1(formData.concerne);
    const err2 = validateStep2(formData.contenu);
    const err3 = validateStep3(formData.accompagnement);
    setStep1Errors(err1);
    setStep2Errors(err2);
    setStep3Errors(err3);

    if (
      Object.keys(err1).length > 0 ||
      Object.keys(err2).length > 0 ||
      (err2.platforms && err2.platforms.some((e) => Object.keys(e).length > 0)) ||
      Object.keys(err3).length > 0
    ) {
      setSubmitError('Veuillez corriger les erreurs dans le formulaire avant l\'envoi.');
      return;
    }

    if (!confirmed) return;
    setSubmitting(true);
    setSubmitError(undefined);
    try {
      const dto = buildCreateSignalementDto(formData);
      const filesByReportedItem = formData.contenu.platforms.map((platform) => platform.screenshots);
      console.log('SCREENSHOTS BEFORE FORMDATA:', filesByReportedItem);
      const response = await SignalementsService.createSignalement(dto, filesByReportedItem);
      const ref = response.victim?.referenceNumber || '';
      const password = response.password || '';
      setReferenceNumber(ref);
      setSuccessPassword(password);
      setSubmitted(true);
    } catch {
      setSubmitError('Une erreur est survenue lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Success screen ────
  if (submitted) {
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
    <div className="space-y-6">
      {/* Interactive Stepper */}
      <div className="bg-white dark:bg-emc-surface border border-slate-200 dark:border-emc-border rounded-2xl p-5 shadow-sm">
        <FormStepper
          currentStep={step}
          maxVisitedStep={maxVisitedStep}
          steps={STEPS}
          onStepClick={handleStepClick}
        />
      </div>

      {/* Step content card */}
      <div className="bg-white dark:bg-emc-surface border border-slate-200 dark:border-emc-border rounded-2xl shadow-sm">
        {/* Card header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-emc-border flex items-center gap-3 bg-slate-50/50 dark:bg-emc-elevated/30">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-sm">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-emc-primary">
              Étape {step} — {STEPS[step - 1]?.label}
            </h2>
            <p className="text-xs text-slate-500 dark:text-emc-secondary">{STEPS[step - 1]?.sublabel}</p>
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
              ← Étape précédente
            </button>

            <div className="text-xs font-medium text-slate-500 dark:text-emc-secondary">
              Étape {step} sur {STEPS.length}
            </div>

            <button
              type="button"
              onClick={goNext}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-sm shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
            >
              Étape suivante →
            </button>
          </div>
        )}
      </div>

      {/* Privacy notice */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-emc-secondary px-1">
        <Shield className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
        <span>
          Vos données sont traitées de façon strictement confidentielle conformément à la politique de confidentialité de la plateforme.
        </span>
      </div>
    </div>
  );
};
