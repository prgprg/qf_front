import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, CheckCircle, Zap, Copy, Loader } from 'lucide-react'
import { usePolkadot } from '../../contexts/PolkadotContext'
import { formatAddress, getAccountDisplayName } from '../../utils/polkadot'
import WalletConnectionModal from './WalletConnectionModal'

interface AccountSwitcherProps {
  className?: string
  size?: 'sm' | 'md'
  showWalletName?: boolean
  showBalance?: boolean
}

export default function AccountSwitcher({ 
  className = '', 
  size = 'md',
  showWalletName = true,
  showBalance = false
}: AccountSwitcherProps) {
  const {
    isWalletConnected,
    accounts,
    selectedAccount,
    selectAccount,
    balance,
    isLoadingBalance,
    currentNetwork
  } = usePolkadot()

  const [showDropdown, setShowDropdown] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [copied, setCopied] = useState(false)

  const getWalletInfo = (source: string) => {
    const walletInfoMap = {
      talisman: { name: 'Talisman', icon: '🔮' },
      'polkadot-js': { name: 'Polkadot.js', icon: '🟣' },
      'subwallet-js': { name: 'SubWallet', icon: '⚡' }
    } as const
    
    return walletInfoMap[source as keyof typeof walletInfoMap] || { 
      name: source, 
      icon: '💼'
    }
  }

  const handleAccountSelect = (account: typeof selectedAccount) => {
    if (account) {
      selectAccount(account)
      setShowDropdown(false)
    }
  }

  const copyAddress = () => {
    if (selectedAccount) {
      navigator.clipboard.writeText(selectedAccount.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isWalletConnected || !selectedAccount) {
    return (
      <motion.button
        onClick={() => setShowWalletModal(true)}
        className={`flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg text-sm font-medium transition-all duration-200 ${className}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span>Connect</span>
        <WalletConnectionModal 
          isOpen={showWalletModal}
          onClose={() => setShowWalletModal(false)}
        />
      </motion.button>
    )
  }

  const walletInfo = getWalletInfo(selectedAccount.meta.source)
  const isSmall = size === 'sm'
  const avatarSize = isSmall ? 'w-6 h-6' : 'w-8 h-8'
  const textSize = isSmall ? 'text-xs' : 'text-sm'

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center space-x-2 px-3 py-2 bg-gray-800/60 backdrop-blur-sm border border-gray-700/60 rounded-lg hover:border-green-500/50 hover:bg-gray-800/80 transition-all duration-200 group ${isSmall ? 'min-w-0' : ''}`}
        whileHover={{ scale: 1.01 }}
      >
        <div className="relative flex-shrink-0">
          <div className={`${avatarSize} bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center`}>
            <span className={`${isSmall ? 'text-xs' : 'text-sm'} font-bold text-white`}>
              {selectedAccount.meta.name?.charAt(0).toUpperCase() || 
               selectedAccount.address.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 text-xs">
            {walletInfo.icon}
          </div>
        </div>
        
        {!isSmall && (
          <div className="flex flex-col items-start min-w-0 flex-1">
            <div className="flex items-center space-x-1.5">
              <span className={`${textSize} font-medium text-white truncate max-w-24`}>
                {getAccountDisplayName(selectedAccount)}
              </span>
              {accounts.length > 1 && (
                <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">
                  +{accounts.length - 1}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs text-gray-400 truncate max-w-20 font-mono">
                {formatAddress(selectedAccount.address, isSmall ? 3 : 4)}
              </span>
              {showWalletName && (
                <>
                  <span className="text-xs text-gray-600">•</span>
                  <span className="text-xs text-gray-500 truncate max-w-16">
                    {walletInfo.name}
                  </span>
                </>
              )}
              {showBalance && balance && (
                <>
                  <span className="text-xs text-gray-600">•</span>
                  <span className="text-xs text-green-400 font-semibold">
                    {isLoadingBalance ? (
                      <Loader className="w-3 h-3 animate-spin inline" />
                    ) : (
                      `${parseFloat(balance).toFixed(1)} ${currentNetwork.symbol}`
                    )}
                  </span>
                </>
              )}
            </div>
          </div>
        )}
        
        {accounts.length > 1 && (
          <ChevronDown className={`${isSmall ? 'w-3 h-3' : 'w-4 h-4'} text-gray-400 transition-transform duration-200 group-hover:text-gray-300 ${
            showDropdown ? 'rotate-180' : ''
          }`} />
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && accounts.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden z-50 shadow-2xl min-w-64"
          >
            {/* Header */}
            <div className="p-3 border-b border-gray-700/50 bg-gray-800/30">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-white">Switch Account</span>
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
                    onClick={() => {
                      setShowWalletModal(true)
                      setShowDropdown(false)
                    }}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    title="Add wallet"
                  >
                    <Zap className="w-3 h-3" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Accounts */}
            <div className="max-h-48 overflow-y-auto">
              {accounts.map((account, index) => {
                const isSelected = selectedAccount?.address === account.address
                const accountWalletInfo = getWalletInfo(account.meta.source)

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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click Outside Handler */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}

      <WalletConnectionModal 
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
    </div>
  )
} 