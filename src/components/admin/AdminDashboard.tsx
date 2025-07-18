import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Users, Target, Settings, AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react'
import { usePolkadot } from '../../contexts/PolkadotContext'
import { getQfContractService, ADMIN_ADDRESS, CONTRACT_ADDRESS } from '../../services/qfContractService'
import { WalletConnection, AccountSwitcher, NetworkSwitcher } from '../wallet'
import type { QfRound, QfProject } from '../../services/qfContractService'

export default function AdminDashboard() {
  const { selectedAccount, injector, isWalletConnected } = usePolkadot()
  const [activeTab, setActiveTab] = useState<'projects' | 'rounds' | 'settings'>('projects')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Projects state
  const [projects, setProjects] = useState<QfProject[]>([])
  const [newProjectWallet, setNewProjectWallet] = useState('')
  
  // Rounds state
  const [rounds, setRounds] = useState<QfRound[]>([])
  const [newRound, setNewRound] = useState({
    matchingPool: '',
    eligibleProjects: [] as number[],
    durationHours: 168 // 1 week default
  })

  // Check if current user is admin
  const isAdmin = selectedAccount?.address === ADMIN_ADDRESS
  const contractService = getQfContractService()

  useEffect(() => {
    // Contract is ready to use - just do a compatibility check
    initializeContract()
  }, [])

  useEffect(() => {
    if (isAdmin && isInitialized) {
      loadProjects()
      loadRounds()
    }
  }, [isAdmin, isInitialized])

  const initializeContract = async () => {
    if (isInitialized) return
    
    setIsInitializing(true)
    setError(null)
    
    try {
      console.log('🔄 Starting contract compatibility check...')
      console.log('📍 Contract address:', '0x7c581c55B26204DdBCfE7486008c340A4067d972')
      console.log('🌐 Network:', 'wss://rpc1.paseo.popnetwork.xyz')
      
      await contractService.initialize()
      
      setIsInitialized(true)
      setSuccess('Contract ready for use')
      console.log('✅ Contract ready successfully')
    } catch (err) {
      console.error('❌ Contract check failed:', err)
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        name: err instanceof Error ? err.name : undefined
      })
      setError(err instanceof Error ? err.message : 'Failed to initialize contract')
    } finally {
      setIsInitializing(false)
    }
  }

  const loadProjects = async () => {
    if (!selectedAccount) return
    
    setIsLoading(true)
    try {
      // Load projects 1-20 (adjust based on your needs)
      const loadedProjects: QfProject[] = []
      for (let id = 1; id <= 20; id++) {
        try {
          const project = await contractService.getProject(id, selectedAccount.address)
          if (project) {
            loadedProjects.push(project)
          }
        } catch {
          // Project doesn't exist
          break
        }
      }
      setProjects(loadedProjects)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects')
    } finally {
      setIsLoading(false)
    }
  }

  const loadRounds = async () => {
    if (!selectedAccount) return
    
    setIsLoading(true)
    try {
      const loadedRounds = await contractService.getAllActiveRounds(selectedAccount.address)
      setRounds(loadedRounds)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rounds')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAccount || !injector || !newProjectWallet.trim()) return

    setIsLoading(true)
    setError(null)
    
    try {
      const projectId = await contractService.addProject(
        newProjectWallet.trim(),
        selectedAccount.address,
        injector.signer
      )
      
      setSuccess(`Project added successfully with ID: ${projectId}`)
      setNewProjectWallet('')
      await loadProjects()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add project')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateRound = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAccount || !injector || !newRound.matchingPool || newRound.eligibleProjects.length === 0) return

    setIsLoading(true)
    setError(null)
    
    try {
      // Convert matching pool to Wei (18 decimals)
      const matchingPoolWei = (parseFloat(newRound.matchingPool) * Math.pow(10, 18)).toString()
      
      const roundId = await contractService.createRound(
        matchingPoolWei,
        newRound.eligibleProjects,
        newRound.durationHours,
        selectedAccount.address,
        injector.signer
      )
      
      setSuccess(`Round created successfully with ID: ${roundId}`)
      setNewRound({
        matchingPool: '',
        eligibleProjects: [],
        durationHours: 168
      })
      await loadRounds()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create round')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDistributeFunds = async (roundId: number) => {
    if (!selectedAccount || !injector) return

    setIsLoading(true)
    setError(null)
    
    try {
      await contractService.distributeMatchingFunds(
        roundId,
        selectedAccount.address,
        injector.signer
      )
      
      setSuccess(`Matching funds distributed for round ${roundId}`)
      await loadRounds()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to distribute funds')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleProjectSelection = (projectId: number) => {
    setNewRound(prev => ({
      ...prev,
      eligibleProjects: prev.eligibleProjects.includes(projectId)
        ? prev.eligibleProjects.filter(id => id !== projectId)
        : [...prev.eligibleProjects, projectId]
    }))
  }

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Navigation */}
            <div className="flex items-center space-x-6">
              <motion.button
                onClick={() => window.history.back()}
                className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors"
                whileHover={{ x: -4 }}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </motion.button>

              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-green-400" />
                <h1 className="text-xl font-bold text-white">QF Admin</h1>
                <span className="text-sm text-green-300">Dashboard</span>
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
        </div>
      </header>

      {/* Contract Status */}
      <div className="max-w-7xl mx-auto px-6 py-2">
        <div className={`text-center text-sm px-4 py-2 rounded-lg ${
          isInitializing ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' :
          isInitialized ? 'bg-green-500/10 text-green-400 border border-green-500/30' :
          'bg-red-500/10 text-red-400 border border-red-500/30'
        }`}>
          {isInitializing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
              Checking contract {CONTRACT_ADDRESS}...
            </>
          ) : isInitialized ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2 inline" />
              Contract ready: {CONTRACT_ADDRESS}
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 mr-2 inline" />
              Contract not ready: {CONTRACT_ADDRESS}
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {!isWalletConnected ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Wallet Not Connected</h2>
            <p className="text-gray-400">Please connect your wallet using the connection button in the header above.</p>
          </div>
        ) : !isAdmin ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
            <p className="text-gray-400">Only the admin can access this dashboard.</p>
            <p className="text-sm text-gray-500 mt-2">Connected: {selectedAccount?.address}</p>
            <p className="text-sm text-gray-500">Required: {ADMIN_ADDRESS}</p>
          </div>
        ) : (
        <div className="space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-white mb-4">QF Admin Dashboard</h1>
            <p className="text-gray-300">Manage projects, rounds, and funding distribution</p>
          </motion.div>

          {/* Status Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center space-x-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center space-x-3"
            >
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-green-400">{success}</p>
            </motion.div>
          )}

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
            {[
              { id: 'projects' as const, label: 'Projects', icon: Target },
              { id: 'rounds' as const, label: 'Rounds', icon: Users },
              { id: 'settings' as const, label: 'Settings', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === id
                    ? 'bg-green-500 text-black font-medium'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'projects' && (
              <div className="space-y-6">
                {/* Add Project Form */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Add New Project
                  </h3>
                  
                  <form onSubmit={handleAddProject} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Project Wallet Address
                      </label>
                      <input
                        type="text"
                        value={newProjectWallet}
                        onChange={(e) => setNewProjectWallet(e.target.value)}
                        placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                        required
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isLoading || !newProjectWallet.trim() || isInitializing || !isInitialized}
                      className="w-full py-2 bg-green-500 text-black rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {isInitializing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
                          Initializing Contract...
                        </>
                      ) : isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
                          Adding Project...
                        </>
                      ) : !isInitialized ? (
                        'Contract Not Ready'
                      ) : (
                        'Add Project'
                      )}
                    </button>
                  </form>
                </div>

                {/* Projects List */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Existing Projects</h3>
                  
                  {projects.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No projects found</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {projects.map((project) => (
                        <div
                          key={project.project_id}
                          className="bg-gray-800/50 border border-gray-700 rounded-lg p-4"
                        >
                          <h4 className="font-semibold text-white mb-2">
                            Project #{project.project_id}
                          </h4>
                          <p className="text-sm text-gray-400 mb-2 truncate">
                            {project.wallet_address}
                          </p>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Contributors: {project.contributor_count}</span>
                            <span>Raised: {parseFloat(project.total_contributions) / Math.pow(10, 18)} POP</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'rounds' && (
              <div className="space-y-6">
                {/* Create Round Form */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Round
                  </h3>
                  
                  <form onSubmit={handleCreateRound} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Matching Pool (POP)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={newRound.matchingPool}
                          onChange={(e) => setNewRound(prev => ({ ...prev, matchingPool: e.target.value }))}
                          placeholder="100"
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Duration (Hours)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={newRound.durationHours}
                          onChange={(e) => setNewRound(prev => ({ ...prev, durationHours: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Eligible Projects ({newRound.eligibleProjects.length} selected)
                      </label>
                      
                      {projects.length === 0 ? (
                        <p className="text-gray-400 text-sm">No projects available. Add projects first.</p>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                          {projects.map((project) => (
                            <button
                              key={project.project_id}
                              type="button"
                              onClick={() => toggleProjectSelection(project.project_id)}
                              className={`p-2 text-sm rounded border transition-colors ${
                                newRound.eligibleProjects.includes(project.project_id)
                                  ? 'bg-green-500 border-green-500 text-black'
                                  : 'bg-gray-800 border-gray-700 text-white hover:border-green-500/50'
                              }`}
                            >
                              Project #{project.project_id}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isLoading || !newRound.matchingPool || newRound.eligibleProjects.length === 0}
                      className="w-full py-2 bg-green-500 text-black rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
                          Creating Round...
                        </>
                      ) : (
                        'Create Round'
                      )}
                    </button>
                  </form>
                </div>

                {/* Rounds List */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Active Rounds</h3>
                  
                  {rounds.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No active rounds found</p>
                  ) : (
                    <div className="space-y-4">
                      {rounds.map((round) => (
                        <div
                          key={round.round_id}
                          className="bg-gray-800/50 border border-gray-700 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-white mb-1">
                                Round #{round.round_id}
                              </h4>
                              <p className="text-sm text-gray-400">
                                Pool: {parseFloat(round.matching_pool) / Math.pow(10, 18)} POP
                              </p>
                              <p className="text-sm text-gray-400">
                                Projects: {round.eligible_projects.length}
                              </p>
                            </div>
                            
                            <div className="flex flex-col space-y-2">
                              <span className={`px-2 py-1 text-xs rounded ${
                                round.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                              }`}>
                                {round.active ? 'Active' : 'Inactive'}
                              </span>
                              
                              {round.active && !round.is_finalized && (
                                <button
                                  onClick={() => handleDistributeFunds(round.round_id)}
                                  disabled={isLoading}
                                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-400 transition-colors disabled:opacity-50"
                                >
                                  Distribute Funds
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Contract Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Contract Address
                    </label>
                    <input
                      type="text"
                      value={CONTRACT_ADDRESS}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Admin Address
                    </label>
                    <input
                      type="text"
                      value={ADMIN_ADDRESS}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Connected Account
                    </label>
                    <input
                      type="text"
                      value={selectedAccount?.address || ''}
                      readOnly
                      className={`w-full px-3 py-2 bg-gray-800 border rounded-lg ${
                        selectedAccount?.address === ADMIN_ADDRESS
                          ? 'border-green-500 text-green-400'
                          : 'border-gray-700 text-gray-400'
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
        )}
      </main>
    </div>
  )
} 