import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, FileText, Shield, CheckSquare } from 'lucide-react';

export const QuickActions: React.FC = () => {
  const actions = [
    {
      title: 'Nouveau Signalement',
      subtitle: 'Créer un signalement',
      to: '/signalements/nouveau',
      icon: PlusCircle,
      color: 'bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-700',
    },
    {
      title: 'Tous les Signalements',
      subtitle: 'Rechercher & filtrer',
      to: '/signalements',
      icon: FileText,
      color: 'bg-slate-100 dark:bg-emc-elevated text-slate-900 dark:text-emc-primary hover:bg-slate-200 dark:hover:bg-emc-surface-hover',
    },
    {
      title: 'Registre des Victimes',
      subtitle: 'Dossiers confidentiels',
      to: '/victims',
      icon: Shield,
      color: 'bg-slate-100 dark:bg-emc-elevated text-slate-900 dark:text-emc-primary hover:bg-slate-200 dark:hover:bg-emc-surface-hover',
    },
    {
      title: 'Affectations de Cas',
      subtitle: 'Suivi des attributions',
      to: '/assignments',
      icon: CheckSquare,
      color: 'bg-slate-100 dark:bg-emc-elevated text-slate-900 dark:text-emc-primary hover:bg-slate-200 dark:hover:bg-emc-surface-hover',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {actions.map((act, idx) => {
        const Icon = act.icon;
        return (
          <Link
            key={idx}
            to={act.to}
            className={`p-3.5 rounded-xl border border-slate-200 dark:border-emc-border flex items-center gap-3 transition-all ${act.color}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <div className="min-w-0">
              <h4 className="text-xs font-bold truncate leading-tight">{act.title}</h4>
              <p className="text-[10px] opacity-80 truncate leading-tight">{act.subtitle}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
