import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Wallet, 
  CheckCircle, 
  AlertCircle, 
  Loader, 
  Download,
  ChevronRight,
  Users
} from 'lucide-react'
import { usePolkadot } from '../../contexts/PolkadotContext'
import { formatAddress, getAccountDisplayName } from '../../utils/polkadot'

interface WalletConnectionModalProps {
  isOpen: boolean
  onClose: () => void
}

interface WalletOption {
  name: string
  id: string
  icon: string
  description: string
  downloadUrl: string
  features: string[]
  recommended?: boolean
}

const supportedWallets: WalletOption[] = [
  {
    name: 'Talisman',
    id: 'talisman',
    icon: '🔮',
    description: 'The best Polkadot wallet with built-in staking and cross-chain support',
    downloadUrl: 'https://talisman.xyz/',
    features: ['Multi-chain support', 'Built-in staking', 'NFT management', 'DeFi integrations'],
    recommended: true
  },
  {
    name: 'Polkadot.js',
    id: 'polkadot-js',
    icon: '🟣',
    description: 'Official Polkadot wallet extension with advanced features',
    downloadUrl: 'https://polkadot.js.org/extension/',
    features: ['Official wallet', 'Advanced controls', 'Developer tools', 'Multiple accounts']
  },
  {
    name: 'SubWallet',
    id: 'subwallet-js',
    icon: '⚡',
    description: 'User-friendly wallet with modern interface and earning features',
    downloadUrl: 'https://subwallet.app/',
    features: ['Earning features', 'Modern UI', 'Mobile app', 'Easy onboarding']
  }
]

export default function WalletConnectionModal({ isOpen, onClose }: WalletConnectionModalProps) {
  const {
    isWalletConnected,
    isConnecting,
    accounts,
    connectWallet,
    selectAccount,
    error,
    currentNetwork
  } = usePolkadot()

  const [step, setStep] = useState<'wallet-selection' | 'connecting' | 'account-selection' | 'connected'>('wallet-selection')
  const [detectedWallets, setDetectedWallets] = useState<string[]>([])
  const [selectedWallet, setSelectedWallet] = useState<WalletOption | null>(null)

  // Check for installed wallets
  useEffect(() => {
    const checkWallets = async () => {
      const detected: string[] = []
      
      // Check for Talisman
      if (window.injectedWeb3?.['talisman']) {
        detected.push('talisman')
      }
      
      // Check for Polkadot.js
      if (window.injectedWeb3?.['polkadot-js']) {
        detected.push('polkadot-js')
      }
      
      // Check for SubWallet
      if (window.injectedWeb3?.['subwallet-js']) {
        detected.push('subwallet-js')
      }
      
      setDetectedWallets(detected)
    }
    
    checkWallets()
  }, [isOpen])

  // Handle connection flow
  useEffect(() => {
    if (isWalletConnected && accounts.length > 0) {
      if (accounts.length === 1) {
        setStep('connected')
      } else {
        setStep('account-selection')
      }
    } else if (isConnecting) {
      setStep('connecting')
    }
  }, [isWalletConnected, accounts, isConnecting])

  const handleWalletSelect = async (wallet: WalletOption) => {
    setSelectedWallet(wallet)
    
    if (!detectedWallets.includes(wallet.id)) {
      // Wallet not installed
      return
    }
    
    try {
      setStep('connecting')
      await connectWallet(wallet.id)
    } catch (err) {
      console.error('Connection failed:', err)
      setStep('wallet-selection')
    }
  }

  const handleAccountSelect = (account: typeof accounts[0]) => {
    if (account) {
      selectAccount(account)
      setStep('connected')
    }
  }

  const handleClose = () => {
    setStep('wallet-selection')
    setSelectedWallet(null)
    onClose()
  }

  const getWalletStatus = (walletId: string) => {
    return detectedWallets.includes(walletId) ? 'installed' : 'not-installed'
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center z-50 pt-20 px-4 pb-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md overflow-hidden relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div>
              <h2 className="text-lg font-bold text-white">Connect Wallet</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                Connect to {currentNetwork.name} to get started
              </p>
            </div>
            <motion.button
              onClick={handleClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Content with scroll */}
          <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
            <div className="p-4">
              {/* Wallet Selection Step */}
              {step === 'wallet-selection' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-3"
                >
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Wallet className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-base font-semibold text-white mb-1">Choose Your Wallet</h3>
                    <p className="text-sm text-gray-400">
                      Select a wallet to connect to the Sustained platform
                    </p>
                  </div>

                  <div className="space-y-2">
                    {supportedWallets.map((wallet) => {
                      const status = getWalletStatus(wallet.id)
                      const isInstalled = status === 'installed'
                      
                      return (
                        <motion.div
                          key={wallet.id}
                          className={`relative border rounded-lg p-3 transition-all cursor-pointer ${
                            isInstalled 
                              ? 'border-gray-700 hover:border-green-500/50 hover:bg-gray-800/50' 
                              : 'border-gray-800 bg-gray-800/30'
                          }`}
                          whileHover={isInstalled ? { scale: 1.01 } : {}}
                          onClick={() => isInstalled && handleWalletSelect(wallet)}
                        >
                          {wallet.recommended && (
                            <div className="absolute -top-1.5 -right-1.5">
                              <div className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                                Recommended
                              </div>
                            </div>
                          )}

                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center border border-gray-600">
                              <span className="text-lg">{wallet.icon}</span>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-white">
                                  {wallet.name}
                                </h4>
                                {isInstalled ? (
                                  <span className="text-xs text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                                    Installed
                                  </span>
                                ) : (
                                  <motion.a
                                    href={wallet.downloadUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                                    whileHover={{ scale: 1.05 }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Download className="w-3 h-3" />
                                    <span>Install</span>
                                  </motion.a>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                                {wallet.description}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {wallet.features.map((feature, index) => (
                                  <span 
                                    key={index}
                                    className="text-xs bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded-full"
                                  >
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Security Notice */}
                  <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-300">
                          Only connect wallets you trust. Sustained will never ask for your seed phrase or private keys.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Connecting Step */}
              {step === 'connecting' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-8 text-center"
                >
                  <Loader className="w-8 h-8 text-green-400 animate-spin mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Connecting to {selectedWallet?.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Please approve the connection request in your wallet
                  </p>
                  {error && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-center space-x-2 text-red-400">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <p className="text-sm">{error}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Account Selection Step */}
              {step === 'account-selection' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-3"
                >
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-base font-semibold text-white mb-1">Select Account</h3>
                    <p className="text-sm text-gray-400">
                      Choose an account to connect with
                    </p>
                  </div>

                  <div className="space-y-2">
                    {accounts.map((account, index) => (
                      <motion.button
                        key={`${account.address}-${index}`}
                        onClick={() => handleAccountSelect(account)}
                        className="w-full flex items-center space-x-3 p-3 border border-gray-700 rounded-lg hover:border-green-500/50 hover:bg-gray-800/50 transition-all text-left"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                          <span className="text-base font-bold text-white">
                            {account.meta.name?.charAt(0).toUpperCase() || account.address.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">
                            {getAccountDisplayName(account)}
                          </h4>
                          <p className="text-xs text-gray-400 font-mono truncate mt-0.5">
                            {formatAddress(account.address, 12)}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-green-400 bg-green-500/20 px-1.5 py-0.5 rounded-full">
                              via {account.meta.source}
                            </span>
                          </div>
                        </div>
                        
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Connected Step */}
              {step === 'connected' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-8 text-center"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Successfully Connected
                  </h3>
                  <p className="text-sm text-gray-400">
                    You can now start using the Sustained platform
                  </p>
                  <motion.button
                    onClick={handleClose}
                    className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Get Started
                  </motion.button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
} 