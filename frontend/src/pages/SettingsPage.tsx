import React, { useState } from 'react';
import { User, Sun, Moon, Monitor, Shield, Bell, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'security' | 'notifications'>('appearance');
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSave = () => {
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-emc-primary">
          Paramètres de l'Application
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-emc-secondary">
          Gérez le profil de votre compte, les préférences de thème et les paramètres de sécurité.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-emc-border gap-6 text-xs font-semibold overflow-x-auto">
        {[
          { id: 'appearance', label: 'Apparence & Thème', icon: Sun },
          { id: 'profile', label: 'Informations du Profil', icon: User },
          { id: 'security', label: 'Sécurité & Mot de passe', icon: Shield },
          { id: 'notifications', label: 'Notifications d\'Alerte', icon: Bell },
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

      {savedMessage && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" /> Paramètres mis à jour avec succès !
        </div>
      )}

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

      {activeTab === 'profile' && (
        <div className="emc-card p-6 space-y-4 max-w-2xl text-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-emc-primary">Détails du Profil</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 mb-1">Prénom</label>
              <input
                type="text"
                defaultValue={user?.firstName || 'Sarah'}
                className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border-strong"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Nom</label>
              <input
                type="text"
                defaultValue={user?.lastName || 'Alami'}
                className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border-strong"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-500 mb-1">Adresse E-mail Officielle</label>
            <input
              type="email"
              defaultValue={user?.email || 's.alami@emc-helpline.org'}
              className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border-strong"
            />
          </div>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-semibold shadow-sm"
          >
            Enregistrer les modifications
          </button>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="emc-card p-6 space-y-4 max-w-2xl text-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-emc-primary">Changer le Mot de passe</h3>
          <div>
            <label className="block text-slate-500 mb-1">Mot de passe actuel</label>
            <input
              type="password"
              placeholder="••••••••••••"
              className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border-strong"
            />
          </div>
          <div>
            <label className="block text-slate-500 mb-1">Nouveau mot de passe</label>
            <input
              type="password"
              placeholder="••••••••••••"
              className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-emc-elevated border border-slate-200 dark:border-emc-border-strong"
            />
          </div>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-semibold shadow-sm"
          >
            Mettre à jour les identifiants
          </button>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="emc-card p-6 space-y-4 max-w-2xl text-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-emc-primary">Préférences de Notification</h3>
          <div className="space-y-3">
            {[
              { title: 'Alertes de cas urgents', desc: 'Notifications par e-mail et toast pour les cas entrants à haute priorité' },
              { title: 'Mises à jour des suppressions', desc: 'Alertes lorsque les réseaux sociaux répondent aux demandes de retrait' },
              { title: 'Revues de validation', desc: 'Notifications lorsqu\'une validation technicien nécessite une signature' },
            ].map((n, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-emc-elevated/60">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-emc-primary">{n.title}</h4>
                  <p className="text-[11px] text-slate-500">{n.desc}</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-600" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

