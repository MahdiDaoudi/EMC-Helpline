import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicOnlyRoute } from './components/auth/PublicOnlyRoute';
import { AuthLayout } from './components/auth/AuthLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { AccountLockedPage } from './pages/auth/AccountLockedPage';
import { AuthErrorPage } from './pages/auth/AuthErrorPage';

import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { SignalementsPage } from './pages/SignalementsPage';
import { SignalementDetailPage } from './pages/SignalementDetailPage';
import { NouveauSignalementPage } from './pages/NouveauSignalementPage';
import { VictimsPage } from './pages/VictimsPage';
import { PlatformsPage } from './pages/PlatformsPage';
import { PlatformReportsPage } from './pages/PlatformReportsPage';
import { OrganizationsPage } from './pages/OrganizationsPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { ValidationsPage } from './pages/ValidationsPage';
import { UsersPage } from './pages/UsersPage';
import { RolesPage } from './pages/RolesPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route element={<PublicOnlyRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            <Route path="verify-email" element={<VerifyEmailPage />} />
            <Route path="account-locked" element={<AccountLockedPage />} />
            <Route path="auth-error" element={<AuthErrorPage />} />
          </Route>
        </Route>

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="signalements" element={<SignalementsPage />} />
            <Route path="signalements/nouveau" element={<NouveauSignalementPage />} />
            <Route path="signalements/:id" element={<SignalementDetailPage />} />
            <Route path="victims" element={<VictimsPage />} />
            <Route path="platforms" element={<PlatformsPage />} />
            <Route path="admin/platforms" element={<PlatformsPage />} />
            <Route path="platform-reports" element={<PlatformReportsPage />} />
            <Route path="organizations" element={<OrganizationsPage />} />
            <Route path="admin/organizations" element={<OrganizationsPage />} />
            <Route path="assignments" element={<AssignmentsPage />} />
            <Route path="validates" element={<ValidationsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="admin/users" element={<UsersPage />} />
            <Route path="roles" element={<RolesPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
