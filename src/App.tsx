import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './shell/store'
import { ThemeProvider } from './shell/contexts/ThemeContext'
import { AuthProvider } from './shell/contexts/AuthContext'
import { AnalyticsProvider } from './shell/contexts/AnalyticsContext'
import { GetInvolvedDialog } from './shell/GetInvolvedDialog'
import { useGetInvolvedDialog } from './shell/hooks/useGetInvolvedDialog'
import { useNavigationLoading } from './shell/hooks/useNavigationLoading'
import { useAnalyticsPageview } from './shell/hooks/useAnalyticsPageview'
import { AdminRoute } from './admin/AdminRoute'
import HomePage from './public/HomePage'
import SponsorsPage from './public/pages/SponsorsPage'
import VendorsPage from './public/pages/VendorsPage'
import VolunteersPage from './public/pages/VolunteersPage'
import PrivacyPolicyPage from './public/pages/PrivacyPolicyPage'
import TermsAndConditionsPage from './public/pages/TermsAndConditionsPage'

function AppContent() {
  const { isDialogOpen, preselectedType } = useGetInvolvedDialog();
  const isNavigationLoading = useNavigationLoading();
  
  // Initialize analytics pageview tracking
  useAnalyticsPageview();

  return (
    <>
      {/* Navigation loading overlay */}
      {isNavigationLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sponsors" element={<SponsorsPage />} />
        <Route path="/vendors" element={<VendorsPage />} />
        <Route path="/volunteers" element={<VolunteersPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsAndConditionsPage />} />
        <Route path="/manage/*" element={<AdminRoute />} />
      </Routes>
      {isDialogOpen && <GetInvolvedDialog preselectedType={preselectedType || undefined} />}
    </>
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
