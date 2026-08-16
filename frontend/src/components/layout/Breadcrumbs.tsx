import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const routeLabels: Record<string, string> = {
  signalements: 'Signalements',
  victims: 'victims',
  platforms: 'Plateformes',
  'platform-reports': 'Rapports plateformes',
  assignments: 'Affectations',
  validates: 'Validations',
  organizations: 'Organisations',
  users: 'Utilisateurs',
  roles: 'Rôles',
  settings: 'Paramètres',
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-emc-secondary mb-1">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-emc-primary transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Tableau de bord</span>
      </Link>

      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const label = routeLabels[value] || value.toUpperCase();

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            {isLast ? (
              <span className="font-medium text-slate-900 dark:text-emc-primary">{label}</span>
            ) : (
              <Link to={to} className="hover:text-slate-900 dark:hover:text-emc-primary transition-colors">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

