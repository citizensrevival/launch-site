import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../shell/contexts/AuthContext';
import { AdminLoginForm } from './AdminLoginForm';
import AdminDashboard from './AdminDashboard';
import LeadsPage from './leads/LeadsPage';
import { AnalyticsOverview, UsersPage, SessionsPage, SessionDetailPage, EventsPage, ReferrersPage } from './analytics';
import { PagesPage, ContentBlocksPage, AssetsPage } from './content';

export function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AdminLoginForm />;
  }

  return (
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="analytics" element={<AnalyticsOverview />} />
          <Route path="analytics/users" element={<UsersPage />} />
          <Route path="analytics/sessions" element={<SessionsPage />} />
          <Route path="analytics/sessions/:id" element={<SessionDetailPage />} />
          <Route path="analytics/events" element={<EventsPage />} />
          <Route path="analytics/referrers" element={<ReferrersPage />} />
          <Route path="content/pages" element={<PagesPage />} />
          <Route path="content/blocks" element={<ContentBlocksPage />} />
          <Route path="content/assets" element={<AssetsPage />} />
          <Route path="*" element={<Navigate to="/manage" replace />} />
        </Routes>
  );
}
