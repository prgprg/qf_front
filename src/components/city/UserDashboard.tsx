import { useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, TrendingUp, Target, Users, History, Award } from 'lucide-react'
import { mockUserStats, mockContributions, mockProjects } from '../../data/mockData'

interface UserDashboardProps {
  isWalletConnected: boolean
}

export default function UserDashboard({ isWalletConnected }: UserDashboardProps) {
  const [activeView, setActiveView] = useState<'overview' | 'history' | 'impact'>('overview')

  if (!isWalletConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <Wallet className="w-20 h-20 text-gray-600 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Connect your wallet to view your contribution history, impact statistics, and personalized dashboard.
        </p>
      </motion.div>
    )
  }

  const userContributions = mockContributions.filter(
    c => c.contributor === '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY' // Mock user
  )

  const contributedProjects = mockProjects.filter(p =>
    userContributions.some(c => c.project_id === p.contract_project_id)
  )

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">My Dashboard</h2>
          <p className="text-gray-400">Track your contributions and impact in the community</p>
        </div>
        
        <div className="flex items-center space-x-2 text-green-400">
          <Wallet className="w-5 h-5" />
          <span className="text-sm font-mono">5GrwvaEF...KutQY</span>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex space-x-6 border-b border-gray-800"
      >
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'history', label: 'History', icon: History },
          { id: 'impact', label: 'Impact', icon: Award }
        ].map(({ id, label, icon: Icon }) => (
          <motion.button
            key={id}
            onClick={() => setActiveView(id as typeof activeView)}
            className={`flex items-center space-x-2 pb-4 text-sm font-medium transition-colors ${
              activeView === id ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-white'
            }`}
            whileHover={{ y: -2 }}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Content */}
      <motion.div
        key={activeView}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeView === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">€{mockUserStats.total_contributed.toLocaleString()}</p>
                    <p className="text-gray-400 text-sm">Total Contributed</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                <div className="flex items-center space-x-3">
                  <Target className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{mockUserStats.projects_supported}</p>
                    <p className="text-gray-400 text-sm">Projects Supported</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                <div className="flex items-center space-x-3">
                  <Users className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{mockUserStats.rounds_participated.length}</p>
                    <p className="text-gray-400 text-sm">Rounds Participated</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {userContributions.slice(0, 5).map((contribution, index) => {
                  const project = mockProjects.find(p => p.contract_project_id === contribution.project_id)
                  return (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            {project?.title.charAt(0) || 'P'}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{project?.title || 'Unknown Project'}</p>
                          <p className="text-gray-400 text-sm">Round {contribution.round_id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-medium">€{contribution.amount}</p>
                        <p className="text-gray-500 text-xs">{formatDate(contribution.timestamp)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {activeView === 'history' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Contribution History</h3>
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50">
                    <tr className="text-left">
                      <th className="px-6 py-4 text-sm font-medium text-gray-300">Project</th>
                      <th className="px-6 py-4 text-sm font-medium text-gray-300">Amount</th>
                      <th className="px-6 py-4 text-sm font-medium text-gray-300">Round</th>
                      <th className="px-6 py-4 text-sm font-medium text-gray-300">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {userContributions.map((contribution, index) => {
                      const project = mockProjects.find(p => p.contract_project_id === contribution.project_id)
                      return (
                        <tr key={index} className="hover:bg-gray-800/30">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                                <span className="text-xs font-bold text-white">
                                  {project?.title.charAt(0) || 'P'}
                                </span>
                              </div>
                              <span className="text-white">{project?.title || 'Unknown Project'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-green-400 font-medium">€{contribution.amount}</td>
                          <td className="px-6 py-4 text-gray-300">Round {contribution.round_id}</td>
                          <td className="px-6 py-4 text-gray-400">{formatDate(contribution.timestamp)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeView === 'impact' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Your Impact</h3>
            
            {/* Supported Projects */}
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Projects You've Supported</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contributedProjects.map((project) => (
                  <div key={project.contract_project_id} className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      {project.image_url ? (
                        <img
                          src={project.image_url}
                          alt={project.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-white">
                            {project.title.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <h5 className="text-white font-medium">{project.title}</h5>
                        <p className="text-gray-400 text-sm">{project.category}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-300">
                      Your contribution: €{userContributions
                        .filter(c => c.project_id === project.contract_project_id)
                        .reduce((sum, c) => sum + c.amount, 0)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Impact Metrics */}
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-600/10 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <Award className="w-8 h-8 text-green-400 mt-1" />
                <div>
                  <h4 className="text-lg font-semibold text-green-400 mb-2">Community Impact</h4>
                  <p className="text-gray-300 mb-4">
                    Through quadratic funding, your contributions have been amplified by community support, 
                    creating greater impact for local sustainability initiatives.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-white mb-1">Estimated Total Impact</p>
                      <p className="text-green-400">~€{Math.floor(mockUserStats.total_contributed * 1.4).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="font-medium text-white mb-1">QF Multiplier</p>
                      <p className="text-green-400">1.4x average</p>
                    </div>
                    <div>
                      <p className="font-medium text-white mb-1">Community Rank</p>
                      <p className="text-green-400">Top 15%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
} 