import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [verifying, setVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVerifying(false);
      if (token && token !== 'invalid' && token !== 'expired') {
        setIsSuccess(true);
      } else {
        setIsSuccess(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [token]);

  return (
    <div className="space-y-5 text-center">
      {verifying ? (
        <div className="space-y-4">
          <Loader2 className="w-6 h-6 animate-spin text-slate-600 dark:text-emc-secondary mx-auto" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-emc-primary">
            Vérification de l&apos;adresse e-mail…
          </h2>
          <p className="text-sm text-slate-500 dark:text-emc-secondary">
            Connexion au serveur d&apos;authentification sécurisé
          </p>
        </div>
      ) : isSuccess ? (
        <div className="space-y-5">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-emc-primary">
              Adresse e-mail confirmée
            </h2>
            <p className="text-sm text-slate-500 dark:text-emc-secondary mt-2 leading-relaxed">
              Votre adresse e-mail professionnelle a été vérifiée. Vous pouvez accéder à votre espace de gestion.
            </p>
          </div>

          <Link
            to="/login"
            className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors block"
          >
            Se connecter
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="w-11 h-11 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-emc-primary">
              Lien de vérification invalide
            </h2>
            <p className="text-sm text-slate-500 dark:text-emc-secondary mt-2 leading-relaxed">
              Ce lien de vérification n&apos;est plus valide ou a expiré.
            </p>
          </div>

          <Link
            to="/login"
            className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-slate-700 dark:text-emc-secondary hover:bg-slate-50 dark:hover:bg-emc-elevated transition-colors block"
          >
            Retour à la connexion
          </Link>
        </div>
      )}
    </div>
  );
};
