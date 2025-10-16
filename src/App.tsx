import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { store } from './shell/store'
import { ThemeProvider } from './shell/contexts/ThemeContext'
import { AuthProvider } from './shell/contexts/AuthContext'
import { AnalyticsProvider } from './shell/contexts/AnalyticsContext'
import { GetInvolvedDialog } from './shell/GetInvolvedDialog'
import { useGetInvolvedDialog } from './shell/hooks/useGetInvolvedDialog'
import { useAnalyticsPageview } from './shell/hooks/useAnalyticsPageview'
import { AdminRoute } from './admin/AdminRoute'

// Lazy load public pages
const HomePage = lazy(() => import('./public/HomePage'))
const SponsorsPage = lazy(() => import('./public/pages/SponsorsPage'))
const VendorsPage = lazy(() => import('./public/pages/VendorsPage'))
const VolunteersPage = lazy(() => import('./public/pages/VolunteersPage'))
const PrivacyPolicyPage = lazy(() => import('./public/pages/PrivacyPolicyPage'))
const TermsAndConditionsPage = lazy(() => import('./public/pages/TermsAndConditionsPage'))
const UnsubscribePage = lazy(() => import('./public/pages/UnsubscribePage'))

function AppContent() {
  const { isDialogOpen, preselectedType } = useGetInvolvedDialog();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/manage');
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Initialize analytics pageview tracking
  useAnalyticsPageview();

  // Handle scroll disabling during transitions
  useEffect(() => {
    setIsAnimating(true);
    document.body.style.overflow = 'hidden';
    
    const timer = setTimeout(() => {
      setIsAnimating(false);
      document.body.style.overflow = '';
    }, 300); // Match animation duration

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, [location.pathname]);

  return (
    <div className={`route-transition ${isAdminRoute ? 'admin-route' : 'public-route'} ${isAnimating ? 'animating' : ''}`}>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sponsors" element={<SponsorsPage />} />
          <Route path="/vendors" element={<VendorsPage />} />
          <Route path="/volunteers" element={<VolunteersPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsAndConditionsPage />} />
          <Route path="/unsubscribe" element={<UnsubscribePage />} />
          <Route path="/manage/*" element={<AdminRoute />} />
        </Routes>
      </Suspense>
      {isDialogOpen && <GetInvolvedDialog preselectedType={preselectedType || undefined} />}
    </div>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider disableTransitionOnChange>
        <AuthProvider>
          <AnalyticsProvider>
            <Router>
              <AppContent />
            </Router>
          </AnalyticsProvider>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  )
}
