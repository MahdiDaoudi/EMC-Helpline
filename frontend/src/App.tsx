import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { PublicOnlyRoute } from "./components/auth/PublicOnlyRoute";
import { AuthLayout } from "./components/auth/AuthLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { VerifyEmailPage } from "./pages/auth/VerifyEmailPage";
import { AccountLockedPage } from "./pages/auth/AccountLockedPage";
import { AuthErrorPage } from "./pages/auth/AuthErrorPage";

import { DashboardLayout } from "./components/layout/DashboardLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { AnalysePage } from "./pages/AnalysePage";
import { SignalementsPage } from "./pages/SignalementsPage";
import { SignalementDetailPage } from "./pages/SignalementDetailPage";
import { NouveauSignalementPage } from "./pages/NouveauSignalementPage";
import { VictimsPage } from "./pages/VictimsPage";
import { PlatformsPage } from "./pages/PlatformsPage";
import { OrganizationsPage } from "./pages/OrganizationsPage";
import { AssignmentsPage } from "./pages/AssignmentsPage";
import { UsersPage } from "./pages/UsersPage";
import { RolesPage } from "./pages/RolesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { CyberViolencesPage } from "./pages/CyberViolencesPage";
import "./App.css";
import LandingPage from "./pages/landing/landingPage";
import { PublicSignalementPage } from "./pages/PublicSignalementPage";
import { VictimAuthProvider } from "./context/VictimAuthContext";
import { VictimLoginPage } from "./pages/tracking/VictimLoginPage";
import { VictimDashboardPage } from "./pages/tracking/VictimDashboardPage";
import { VictimSignalementDetailPage } from "./pages/tracking/VictimSignalementDetailPage";
import { VictimNewSignalementPage } from "./pages/tracking/VictimNewSignalementPage";

function App() {
  return (
    <VictimAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signalement" element={<PublicSignalementPage />} />

          {/* Victim Tracking Routes */}
          <Route path="/suivi" element={<VictimLoginPage />} />
          <Route path="/suivi/tableau-de-bord" element={<VictimDashboardPage />} />
          <Route path="/suivi/signalement/:id" element={<VictimSignalementDetailPage />} />
          <Route path="/suivi/nouveau" element={<VictimNewSignalementPage />} />

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
            <Route path="dashboard" element={<DashboardLayout />}>
              {/* Accessible by All Roles */}
              <Route index element={<DashboardPage />} />
              <Route path="analyse" element={<AnalysePage />} />
              <Route path="signalements" element={<SignalementsPage />} />
              <Route path="signalements/:id" element={<SignalementDetailPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />

              {/* Non-ORGANIZATION_USER Routes (SUPER_ADMIN, ADMIN, TECHNICIAN) */}
              <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN", "TECHNICIAN"]} />}>
                <Route path="signalements/nouveau" element={<NouveauSignalementPage />} />
                <Route path="victims" element={<VictimsPage />} />
                <Route path="platforms" element={<PlatformsPage />} />
                <Route path="admin/platforms" element={<PlatformsPage />} />
                <Route path="assignments" element={<AssignmentsPage />} />
                <Route path="cyberviolences" element={<CyberViolencesPage />} />
              </Route>

              {/* SUPER_ADMIN and ADMIN Routes */}
              <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]} />}>
                <Route path="organizations" element={<OrganizationsPage />} />
                <Route path="admin/organizations" element={<OrganizationsPage />} />
              </Route>

              {/* SUPER_ADMIN Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]} />}>
                <Route path="users" element={<UsersPage />} />
                <Route path="admin/users" element={<UsersPage />} />
                <Route path="roles" element={<RolesPage />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </VictimAuthProvider>
  );
}

export default App;
