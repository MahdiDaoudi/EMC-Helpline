import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  LayoutDashboard,
  FileText,
  Users,
  Globe,
  Share2,
  CheckCircle2,
  Building2,
  UserCheck,
  Shield,
  Settings,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import icon_lightmode from '../../assets/icon-lightmode.png';
import logo_lightmode from '../../assets/logo-lightmode.png';
import logo_darkmode from '../../assets/logo-darkmode.png';
import icon_darkmode from '../../assets/icon-darkmode.png';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse?: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  mobileOpen,
  onCloseMobile,
}) => {
  const location = useLocation();
  const { resolvedTheme } = useTheme();

  const navigationGroups: NavGroup[] = [
    {
      groupTitle: 'PRINCIPAL',
      items: [
        { title: 'Tableau de bord', href: '/', icon: LayoutDashboard },
        { title: 'Signalements', href: '/signalements', icon: FileText, badge: '142', badgeColor: 'bg-amber-500/20 text-amber-600 dark:text-amber-400' },
        { title: 'victims', href: '/victims', icon: Users },
      ],
    },
    {
      groupTitle: 'PLATEFORMES',
      items: [
        { title: 'Plateformes', href: '/platforms', icon: Globe },
        { title: 'Rapports Plateformes', href: '/platform-reports', icon: Share2, badge: '8', badgeColor: 'bg-blue-500/20 text-blue-600 dark:text-blue-400' },
      ],
    },
    {
      groupTitle: 'GESTION DES CAS',
      items: [
        { title: 'Affectations', href: '/assignments', icon: Building2 },
        { title: 'Validations', href: '/validates', icon: CheckCircle2, badge: '12', badgeColor: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' },
        { title: 'Organisations', href: '/organizations', icon: Shield },
      ],
    },
    {
      groupTitle: 'ADMINISTRATION',
      items: [
        { title: 'Utilisateurs', href: '/users', icon: UserCheck },
        { title: 'Rôles', href: '/roles', icon: ShieldAlert },
        { title: 'Mon profil', href: '/profile', icon: UserCheck },
        { title: 'Paramètres', href: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white dark:bg-emc-sidebar border-r border-slate-200 dark:border-emc-border transition-all duration-300 ${collapsed ? 'w-[76px]' : 'w-[260px]'
          } ${mobileOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Sidebar Header / Centered & Larger Logo */}
        <div className="h-16 flex items-center justify-center px-4 py-2 border-b border-slate-100 dark:border-emc-border/60 flex-shrink-0">
          {collapsed ? (
            <img
              src={resolvedTheme === 'dark' ? icon_darkmode : icon_lightmode}
              alt="EMC Helpline Icon"
              className="h-full w-auto object-contain transition-all"
            />
          ) : (
            <img
              src={resolvedTheme === 'dark' ? logo_darkmode : logo_lightmode}
              alt="EMC Helpline Logo"
              className="h-20 max-w-[210px] w-auto object-contain transition-all"
            />
          )}
        </div>

        {/* Navigation Section List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navigationGroups.map((group, groupIdx) => (
            <div key={groupIdx}>
              {!collapsed && (
                <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  {group.groupTitle}
                </div>
              )}
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;

                  return (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      onClick={() => onCloseMobile()}
                      title={collapsed ? item.title : undefined}
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${isActive
                          ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 font-semibold'
                          : 'text-slate-600 dark:text-emc-secondary hover:bg-slate-100 dark:hover:bg-emc-elevated/60 hover:text-slate-900 dark:hover:text-emc-primary'
                        } ${collapsed ? 'justify-center px-2' : ''}`
                      }
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-600 rounded-r-full" />
                      )}
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-emc-secondary'}`} />

                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{item.title}</span>
                          {item.badge && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${item.badgeColor || 'bg-slate-200 text-slate-700'
                                }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
};

