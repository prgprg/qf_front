import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wallet, 
  ChevronDown, 
  ExternalLink, 
  AlertCircle, 
  Loader, 
  CheckCircle, 
  Users,
  Settings,
  LogOut,
  Shield,
  Copy,
  Zap
} from 'lucide-react'
import { usePolkadot } from '../../contexts/PolkadotContext'
import { formatAddress, getAccountDisplayName } from '../../utils/polkadot'
import WalletConnectionModal from './WalletConnectionModal'

interface WalletConnectionProps {
  className?: string
  variant?: 'compact' | 'full'
  showNetworkInfo?: boolean
}

export default function WalletConnection({ 
  className = '',
  variant = 'full',
  showNetworkInfo = true
}: WalletConnectionProps) {
  const {
    isWalletConnected,
    isConnecting,
    accounts,
    selectedAccount,
    disconnectWallet,
    selectAccount,
    error,
    chainInfo,
    currentNetwork,
    balance,
    isLoadingBalance,
    isApiReady
  } = usePolkadot()

  const [showWalletModal, setShowWalletModal] = useState(false)
  const [showAccountDropdown, setShowAccountDropdown] = useState(false)
  const [showNetworkDetails, setShowNetworkDetails] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleAccountSelect = (account: typeof selectedAccount) => {
    if (account) {
      selectAccount(account)
      setShowAccountDropdown(false)
    }
  }

  const handleDisconnect = () => {
    disconnectWallet()
    setShowAccountDropdown(false)
  }

  const copyAddress = () => {
    if (selectedAccount) {
      navigator.clipboard.writeText(selectedAccount.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getWalletDisplayInfo = () => {
    if (!selectedAccount) return null
    
    const source = selectedAccount.meta.source
    const walletInfo = {
      talisman: { name: 'Talisman', icon: '🔮', color: 'from-purple-500 to-pink-500' },
      'polkadot-js': { name: 'Polkadot.js', icon: '🟣', color: 'from-pink-500 to-red-500' },
      'subwallet-js': { name: 'SubWallet', icon: '⚡', color: 'from-blue-500 to-cyan-500' }
    }
    
    return walletInfo[source as keyof typeof walletInfo] || { 
      name: source, 
      icon: '💼', 
      color: 'from-gray-500 to-gray-600' 
    }
  }

  // Loading state
  if (!isApiReady) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-xl">
          <Loader className="w-4 h-4 animate-spin text-yellow-400" />
          <span className="text-sm text-gray-300">Connecting...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center space-x-2 ${className}`}
      >
        <div className="flex items-center space-x-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-sm text-red-400">Error</span>
          <motion.button
            onClick={() => setShowWalletModal(true)}
            className="text-xs px-2 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-md transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            Retry
          </motion.button>
        </div>
      </motion.div>
    )
  }

  // Not connected state
  if (!isWalletConnected) {
    return (
      <div className={className}>
        <motion.button
          onClick={() => setShowWalletModal(true)}
          disabled={isConnecting}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: isConnecting ? 1 : 1.02 }}
          whileTap={{ scale: isConnecting ? 1 : 0.98 }}
        >
          {isConnecting ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Wallet className="w-4 h-4" />
          )}
          <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
        </motion.button>

        <WalletConnectionModal 
          isOpen={showWalletModal}
          onClose={() => setShowWalletModal(false)}
        />
      </div>
    )
  }

  const walletInfo = getWalletDisplayInfo()
  const isCompact = variant === 'compact'

  return (
    <div className={`relative ${className}`}>
      {/* Network Status - Only show if enabled and full variant */}
      {showNetworkInfo && !isCompact && (
        <motion.button
          onClick={() => setShowNetworkDetails(!showNetworkDetails)}
          className="flex items-center space-x-2 px-2.5 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-xs font-medium hover:bg-green-500/20 transition-colors mb-2 w-full"
          whileHover={{ scale: 1.01 }}
        >
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span className="flex-1 text-left">{currentNetwork.name}</span>
          <ExternalLink className="w-3 h-3" />
        </motion.button>
      )}

      {/* Network Details Dropdown */}
      <AnimatePresence>
        {showNetworkDetails && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-1 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-xl p-4 text-xs z-50 min-w-72 shadow-xl"
          >
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-green-400 font-medium">
                <Shield className="w-4 h-4" />
                <span>Network Information</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400">Network:</span>
                  <p className="text-white font-medium truncate">{chainInfo?.chain || 'Unknown'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Type:</span>
                  <p className="text-white">{chainInfo?.chainType || 'Unknown'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Format:</span>
                  <p className="text-white">{chainInfo?.ss58Format || 'Unknown'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Status:</span>
                  <div className="flex items-center text-green-400">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5" />
                    <span>Connected</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Wallet Display */}
      <motion.button
        onClick={() => setShowAccountDropdown(!showAccountDropdown)}
        className="flex items-center justify-between w-full px-3 py-2.5 bg-gray-800/60 backdrop-blur-sm border border-gray-700/60 rounded-xl hover:border-green-500/50 hover:bg-gray-800/80 transition-all duration-200 group"
        whileHover={{ scale: 1.005 }}
      >
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          {/* Avatar & Wallet Badge */}
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {selectedAccount?.meta.name?.charAt(0).toUpperCase() || 
                 selectedAccount?.address.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            {walletInfo && (
              <div className="absolute -bottom-0.5 -right-0.5 text-xs bg-gray-900 rounded-full p-0.5 border border-gray-600">
                {walletInfo.icon}
              </div>
            )}
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-white truncate">
                {selectedAccount ? getAccountDisplayName(selectedAccount) : 'Select Account'}
              </p>
              {accounts.length > 1 && (
                <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">
                  +{accounts.length - 1}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="text-xs text-gray-400 truncate font-mono">
                {selectedAccount ? formatAddress(selectedAccount.address, 4) : 'No account'}
              </span>
              
              {selectedAccount && balance && !isCompact && (
                <>
                  <span className="text-xs text-gray-600">•</span>
                  <span className="text-xs text-green-400 font-semibold">
                    {isLoadingBalance ? (
                      <Loader className="w-3 h-3 animate-spin inline" />
                    ) : (
                      `${parseFloat(balance).toFixed(2)} ${currentNetwork.symbol}`
                    )}
                  </span>
                </>
              )}
              
              {walletInfo && !isCompact && (
                <>
                  <span className="text-xs text-gray-600">•</span>
                  <span className="text-xs text-gray-500">{walletInfo.name}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 flex-shrink-0">
          {accounts.length > 1 && (
            <Users className="w-3 h-3 text-gray-400" />
          )}
          <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 group-hover:text-gray-300 ${
            showAccountDropdown ? 'rotate-180' : ''
          }`} />
        </div>
      </motion.button>

      {/* Account Management Dropdown */}
      <AnimatePresence>
        {showAccountDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden z-50 shadow-2xl"
          >
            {/* Header */}
            <div className="p-3 border-b border-gray-700/50 bg-gray-800/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Accounts</h3>
                  <p className="text-xs text-gray-400">{accounts.length} available</p>
                </div>
                <div className="flex items-center space-x-1">
                  <motion.button
                    onClick={copyAddress}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    title="Copy address"
                  >
                    {copied ? <CheckCircle className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  </motion.button>
                  <motion.button
                    onClick={() => setShowWalletModal(true)}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    title="Settings"
                  >
                    <Settings className="w-3 h-3" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Accounts List */}
            <div className="max-h-48 overflow-y-auto">
              {accounts.map((account, index) => {
                const isSelected = selectedAccount?.address === account.address
                const walletInfoMap = {
                  talisman: { name: 'Talisman', icon: '🔮' },
                  'polkadot-js': { name: 'Polkadot.js', icon: '🟣' },
                  'subwallet-js': { name: 'SubWallet', icon: '⚡' }
                } as const
                
                const accountWalletInfo = walletInfoMap[account.meta.source as keyof typeof walletInfoMap] || { 
                  name: account.meta.source, 
                  icon: '💼'
                }

                return (
                  <motion.button
                    key={`${account.address}-${index}`}
                    onClick={() => handleAccountSelect(account)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 text-left transition-all ${
                      isSelected
                        ? 'bg-green-500/10 border-l-2 border-green-500'
                        : 'hover:bg-gray-800/50 border-l-2 border-transparent'
                    }`}
                    whileHover={{ x: isSelected ? 0 : 2 }}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-7 h-7 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {account.meta.name?.charAt(0).toUpperCase() || account.address.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 text-xs">
                        {accountWalletInfo.icon}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-white truncate">
                          {getAccountDisplayName(account)}
                        </p>
                        {isSelected && (
                          <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <p className="text-xs text-gray-400 truncate font-mono">
                          {formatAddress(account.address, 6)}
                        </p>
                        <span className="text-xs bg-gray-700/50 text-gray-300 px-1.5 py-0.5 rounded-full">
                          {accountWalletInfo.name}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
            
            {/* Footer Actions */}
            <div className="border-t border-gray-700/50 p-2 bg-gray-800/30">
              <div className="flex space-x-1">
                <motion.button
                  onClick={() => {
                    setShowWalletModal(true)
                    setShowAccountDropdown(false)
                  }}
                  className="flex-1 flex items-center justify-center space-x-1.5 px-2 py-1.5 text-xs text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  <Zap className="w-3 h-3" />
                  <span>Add Wallet</span>
                </motion.button>
                
                <motion.button
                  onClick={handleDisconnect}
                  className="flex-1 flex items-center justify-center space-x-1.5 px-2 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  <LogOut className="w-3 h-3" />
                  <span>Disconnect</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click Outside Handler */}
      {(showAccountDropdown || showNetworkDetails) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowAccountDropdown(false)
            setShowNetworkDetails(false)
          }}
        />
      )}

      {/* Wallet Connection Modal */}
      <WalletConnectionModal 
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
    </div>
  )
} 