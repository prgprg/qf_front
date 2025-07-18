import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle, CheckCircle, Loader2, Info } from 'lucide-react'
import type { QfProject } from '../../hooks/useQfContract'

interface ContributionModalProps {
  isOpen: boolean
  onClose: () => void
  project: QfProject | null
  onContribute: (amount: string) => Promise<void>
  isLoading: boolean
  error: string | null
}

export default function ContributionModal({
  isOpen,
  onClose,
  project,
  onContribute,
  isLoading,
  error
}: ContributionModalProps) {
  const [amount, setAmount] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const predefinedAmounts = ['1', '5', '10', '25', '50', '100']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const contributionAmount = amount === 'custom' ? customAmount : amount
    
    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      return
    }

    try {
      // Convert to Wei (18 decimals)
      const amountInWei = (parseFloat(contributionAmount) * Math.pow(10, 18)).toString()
      await onContribute(amountInWei)
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        onClose()
        setAmount('')
        setCustomAmount('')
      }, 2000)
    } catch (err) {
      console.error('Contribution failed:', err)
    }
  }

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount) / Math.pow(10, 18)
    return num.toFixed(2)
  }

  const calculateQfImpact = (contributionAmount: string) => {
    if (!contributionAmount || !project) return '0'
    
    // Simplified QF impact calculation for display
    // In reality, this would need the full QF formula with all contributions
    const contrib = parseFloat(contributionAmount)
    const existingContribs = parseFloat(formatAmount(project.total_contributions))
    const newTotal = existingContribs + contrib
    
    // Rough estimate: new total matching based on square root formula
    const currentMatch = project.scaled_match ? parseFloat(formatAmount(project.scaled_match)) : 0
    const estimatedNewMatch = Math.sqrt(newTotal) * Math.sqrt(project.contributor_count + 1) * 0.5
    const additionalMatch = Math.max(0, estimatedNewMatch - currentMatch)
    
    return additionalMatch.toFixed(2)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-gray-900 border border-gray-800 rounded-xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Contribute to Project</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success State */}
          {showSuccess && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center justify-center py-8"
            >
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Contribution Successful!
              </h3>
              <p className="text-gray-400 text-center">
                Your contribution is being processed on the blockchain.
              </p>
            </motion.div>
          )}

          {/* Form State */}
          {!showSuccess && (
            <>
              {/* Project Info */}
              {project && (
                <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-white mb-2">Project #{project.project_id}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Total Raised</p>
                      <p className="text-white font-medium">
                        {formatAmount(project.total_contributions)} POP
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Contributors</p>
                      <p className="text-white font-medium">{project.contributor_count}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Amount Selection */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-3">
                    Contribution Amount (POP)
                  </label>
                  
                  {/* Predefined Amounts */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {predefinedAmounts.map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setAmount(value)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                          amount === value
                            ? 'bg-green-500 border-green-500 text-black'
                            : 'bg-gray-800 border-gray-700 text-white hover:border-green-500/50'
                        }`}
                      >
                        {value} POP
                      </button>
                    ))}
                  </div>

                  {/* Custom Amount */}
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setAmount('custom')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                        amount === 'custom'
                          ? 'bg-green-500 border-green-500 text-black'
                          : 'bg-gray-800 border-gray-700 text-white hover:border-green-500/50'
                      }`}
                    >
                      Custom
                    </button>
                    {amount === 'custom' && (
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="Enter amount"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                      />
                    )}
                  </div>
                </div>

                {/* QF Impact Preview */}
                {(amount && amount !== 'custom') || (amount === 'custom' && customAmount) ? (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-green-400 font-medium mb-1">Quadratic Funding Impact</h4>
                        <p className="text-sm text-gray-300">
                          Your {amount === 'custom' ? customAmount : amount} POP contribution could generate approximately{' '}
                          <span className="text-green-400 font-medium">
                            {calculateQfImpact(amount === 'custom' ? customAmount : amount)} POP
                          </span>{' '}
                          in additional matching funds.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Error Message */}
                {error && (
                  <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                                 <div className="flex space-x-3">
                   <button
                     type="button"
                     onClick={onClose}
                     className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     disabled={isLoading}
                   >
                     Cancel
                   </button>
                   <button
                     type="submit"
                     className="flex-1 px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                     disabled={
                       isLoading ||
                       !amount ||
                       (amount === 'custom' && !customAmount) ||
                       (amount === 'custom' && parseFloat(customAmount) <= 0)
                     }
                   >
                     {isLoading ? (
                       <>
                         <Loader2 className="w-4 h-4 animate-spin mr-2" />
                         Contributing...
                       </>
                     ) : (
                       'Contribute'
                     )}
                   </button>
                 </div>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
} 