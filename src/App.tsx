import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import HomePage from './components/HomePage'
import SponsorsPage from './pages/SponsorsPage'
import VendorsPage from './pages/VendorsPage'
import VolunteersPage from './pages/VolunteersPage'

export default function App() {
  return (
    <ThemeProvider disableTransitionOnChange>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sponsors" element={<SponsorsPage />} />
          <Route path="/vendors" element={<VendorsPage />} />
          <Route path="/volunteers" element={<VolunteersPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}
