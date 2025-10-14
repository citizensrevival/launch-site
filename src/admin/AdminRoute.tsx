import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAuth } from '../shell/contexts/AuthContext';
import { AdminLoginForm } from './AdminLoginForm';

// Lazy load admin components
const AdminDashboard = lazy(() => import('./AdminDashboard'));
const LeadsPage = lazy(() => import('./leads/LeadsPage'));
const AnalyticsOverview = lazy(() => import('./analytics').then(module => ({ default: module.AnalyticsOverview })));
const UsersPage = lazy(() => import('./analytics').then(module => ({ default: module.UsersPage })));
const SessionsPage = lazy(() => import('./analytics').then(module => ({ default: module.SessionsPage })));
const SessionDetailPage = lazy(() => import('./analytics').then(module => ({ default: module.SessionDetailPage })));
const EventsPage = lazy(() => import('./analytics').then(module => ({ default: module.EventsPage })));
const ReferrersPage = lazy(() => import('./analytics').then(module => ({ default: module.ReferrersPage })));
const PagesPage = lazy(() => import('./content').then(module => ({ default: module.PagesPage })));
const ContentBlocksPage = lazy(() => import('./content').then(module => ({ default: module.ContentBlocksPage })));
const AssetsPage = lazy(() => import('./content').then(module => ({ default: module.AssetsPage })));

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
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
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
    </Suspense>
  );
}
