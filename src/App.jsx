import React from 'react';
import { Helmet } from 'react-helmet';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import Dashboard from '@/components/dashboard/Dashboard';
import ContactManagement from '@/components/ContactManagement';
import LeadsManagement from '@/components/LeadsManagement';
import CustomerManagement from '@/components/CustomerManagement';
import ReportsManagement from '@/components/reports/ReportsManagement';
import WhatsAppManagement from '@/components/whatsapp/WhatsAppManagement';
import InstagramManagement from '@/components/instagram/InstagramManagement';
import EmailManagement from '@/components/email/EmailManagement';
import Settings from '@/components/settings/Settings';
import TicketsManagement from '@/components/tickets/TicketsManagement';
import FileCenter from '@/components/files/FileCenter';
import AuditLog from '@/components/audit/AuditLog';
import TeamChat from '@/components/team-chat/TeamChat';
import CRMTestSuite from '@/components/test/CRMTestSuite';
import BookingPage from '@/pages/BookingPage';
import CalendarRedirect from '@/pages/CalendarRedirect';
import LoginPage from '@/pages/LoginPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import { DataProvider } from '@/contexts/DataContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CustomToaster } from '@/components/CustomToaster';
import { useLocale } from '@/contexts/LocaleContext';
import { Loader2 } from 'lucide-react';
import HistoryManagement from '@/components/audit/HistoryManagement';
import RemindersManagement from '@/components/reminders/RemindersManagement';
import { TelephonyProvider } from '@/contexts/TelephonyContext';
import WhatsApp from './components/new-whatsapp/WhatsApp';

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();
  const { t } = useLocale();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('sidebar.clinicCrm')}</title>
        <meta name="description" content={t('dashboard.description')} />
      </Helmet>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/book-appointment" element={<BookingPage />} />
        <Route path="/settings/calendar-redirect" element={<CalendarRedirect />} />
        <Route 
          path="/*"
          element={
            <ProtectedRoute>
              <DataProvider>
                <TelephonyProvider>
                  <DashboardLayout />
                </TelephonyProvider>
              </DataProvider>
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="contacts" element={<ContactManagement />} />
          <Route path="leads" element={<LeadsManagement />} />
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="tickets" element={<TicketsManagement />} />
          <Route path="reminders" element={<RemindersManagement />} />
          <Route path="file-center" element={<FileCenter />} />
          <Route path="reports" element={<ReportsManagement />} />
          <Route path="whatsapp" element={<WhatsApp />} />
          <Route path="whatsapp/:contactId" element={<WhatsAppManagement />} />
          <Route path="instagram" element={<InstagramManagement />} />
          <Route path="instagram/:contactId" element={<InstagramManagement />} />
          <Route path="email" element={<EmailManagement />} />
          <Route path="email/:folder" element={<EmailManagement />} />
          <Route path="email/:folder/:emailId" element={<EmailManagement />} />
          <Route path="team-chat" element={<TeamChat />} />
          <Route path="team-chat/:chatId" element={<TeamChat />} />
          <Route path="settings" element={<Settings />} />
          <Route path="audit-log" element={<AuditLog />} />
          <Route path="history" element={<HistoryManagement />} />
          <Route path="test-suite" element={<CRMTestSuite />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
      <CustomToaster />
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;