import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage.js';
import { LoginPage } from '../pages/LoginPage.js';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage.js';
import { ResetPasswordPage } from '../pages/ResetPasswordPage.js';
import { VerifyCertificatePage } from '../pages/VerifyCertificatePage.js';
import { VerifyReceiptPage } from '../pages/VerifyReceiptPage.js';
import { StudentOnboardingPage } from '../pages/StudentOnboardingPage.js';
import { DashboardLayout } from '../layouts/DashboardLayout.js';
import { ProtectedRoute } from './ProtectedRoute.js';

// Feature Pages
import { StudentDashboard } from '../features/dashboard/StudentDashboard.js';
import { LearningDashboard } from '../features/learning/LearningDashboard.js';
import { AssessmentsPage } from '../features/assessments/AssessmentsPage.js';
import { AttendancePage } from '../features/attendance/AttendancePage.js';
import { MentorshipPage } from '../features/mentorship/MentorshipPage.js';
import { MockInterviewsPage } from '../features/interviews/MockInterviewsPage.js';
import { ProjectsPage } from '../features/projects/ProjectsPage.js';
import { PlacementPage } from '../features/placement/PlacementPage.js';
import { CertificatesPage } from '../features/certificates/CertificatesPage.js';
import { StipendPage } from '../features/stipend/StipendPage.js';
import { StudentPaymentsPage } from '../features/payments/StudentPaymentsPage.js';
import { CalendarPage } from '../features/calendar/CalendarPage.js';
import { MessagingPage } from '../features/messaging/MessagingPage.js';
import { NotificationsPage } from '../features/notifications/NotificationsPage.js';
import { StudentProfilePage } from '../features/profile/StudentProfilePage.js';
import { MonthsExplorerPage } from '../features/program/MonthsExplorerPage.js';
import { CareerTracksPage } from '../features/program/CareerTracksPage.js';
import { IndustryExposurePage } from '../features/program/IndustryExposurePage.js';
import { PackagesPage } from '../features/program/PackagesPage.js';

// Admin & Mentor Portals
import { MentorDashboard } from '../features/mentor/MentorDashboard.js';
import { AdminDashboard } from '../features/admin/AdminDashboard.js';
import { StudentManagementPage } from '../features/admin/StudentManagementPage.js';
import { AdminPaymentsPage } from '../features/admin/AdminPaymentsPage.js';
import { ReportsPage } from '../features/admin/ReportsPage.js';
import { AuditLogsPage } from '../features/admin/AuditLogsPage.js';
import { SettingsPage } from '../features/admin/SettingsPage.js';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-certificate/:certificateId" element={<VerifyCertificatePage />} />
      <Route path="/verify-receipt/:receiptNumber" element={<VerifyReceiptPage />} />

      {/* Onboarding Wizard */}
      <Route path="/onboarding" element={<StudentOnboardingPage />} />

      {/* Authenticated Application with DashboardLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Candidate / Student Core Routes */}
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/learning" element={<LearningDashboard />} />
          <Route path="/months" element={<MonthsExplorerPage />} />
          <Route path="/career-tracks" element={<CareerTracksPage />} />
          <Route path="/industry-exposure" element={<IndustryExposurePage />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/assessments" element={<AssessmentsPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/mentorship" element={<MentorshipPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/mock-interviews" element={<MockInterviewsPage />} />
          <Route path="/interviews" element={<MockInterviewsPage />} />
          <Route path="/placement" element={<PlacementPage />} />
          <Route path="/certificates" element={<CertificatesPage />} />
          <Route path="/stipends" element={<StipendPage />} />
          <Route path="/payments" element={<StudentPaymentsPage />} />
          <Route path="/student/payments" element={<StudentPaymentsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/messages" element={<MessagingPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<StudentProfilePage />} />

          {/* Mentor Routes */}
          <Route element={<ProtectedRoute allowedRoles={['mentor', 'admin']} />}>
            <Route path="/mentor" element={<MentorDashboard />} />
            <Route path="/mentor/students" element={<MentorDashboard />} />
            <Route path="/mentor/students/:id" element={<StudentProfilePage />} />
            <Route path="/mentor/mock-interviews" element={<MockInterviewsPage />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<StudentManagementPage />} />
            <Route path="/admin/students/:id" element={<StudentProfilePage />} />
            <Route path="/admin/mentors" element={<MentorDashboard />} />
            <Route path="/admin/batches" element={<StudentManagementPage />} />
            <Route path="/admin/tracks" element={<CareerTracksPage />} />
            <Route path="/admin/curriculum" element={<LearningDashboard />} />
            <Route path="/admin/assessments" element={<AssessmentsPage />} />
            <Route path="/admin/attendance" element={<AttendancePage />} />
            <Route path="/admin/stipends" element={<StipendPage />} />
            <Route path="/admin/payments" element={<AdminPaymentsPage />} />
            <Route path="/admin/reports" element={<ReportsPage />} />
            <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
            <Route path="/admin/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
