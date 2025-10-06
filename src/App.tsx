import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { GetInvolvedDialog } from './components/GetInvolvedDialog'
import { useGetInvolvedDialog } from './hooks/useGetInvolvedDialog'
import { AdminRoute } from './components/admin'
import HomePage from './components/HomePage'
import SponsorsPage from './pages/SponsorsPage'
import VendorsPage from './pages/VendorsPage'
import VolunteersPage from './pages/VolunteersPage'

function AppContent() {
  const { isDialogOpen, preselectedType } = useGetInvolvedDialog();

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sponsors" element={<SponsorsPage />} />
        <Route path="/vendors" element={<VendorsPage />} />
        <Route path="/volunteers" element={<VolunteersPage />} />
        <Route path="/manage" element={<AdminRoute />} />
      </Routes>
      {isDialogOpen && <GetInvolvedDialog preselectedType={preselectedType || undefined} />}
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider disableTransitionOnChange>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}
