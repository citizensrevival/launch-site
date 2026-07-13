import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { store } from './core/store'
import { ThemeProvider } from './core/contexts/ThemeContext'
import { GetInvolvedDialog } from './public/components/GetInvolvedDialog'
import { useGetInvolvedDialog } from './public/hooks/useGetInvolvedDialog'

// Lazy load public pages
const HomePage = lazy(() => import('./public/HomePage'))
const SponsorsPage = lazy(() => import('./public/pages/SponsorsPage'))
const VendorsPage = lazy(() => import('./public/pages/VendorsPage'))
const VolunteersPage = lazy(() => import('./public/pages/VolunteersPage'))
const PrivacyPolicyPage = lazy(() => import('./public/pages/PrivacyPolicyPage'))
const TermsAndConditionsPage = lazy(() => import('./public/pages/TermsAndConditionsPage'))

function PublicRoutes() {
  const { isDialogOpen, preselectedType } = useGetInvolvedDialog();
  const location = useLocation();
  const [isAnimating, setIsAnimating] = useState(false);

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
    <div className={`route-transition public-route ${isAnimating ? 'animating' : ''}`}>
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
          <Route path="*" element={<HomePage />} />
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
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <PublicRoutes />
        </Router>
      </ThemeProvider>
    </Provider>
  )
}
