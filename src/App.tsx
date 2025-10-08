import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { GetInvolvedDialog } from './components/GetInvolvedDialog'
import { useGetInvolvedDialog } from './hooks/useGetInvolvedDialog'
import { useNavigationLoading } from './hooks/useNavigationLoading'
import { AdminRoute } from './components/admin'
import HomePage from './components/HomePage'
import SponsorsPage from './pages/SponsorsPage'
import VendorsPage from './pages/VendorsPage'
import VolunteersPage from './pages/VolunteersPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsAndConditionsPage from './pages/TermsAndConditionsPage'

function AppContent() {
  const { isDialogOpen, preselectedType } = useGetInvolvedDialog();
  const isNavigationLoading = useNavigationLoading();

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
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  )
}
