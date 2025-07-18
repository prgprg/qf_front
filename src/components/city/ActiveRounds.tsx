import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Target, Users, Coins, AlertTriangle, Info } from 'lucide-react'
import { useQfContract } from '../../hooks/useQfContract'
import ContributionModal from './ContributionModal'
import type { QfProject } from '../../hooks/useQfContract'

interface ActiveRoundsProps {
  isWalletConnected: boolean
}

export default function ActiveRounds({ isWalletConnected }: ActiveRoundsProps) {
  const {
    isLoading,
    error,
    activeRounds,
    selectedRoundData,
    loadRoundData,
    contribute,
    formatAmount,
    calculateTimeRemaining
  } = useQfContract()

  const [showContributionModal, setShowContributionModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<QfProject | null>(null)

  // Auto-select first active round if available
  useEffect(() => {
    if (activeRounds.length > 0 && !selectedRoundData) {
      loadRoundData(activeRounds[0].round_id)
    }
  }, [activeRounds, selectedRoundData, loadRoundData])

  const handleContribute = (project: QfProject) => {
    if (!isWalletConnected) {
      alert('Please connect your wallet first!')
      return
    }
    setSelectedProject(project)
    setShowContributionModal(true)
  }

  const handleContributionSubmit = async (amount: string) => {
    if (!selectedProject || !selectedRoundData) return
    
    await contribute(
      selectedRoundData.round_info.round_id,
      selectedProject.project_id,
      amount
    )
  }

  const formatTimeRemaining = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 3600))
    const hours = Math.floor((seconds % (24 * 3600)) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-white mb-4">Quadratic Funding Rounds</h2>
        <p className="text-gray-300 max-w-3xl mx-auto">
          Participate in democratic funding where your contribution is amplified through quadratic matching. 
          The more contributors a project has, the more matching funds it receives.
        </p>
      </motion.div>

      {/* QF Explanation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-green-500/10 to-emerald-600/10 border border-green-500/30 rounded-xl p-6"
      >
        <div className="flex items-start space-x-4">
          <Info className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-2">How Quadratic Funding Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
              <div>
                <p className="font-medium text-white mb-1">1. You Contribute</p>
                <p>Make contributions to projects you believe in. Every contribution counts, regardless of size.</p>
              </div>
              <div>
                <p className="font-medium text-white mb-1">2. Community Amplifies</p>
                <p>Projects with more contributors receive proportionally more matching funds from the pool.</p>
              </div>
              <div>
                <p className="font-medium text-white mb-1">3. Impact Multiplied</p>
                <p>Your contribution can be worth significantly more through the matching mechanism.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {activeRounds.length > 0 ? (
        <>
          {/* Round Selection */}
          {activeRounds.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex space-x-4 overflow-x-auto pb-4"
            >
              {activeRounds.map((round) => (
                <motion.button
                  key={round.round_id}
                  onClick={() => loadRoundData(round.round_id)}
                  className={`flex-shrink-0 p-4 rounded-xl border-2 transition-all ${
                    selectedRoundData?.round_info.round_id === round.round_id
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-gray-700 hover:border-green-500/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-left">
                    <p className="font-semibold text-white">Round {round.round_id}</p>
                    <p className="text-sm text-gray-400">{formatAmount(round.matching_pool)} POP pool</p>
                    <p className="text-xs text-green-400">
                      {formatTimeRemaining(calculateTimeRemaining(round.end_time))}
                    </p>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Selected Round Details */}
          {selectedRoundData && (
            <motion.div
              key={selectedRoundData.round_info.round_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Round Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 text-center">
                  <Coins className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-xl font-bold text-white">{formatAmount(selectedRoundData.round_info.matching_pool)} POP</p>
                  <p className="text-sm text-gray-400">Matching Pool</p>
                </div>
                
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 text-center">
                  <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-xl font-bold text-white">{selectedRoundData.projects.length}</p>
                  <p className="text-sm text-gray-400">Eligible Projects</p>
                </div>
                
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 text-center">
                  <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-xl font-bold text-white">{selectedRoundData.contributions.length}</p>
                  <p className="text-sm text-gray-400">Contributors</p>
                </div>
                
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 text-center">
                  <Clock className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-xl font-bold text-white">
                    {formatTimeRemaining(calculateTimeRemaining(selectedRoundData.round_info.end_time))}
                  </p>
                  <p className="text-sm text-gray-400">Time Remaining</p>
                </div>
              </div>

              {/* Projects in Round */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Projects in this Round</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedRoundData.projects.map((project) => (
                    <motion.div
                      key={project.project_id}
                      className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 hover:border-green-500/50 transition-all"
                      whileHover={{ y: -2 }}
                    >
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold text-white mb-2">Project #{project.project_id}</h4>
                        <div className="text-sm text-gray-400 truncate">{project.wallet_address}</div>
                      </div>

                      {/* Project Stats */}
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Direct Funding</span>
                          <span className="text-sm font-medium text-white">
                            {formatAmount(project.total_contributions)} POP
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">QF Match</span>
                          <span className="text-sm font-medium text-green-400">
                            {project.scaled_match ? formatAmount(project.scaled_match) : '0'} POP
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Contributors</span>
                          <span className="text-sm font-medium text-white">
                            {project.contributor_count}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Total Funding</span>
                          <span className="text-sm font-medium text-white">
                            {project.total_funding ? formatAmount(project.total_funding) : formatAmount(project.total_contributions)} POP
                          </span>
                        </div>
                      </div>

                      {/* Contribute Button */}
                      <motion.button
                        onClick={() => handleContribute(project)}
                        className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={!isWalletConnected}
                      >
                        {isWalletConnected ? 'Contribute' : 'Connect Wallet to Contribute'}
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </>
      ) : (
        /* No Active Rounds */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-12"
        >
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Active Rounds</h3>
          <p className="text-gray-400 mb-6">
            There are currently no active funding rounds. Check back soon for new opportunities!
          </p>
        </motion.div>
      )}

      {/* Contribution Modal */}
      <ContributionModal
        isOpen={showContributionModal}
        onClose={() => {
          setShowContributionModal(false)
          setSelectedProject(null)
        }}
        project={selectedProject}
        onContribute={handleContributionSubmit}
        isLoading={isLoading}
        error={error}
      />
    </div>
  )
} 