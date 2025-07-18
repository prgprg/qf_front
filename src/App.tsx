import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { PolkadotProvider } from './contexts/PolkadotContext'
import LandingPage from './pages/LandingPage'
import CitySelection from './pages/CitySelection'
import CityApp from './pages/CityApp'
import { AdminDashboard } from './components/admin'

function App() {
  return (
    <PolkadotProvider>
      <Router>
        <div className="min-h-screen bg-black text-white overflow-x-hidden">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/cities" element={<CitySelection />} />
            <Route path="/cities/:citySlug" element={<CityApp />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
      </Router>
    </PolkadotProvider>
  )
}

export default App
