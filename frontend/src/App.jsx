import React from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PatientPortalLayout from './components/patient/PatientPortalLayout';
import PatientHomePage from './pages/patient/PatientHomePage';
import PatientDestinationPlaceholder from './pages/patient/PatientDestinationPlaceholder';
import { AppointmentsPage, BookingPage } from './pages/patient/AppointmentsPage';
import { MessagesInbox, MessageThreadPage, NewMessagePage } from './pages/patient/MessagesPage';
import { RecordsPage, VisitSummaryPage } from './pages/patient/RecordsPage';
import { BillingPage, PayBillPage, StatementPage } from './pages/patient/BillingPage';
import { ProfileOverview, PersonalInfoPage, InsurancePage, NotificationsPage, ProxiesPage } from './pages/patient/ProfilePage';
import AdminHomePage, { AdminLayout, AdminPlaceholder } from './pages/admin/AdminHomePage';
import PatientManagementPage, { PatientAccountPage } from './pages/admin/PatientManagementPage';
import AdminAppointmentsPage from './pages/admin/AdminAppointmentsPage';
import DoctorManagementPage, { DoctorProfilePage } from './pages/admin/DoctorManagementPage';
import { DirectoryPage, ProviderProfilePage } from './pages/public/DirectoryPage';

// Portal placeholder view demonstrating role-based entry and mock audit trail
function PortalWorkspaceLanding({ portalTitle, roleName, nextStepNotice }) {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Audit Banner */}
      <div className="mb-8 p-4 bg-teal-50 border border-teal-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-teal-900">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>
            <strong>Secure Session Authenticated:</strong> Two-factor verification confirmed for <strong>{user?.name}</strong> ({roleName}).
          </span>
        </div>
        <div className="font-mono text-[11px] text-teal-700 bg-white/80 px-2.5 py-1 rounded-md border border-teal-200 shrink-0">
          Audit ID: SEC-{user?.id?.slice(-6) || '883921'}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{portalTitle}</h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 capitalize">
                {user?.role} Access
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Welcome back, {user?.name}. You are logged into the verified {roleName} environment.
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="self-start sm:self-auto px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
          >
            End Secure Session
          </button>
        </div>

        {/* User Card */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-xs text-slate-500 font-medium block">Authenticated User</span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">{user?.name}</span>
            <span className="text-xs text-slate-600 truncate block">{user?.email}</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-xs text-slate-500 font-medium block">Access Privilege</span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block capitalize">{user?.role} Tier</span>
            <span className="text-xs text-slate-600 block">RBAC Protected Boundary</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70">
            <span className="text-xs text-slate-500 font-medium block">Multi-Factor Status</span>
            <span className="text-sm font-bold text-emerald-700 mt-0.5 block flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              2FA Verified
            </span>
            <span className="text-xs text-slate-600 block">Device Verified via SMS/TOTP</span>
          </div>
        </div>

        {/* Next Step Roadmap Notice */}
        <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Authentication Gate Succeeded
          </h3>
          <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed mb-4">
            {nextStepNotice}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/"
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
            >
              ← Public Landing Page
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

// Lightweight placeholder banner for remaining public pages
function ComingSoon({ title, stepNumber, description }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 text-center shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
          {stepNumber}
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {description}
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors"
        >
          ← Return to Landing Page
        </Link>
      </div>
    </div>
  );
}

function BookAppointmentEntry() {
  const { isAuthenticated, role } = useAuth();
  if (isAuthenticated && role === 'patient') return <Navigate to="/patient/appointments/book" replace />;
  if (isAuthenticated) return <Navigate to="/patient/appointments/book" replace />;
  return <Navigate to="/login" state={{ from: { pathname: '/patient/appointments/book' } }} replace />;
}

function MainAppRoutes() {
  const location = useLocation();
  const isPatientPortal = location.pathname.startsWith('/patient');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {!isPatientPortal && <Header />}
      <div className="flex-1">
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<LoginPage />} />
          <Route path="/book" element={<BookAppointmentEntry />} />
          <Route path="/directory" element={<DirectoryPage />} />
          <Route path="/directory/:providerId" element={<ProviderProfilePage />} />

          {/* Protected Portals with Role-Based Access Control */}
          <Route path="/patient" element={<ProtectedRoute allowedRoles={['patient']}><PatientPortalLayout /></ProtectedRoute>}>
            <Route index element={<PatientHomePage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="appointments/book" element={<BookingPage />} />
            <Route path="appointments/:appointmentId" element={<PatientDestinationPlaceholder appointmentDetail />} />
            <Route path="messages" element={<MessagesInbox />} />
            <Route path="messages/new" element={<NewMessagePage />} />
            <Route path="messages/:threadId" element={<MessageThreadPage />} />
            <Route path="records" element={<RecordsPage />} />
            <Route path="records/visit/:visitId" element={<VisitSummaryPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="billing/pay" element={<PayBillPage />} />
            <Route path="billing/statement/:statementId" element={<StatementPage />} />
            <Route path="profile" element={<ProfileOverview />} />
            <Route path="profile/personal" element={<PersonalInfoPage />} />
            <Route path="profile/insurance" element={<InsurancePage />} />
            <Route path="profile/notifications" element={<NotificationsPage />} />
            <Route path="profile/proxies" element={<ProxiesPage />} />
          </Route>

          <Route 
            path="/provider/*" 
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <PortalWorkspaceLanding 
                  portalTitle="Provider Clinical Dashboard"
                  roleName="Clinician"
                  nextStepNotice="The Clinician Workspace (90-second glance schedule, layered progressive disclosure patient charts, visit encounters, and schedule management) will be built in the Provider milestone."
                />
              </ProtectedRoute>
            } 
          />

          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminHomePage />} />
            <Route path="patients" element={<PatientManagementPage />} />
            <Route path="patients/:patientId" element={<PatientAccountPage />} />
            <Route path="appointments" element={<AdminAppointmentsPage />} />
            <Route path="providers" element={<DoctorManagementPage />} />
            <Route path="providers/:providerId" element={<DoctorProfilePage />} />
            <Route path="alerts" element={<AdminPlaceholder title="System alerts" />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </div>
      {!isPatientPortal && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppRoutes />
    </AuthProvider>
  );
}
