import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { SearchModal } from '../common/SearchModal';
import { ErrorBoundary } from '../common/ErrorBoundary';

export const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-emc-page text-slate-900 dark:text-emc-primary transition-colors">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          collapsed ? 'md:ml-[76px]' : 'md:ml-[260px]'
        }`}
      >
        <Navbar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
          onOpenSearch={() => setSearchOpen(true)}
        />

        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Command Palette Search */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};

