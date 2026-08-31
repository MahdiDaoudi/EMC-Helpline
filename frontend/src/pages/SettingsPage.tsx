import React, { useState } from 'react';
import { Sun, Moon, Monitor, Bell } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'notifications'>('appearance');
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-emc-primary">
          Paramètres de l'Application
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-emc-secondary">
          Gérez vos préférences d'affichage, de thème et de notifications.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-emc-border gap-6 text-xs font-semibold overflow-x-auto">
        {[
          { id: 'appearance', label: 'Apparence & Thème', icon: Sun },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-3 border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-emc-primary'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeTab === 'appearance' && (
        <div className="emc-card p-6 space-y-6 max-w-2xl">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-emc-primary">Thème de l'interface</h3>
            <p className="text-xs text-slate-500">
              Sélectionnez l'apparence du tableau de bord EMC Helpline pour votre session.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'light', label: 'Clair', icon: Sun, desc: 'Haut contraste' },
              { id: 'dark', label: 'Sombre', icon: Moon, desc: 'Mode sombre professionnel' },
              { id: 'system', label: 'Système', icon: Monitor, desc: 'Identique au système' },
            ].map((t) => {
              const Icon = t.icon;
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 ring-2 ring-blue-600/20'
                      : 'border-slate-200 dark:border-emc-border hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-3" />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-emc-primary">{t.label}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{t.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
