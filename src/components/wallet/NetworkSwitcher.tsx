import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Globe, Loader, AlertTriangle, CheckCircle } from 'lucide-react'
import { usePolkadot } from '../../contexts/PolkadotContext'

interface NetworkSwitcherProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'compact' | 'full'
}

export default function NetworkSwitcher({ 
  className = '', 
  size = 'sm',
  variant = 'compact'
}: NetworkSwitcherProps) {
  const {
    currentNetwork,
    availableNetworks,
    switchNetwork,
    isConnecting
  } = usePolkadot()

  const [showDropdown, setShowDropdown] = useState(false)

  const handleNetworkSwitch = async (networkId: string) => {
    if (networkId !== currentNetwork.id) {
      setShowDropdown(false)
      await switchNetwork(networkId)
    }
  }

  const isSmall = size === 'sm'
  const isMedium = size === 'md'
  const isCompact = variant === 'compact'
  const buttonPadding = isSmall ? 'px-2 py-1' : isMedium ? 'px-2.5 py-1.5' : 'px-3 py-2'
  const textSize = isSmall ? 'text-xs' : isMedium ? 'text-sm' : 'text-base'

  const getNetworkStatusIcon = (network: typeof currentNetwork) => {
    if (network.chainType === 'testnet') {
      return 'bg-yellow-400'
    }
    return 'bg-green-400'
  }

  const getNetworkGradient = (network: typeof currentNetwork) => {
    if (network.chainType === 'testnet') {
      return 'from-yellow-400/20 to-orange-400/20'
    }
    return 'from-green-400/20 to-emerald-400/20'
  }

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isConnecting}
        className={`flex items-center space-x-1.5 ${buttonPadding} bg-gray-800/60 backdrop-blur-sm border border-gray-700/60 rounded-lg hover:border-green-500/50 hover:bg-gray-800/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${textSize} group`}
        whileHover={{ scale: isConnecting ? 1 : 1.01 }}
      >
        <div className="flex items-center space-x-1.5 min-w-0">
          {isConnecting ? (
            <Loader className="w-3.5 h-3.5 animate-spin text-yellow-400 flex-shrink-0" />
          ) : (
            <div className="relative flex-shrink-0">
              <div className={`w-5 h-5 bg-gradient-to-br ${getNetworkGradient(currentNetwork)} rounded-lg flex items-center justify-center border border-gray-600/50`}>
                <Globe className="w-2.5 h-2.5 text-gray-300" />
              </div>
              {!isCompact && (
                <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 ${getNetworkStatusIcon(currentNetwork)} rounded-full border border-gray-800`} />
              )}
            </div>
          )}
          
          <div className="flex items-center space-x-1 min-w-0">
            <span className="font-medium text-white truncate">
              {currentNetwork.name}
            </span>
            {!isCompact && !isSmall && (
              <>
                <span className="text-xs text-gray-600">•</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  currentNetwork.chainType === 'testnet' 
                    ? 'bg-yellow-400/20 text-yellow-400' 
                    : 'bg-green-400/20 text-green-400'
                }`}>
                  {currentNetwork.chainType}
                </span>
              </>
            )}
          </div>
        </div>
        
        <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 group-hover:text-gray-300 ${
          showDropdown ? 'rotate-180' : ''
        }`} />
      </motion.button>

      {/* Network Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full left-0 mt-2 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden z-50 shadow-2xl min-w-64"
          >
            {/* Header */}
            <div className="p-2.5 border-b border-gray-700/50 bg-gray-800/30">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-lg flex items-center justify-center">
                  <Globe className="w-3 h-3 text-blue-400" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-white">Networks</span>
                  <p className="text-xs text-gray-400">Choose network to connect</p>
                </div>
              </div>
            </div>

            {/* Networks List */}
            <div className="max-h-64 overflow-y-auto">
              {availableNetworks.map((network) => {
                const isSelected = currentNetwork.id === network.id
                const isTestnet = network.chainType === 'testnet'

                return (
                  <motion.button
                    key={network.id}
                    onClick={() => handleNetworkSwitch(network.id)}
                    disabled={isConnecting}
                    className={`w-full flex items-center space-x-2.5 px-2.5 py-2 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isSelected
                        ? 'bg-green-500/10 border-l-2 border-green-500'
                        : 'hover:bg-gray-800/50 border-l-2 border-transparent'
                    }`}
                    whileHover={{ x: isSelected ? 0 : 2 }}
                  >
                    <div className="relative flex-shrink-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                        isTestnet 
                          ? 'bg-gradient-to-br from-yellow-400/20 to-orange-400/20 border-yellow-400/30' 
                          : 'bg-gradient-to-br from-green-400/20 to-emerald-400/20 border-green-400/30'
                      }`}>
                        <Globe className={`w-4 h-4 ${
                          isTestnet ? 'text-yellow-400' : 'text-green-400'
                        }`} />
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${
                        isTestnet ? 'bg-yellow-400' : 'bg-green-400'
                      } rounded-full border border-gray-900`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-white truncate">
                          {network.name}
                        </p>
                        {isSelected && (
                          <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className="text-xs text-gray-400 font-medium">
                          {network.symbol}
                        </span>
                        <span className="text-xs text-gray-600">•</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          isTestnet 
                            ? 'bg-yellow-400/20 text-yellow-400' 
                            : 'bg-green-400/20 text-green-400'
                        }`}>
                          {network.chainType}
                        </span>
                      </div>
                    </div>

                    {isTestnet && (
                      <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* Footer Warning */}
            <div className="border-t border-gray-700/50 p-2.5 bg-gray-800/30">
              <div className="flex items-start space-x-2 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-gray-400">
                  <p className="font-medium text-yellow-400">Network Switch</p>
                  <p>Switching will disconnect current session and may affect pending transactions.</p>
                </div>
              </div>
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
    </div>
  )
} 