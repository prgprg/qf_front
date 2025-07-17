import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin } from 'lucide-react'
import { mockCities, getProjectsByCity } from '../data/mockData'
import { usePolkadot } from '../contexts/PolkadotContext'
import type { City, TabItem } from '../types'

// Tab Components
import ProjectCatalogue from '../components/city/ProjectCatalogue'
import ActiveRounds from '../components/city/ActiveRounds'
import UserDashboard from '../components/city/UserDashboard'
import { WalletConnection, AccountSwitcher, NetworkSwitcher } from '../components/wallet'

export default function CityApp() {
  const { citySlug } = useParams<{ citySlug: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('projects')
  const [city, setCity] = useState<City | null>(null)
  const { isWalletConnected } = usePolkadot()

  useEffect(() => {
    const foundCity = mockCities.find(c => c.slug === citySlug)
    if (!foundCity) {
      navigate('/cities')
      return
    }
    if (!foundCity.is_active) {
      navigate('/cities')
      return
    }
    setCity(foundCity)
  }, [citySlug, navigate])

  const projects = city ? getProjectsByCity(city.id) : []

  const tabs: TabItem[] = [
    { id: 'projects', label: 'Projects', count: projects.length },
    { id: 'rounds', label: 'Active Rounds', count: 1 },
    { id: 'dashboard', label: 'My Dashboard' }
  ]



  if (!city) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-green-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Navigation */}
            <div className="flex items-center space-x-6">
              <motion.button
                onClick={() => navigate('/cities')}
                className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors"
                whileHover={{ x: -4 }}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Cities</span>
              </motion.button>

              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-green-400" />
                <h1 className="text-xl font-bold text-white">{city.name}</h1>
                <span className="text-sm text-green-300">Sustainability Hub</span>
              </div>
            </div>

            {/* Right: Network & Wallet Controls */}
            <div className="flex items-center space-x-3">
              {/* Network Switcher - Hidden on mobile */}
              <div className="hidden sm:block">
                <NetworkSwitcher size="md" />
              </div>
              
              {/* Desktop: Full wallet connection with balance */}
              <div className="hidden xl:block">
                <WalletConnection variant="full" showNetworkInfo={false} />
              </div>
              
              {/* Tablet: Compact wallet without network info */}
              <div className="hidden lg:block xl:hidden">
                <WalletConnection variant="compact" showNetworkInfo={false} />
              </div>
              
              {/* Mobile: Account switcher with balance */}
              <div className="lg:hidden">
                <AccountSwitcher size="md" showWalletName={false} showBalance={true} />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <nav className="mt-6">
            <div className="flex space-x-8">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative pb-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id ? 'text-green-400' : 'text-gray-400 hover:text-white'
                  }`}
                  whileHover={{ y: -2 }}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      activeTab === tab.id 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                  
                  {activeTab === tab.id && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400"
                      layoutId="activeTab"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'projects' && (
            <ProjectCatalogue city={city} projects={projects} />
          )}
          {activeTab === 'rounds' && (
            <ActiveRounds isWalletConnected={isWalletConnected} />
          )}
          {activeTab === 'dashboard' && (
            <UserDashboard isWalletConnected={isWalletConnected} />
          )}
        </motion.div>
      </main>
    </div>
  )
} 