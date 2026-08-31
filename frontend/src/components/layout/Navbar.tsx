import React, { useState } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import {
  Menu,
  Search,
  Sun,
  Moon,
  Bell,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  User as UserIcon,
  ChevronsUpDown,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onToggleMobileSidebar: () => void;
  onOpenSearch: () => void;
}

function getPageName(pathname: string): string {
  if (pathname === '/') return 'Tableau de bord';
  if (pathname.startsWith('/signalements/nouveau')) return 'Nouveau Signalement';
  if (pathname.startsWith('/signalements/')) return 'Détails du Signalement';
  if (pathname.startsWith('/signalements')) return 'Signalements';
  if (pathname.startsWith('/victims')) return 'Registre des victimes';
  if (pathname.startsWith('/cyberviolences')) return 'Types de Cyberviolence';
  if (pathname.startsWith('/platforms') || pathname.startsWith('/admin/platforms')) return 'Plateformes';
  if (pathname.startsWith('/organizations') || pathname.startsWith('/admin/organizations')) return 'Organisations';
  if (pathname.startsWith('/assignments')) return 'Affectations';
  if (pathname.startsWith('/users') || pathname.startsWith('/admin/users')) return 'Utilisateurs';
  if (pathname.startsWith('/roles')) return 'Rôles';
  if (pathname.startsWith('/profile')) return 'Profil';
  if (pathname.startsWith('/settings')) return 'Paramètres';
  return '';
}

export const Navbar: React.FC<NavbarProps> = ({
  collapsed = false,
  onToggleCollapse,
  onToggleMobileSidebar,
  onOpenSearch,
}) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const pageName = getPageName(location.pathname);

  const notifications = [
    { id: 1, title: 'Cas urgent assigné', text: 'SIG-2026-0891 affecté à l\'équipe juridique', time: 'Il y a 10 min', unread: true },
    { id: 2, title: 'Réponse de plateforme', text: 'Meta a reconnu le rapport de suppression #142', time: 'Il y a 1h', unread: true },
    { id: 3, title: 'Validation technicien', text: 'Cas SIG-2026-0889 validé par Karim Tazi', time: 'Il y a 3h', unread: false },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-emc-sidebar/90 backdrop-blur-md px-4 md:px-6 flex items-center justify-between transition-colors">
      {/* Left: Mobile Toggle, Desktop Collapse Arrow & Greeting */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-emc-secondary dark:hover:text-emc-primary hover:bg-slate-100 dark:hover:bg-emc-elevated"
          aria-label="Toggle mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Collapse Arrow Button in Top Navbar */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-emc-secondary dark:hover:text-emc-primary hover:bg-slate-100 dark:hover:bg-emc-elevated transition-colors"
            title={collapsed ? 'Développer le panneau' : 'Réduire le panneau'}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        )}

        <div className="flex items-center gap-3">
          <h1 className="text-sm md:text-base font-bold text-[#0C1E4A] dark:text-emc-primary tracking-tight">
            {pageName || 'Helpline EMCS'}
          </h1>
        </div>
      </div>

      {/* Right: Search, Notifications, Theme & User Profile Dropdown */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Search Icon Trigger Pill */}
        <button
          onClick={onOpenSearch}
          className="w-9 h-9 rounded-full bg-slate-100 dark:bg-emc-elevated flex items-center justify-center text-slate-500 dark:text-emc-secondary hover:bg-slate-200 dark:hover:bg-emc-surface-hover transition-colors"
          title="Rechercher..."
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setUserDropdownOpen(false);
            }}
            className="relative w-9 h-9 rounded-full bg-slate-100 dark:bg-emc-elevated flex items-center justify-center text-slate-500 dark:text-emc-secondary hover:bg-slate-200 dark:hover:bg-emc-surface-hover transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF5500] ring-2 ring-white dark:ring-emc-page" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-emc-elevated border border-slate-200 dark:border-emc-border-strong rounded-xl shadow-xl z-50 p-3">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-emc-border-strong">
                <span className="text-xs font-semibold text-slate-900 dark:text-emc-primary">
                  Alertes d'activité
                </span>
                <span className="text-[10px] text-[#1665FF] dark:text-blue-400 cursor-pointer font-medium hover:underline">
                  Tout marquer comme lu
                </span>
              </div>
              <div className="space-y-2">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`p-2 rounded-lg text-xs transition-colors ${item.unread
                        ? 'bg-blue-50/60 dark:bg-blue-950/30'
                        : 'hover:bg-slate-50 dark:hover:bg-emc-surface-hover/50'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-slate-900 dark:text-emc-primary">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-slate-400">{item.time}</span>
                    </div>
                    <p className="text-slate-600 dark:text-emc-secondary text-[11px]">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-full bg-slate-100 dark:bg-emc-elevated flex items-center justify-center text-slate-500 dark:text-emc-secondary hover:bg-slate-200 dark:hover:bg-emc-surface-hover transition-colors"
          title={`Passer en mode ${resolvedTheme === 'dark' ? 'clair' : 'sombre'}`}
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* User Profile Button & Dropdown on Far Right Top Navbar */}
        <div className="relative pl-1">
          <button
            onClick={() => {
              setUserDropdownOpen(!userDropdownOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2.5 p-1 pl-1.5 pr-2.5 rounded-full bg-slate-100 dark:bg-emc-elevated hover:bg-slate-200 dark:hover:bg-emc-surface-hover transition-colors text-left"
          >
            <div className="relative flex-shrink-0">
              {user?.profileImageUrl && !avatarError ? (
                <img
                  src={user.profileImageUrl}
                  alt={`${user.firstName} ${user.lastName}`}
                  onError={() => setAvatarError(true)}
                  className="w-7 h-7 rounded-full object-cover shadow-2xs"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-2xs">
                  {user?.firstName?.[0] || 'U'}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border-2 border-white dark:border-emc-sidebar rounded-full" />
            </div>

            <div className="hidden sm:flex flex-col min-w-0 pr-0.5">
              <span className="text-xs font-bold  text-[#0C1E4A] dark:text-emc-primary truncate leading-tight">
                {user?.firstName || 'Kate'} {user?.lastName || 'Moore'}
              </span>
              <span className="text-[10px] text-slate-400 truncate leading-tight font-medium">
                {user?.role?.name || 'Admin'}
              </span>
            </div>

            <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* User Profile Dropdown Menu */}
          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 p-1.5 bg-white dark:bg-emc-elevated border border-slate-200 dark:border-emc-border-strong rounded-2xl shadow-xl z-50">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-emc-border-strong/80 mb-1">
                <p className="text-xs font-bold text-[#0C1E4A] dark:text-emc-primary truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.email || 'kate@acme.com'}
                </p>
              </div>

              <NavLink
                to="/profile"
                onClick={() => setUserDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-emc-primary hover:bg-slate-100 dark:hover:bg-emc-surface-hover/60 rounded-xl transition-colors"
              >
                <UserIcon className="w-4 h-4 text-slate-400" />
                <span>Profil & Compte</span>
              </NavLink>
              <NavLink
                to="/settings"
                onClick={() => setUserDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-emc-primary hover:bg-slate-100 dark:hover:bg-emc-surface-hover/60 rounded-xl transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Paramètres</span>
              </NavLink>

              <div className="my-1 border-t border-slate-100 dark:border-emc-border-strong/80" />

              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Se déconnecter</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
