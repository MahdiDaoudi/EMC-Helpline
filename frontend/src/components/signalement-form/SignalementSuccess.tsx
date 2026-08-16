import React, { useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Download,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
} from 'lucide-react';

export interface SignalementSuccessProps {
  referenceNumber: string;
  password: string;
  onFinish: () => void;
}

const maskedPassword = (password: string) => (password ? '••••••••••••' : '••••••••••••');

export const SignalementSuccess: React.FC<SignalementSuccessProps> = ({
  referenceNumber,
  password,
  onFinish,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<'reference' | 'password' | 'all' | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);

  const passwordValue = useMemo(() => (showPassword ? password : maskedPassword(password)), [password, showPassword]);

  const copyText = async (text: string, field: 'reference' | 'password' | 'all') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setCopyError(null);
      window.setTimeout(() => setCopiedField(null), 1800);
    } catch {
      setCopiedField(null);
      setCopyError('Impossible de copier automatiquement. Veuillez copier manuellement.');
    }
  };

  const handleCopyReference = () => copyText(referenceNumber, 'reference');
  const handleCopyPassword = () => copyText(password, 'password');
  const handleCopyAll = () => copyText(`Numéro de référence: ${referenceNumber}\nMot de passe: ${password}`, 'all');

  const handleDownload = () => {
    const content = [
      'EMC HELPLINE',
      '========================',
      '',
      'Informations de suivi de votre signalement',
      '',
      'Numéro de référence:',
      referenceNumber,
      '',
      'Mot de passe:',
      password,
      '',
      'Important:',
      'Conservez ces informations dans un endroit sûr.',
      'Ne les partagez pas.',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'emc-helpline-credentials.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <style>{`
        @keyframes signalementFade {
          from {
            opacity: 0;
            transform: scale(0.985);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      <div
        className="mx-auto max-w-3xl animate-[signalementFade_0.25s_ease-out]"
        style={{ animation: 'signalementFade 0.25s ease-out' }}
      >
        <div className="rounded-[28px] border border-slate-200 dark:border-emc-border bg-white dark:bg-emc-surface p-5 shadow-sm sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shadow-sm shadow-emerald-200/40 dark:shadow-emerald-900/20">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-emc-primary sm:text-3xl">
              Votre signalement a été enregistré avec succès.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-emc-secondary">
              Conservez précieusement les informations ci-dessous. Elles vous permettront d&apos;accéder au suivi de votre signalement.
            </p>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 dark:border-emc-border bg-slate-50/80 dark:bg-emc-elevated/40 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-emc-secondary">
                  Numéro de référence
                </span>
                <button
                  type="button"
                  onClick={handleCopyReference}
                  aria-label="Copier le numéro de référence"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-600 dark:border-emc-border dark:bg-emc-surface dark:text-emc-secondary dark:hover:border-blue-700 dark:hover:text-blue-400"
                >
                  {copiedField === 'reference' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedField === 'reference' ? 'Copié' : 'Copier'}
                </button>
              </div>

              <p className="mt-3 break-all font-mono text-lg font-bold tracking-wide text-blue-700 dark:text-blue-300 sm:text-xl">
                {referenceNumber}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-emc-border bg-slate-50/80 dark:bg-emc-elevated/40 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-emc-secondary">
                  Mot de passe
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-600 dark:border-emc-border dark:bg-emc-surface dark:text-emc-secondary dark:hover:border-blue-700 dark:hover:text-blue-400"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {showPassword ? 'Masquer' : 'Afficher'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    aria-label="Copier le mot de passe"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-600 dark:border-emc-border dark:bg-emc-surface dark:text-emc-secondary dark:hover:border-blue-700 dark:hover:text-blue-400"
                  >
                    {copiedField === 'password' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedField === 'password' ? 'Copié' : 'Copier'}
                  </button>
                </div>
              </div>

              <p className="mt-3 break-all font-mono text-lg font-bold tracking-wide text-slate-900 dark:text-emc-primary sm:text-xl">
                {passwordValue}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-left dark:border-amber-900/50 dark:bg-amber-950/20">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Important</p>
                <p className="mt-1 text-sm leading-6 text-amber-700 dark:text-amber-200">
                  Ces informations sont confidentielles. Ne les partagez avec personne et conservez-les dans un endroit sûr.
                </p>
              </div>
            </div>
          </div>

          {copyError && (
            <p className="mt-4 text-sm text-rose-600 dark:text-rose-400">{copyError}</p>
          )}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleCopyAll}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 transition-all hover:from-blue-700 hover:to-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-emc-surface"
            >
              {copiedField === 'all' ? <ClipboardCheck className="h-4 w-4" /> : <ClipboardCheck className="h-4 w-4" />}
              {copiedField === 'all' ? 'Informations copiées' : 'Copier mes informations'}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-emc-border dark:bg-emc-surface dark:text-emc-primary dark:hover:bg-emc-elevated"
            >
              <Download className="h-4 w-4" />
              Télécharger mes informations
            </button>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={onFinish}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-900/40"
            >
              Terminer
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-emc-secondary">
            <Lock className="h-3.5 w-3.5 text-slate-400 dark:text-emc-muted-fg" />
            <span>Accès réservé au suivi confidentiel de votre dossier.</span>
          </div>
        </div>
      </div>
    </>
  );
};
