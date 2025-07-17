import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Wallet, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Loader, 
  Shield,
  Download,
  ChevronRight
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
    selectedAccount,
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

  const handleAccountSelect = (account: typeof selectedAccount) => {
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
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gray-900 border border-gray-700 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div>
              <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
              <p className="text-sm text-gray-400 mt-1">
                Connect to {currentNetwork.name} to get started
              </p>
            </div>
            <motion.button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="p-6">
            {/* Wallet Selection Step */}
            {step === 'wallet-selection' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Choose Your Wallet</h3>
                  <p className="text-sm text-gray-400">
                    Select a wallet to connect to the Sustained platform
                  </p>
                </div>

                <div className="space-y-3">
                  {supportedWallets.map((wallet) => {
                    const status = getWalletStatus(wallet.id)
                    const isInstalled = status === 'installed'
                    
                    return (
                      <motion.div
                        key={wallet.id}
                        className={`relative border-2 rounded-xl p-4 transition-all cursor-pointer ${
                          isInstalled 
                            ? 'border-gray-700 hover:border-green-500/50 hover:bg-gray-800/50' 
                            : 'border-gray-800 bg-gray-800/30'
                        }`}
                        whileHover={isInstalled ? { scale: 1.02 } : {}}
                        onClick={() => isInstalled && handleWalletSelect(wallet)}
                      >
                        {wallet.recommended && (
                          <div className="absolute -top-2 -right-2">
                            <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                              Recommended
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-start space-x-4">
                          <div className="text-3xl">{wallet.icon}</div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-lg font-semibold text-white">{wallet.name}</h4>
                              {isInstalled ? (
                                <div className="flex items-center text-green-400 text-sm">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Installed
                                </div>
                              ) : (
                                <div className="flex items-center text-gray-400 text-sm">
                                  <Download className="w-4 h-4 mr-1" />
                                  Install
                                </div>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-400 mb-3">{wallet.description}</p>
                            
                            <div className="flex flex-wrap gap-1 mb-3">
                              {wallet.features.slice(0, 2).map((feature) => (
                                <span
                                  key={feature}
                                  className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full"
                                >
                                  {feature}
                                </span>
                              ))}
                            </div>
                            
                            {isInstalled ? (
                              <motion.button
                                className="w-full py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                Connect with {wallet.name}
                              </motion.button>
                            ) : (
                              <motion.a
                                href={wallet.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center w-full py-2 border border-gray-600 text-gray-300 rounded-lg text-sm font-medium hover:border-gray-500 hover:text-white transition-colors"
                                whileHover={{ scale: 1.02 }}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Install {wallet.name}
                              </motion.a>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Security Notice */}
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-400 mb-1">Security Notice</h4>
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
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Loader className="w-8 h-8 text-white animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Connecting to {selectedWallet?.name}</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Please approve the connection in your wallet extension
                </p>
                {selectedWallet && (
                  <div className="inline-flex items-center space-x-2 text-sm text-gray-300 bg-gray-800 px-3 py-2 rounded-lg">
                    <span className="text-lg">{selectedWallet.icon}</span>
                    <span>{selectedWallet.name}</span>
                    <ChevronRight className="w-4 h-4" />
                    <span>Approve Connection</span>
                  </div>
                )}
                
                {error && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-center space-x-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Account Selection Step */}
            {step === 'account-selection' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Select Account</h3>
                  <p className="text-sm text-gray-400">
                    Choose which account to use with Sustained
                  </p>
                </div>

                <div className="space-y-3">
                  {accounts.map((account, index) => (
                    <motion.button
                      key={`${account.address}-${index}`}
                      onClick={() => handleAccountSelect(account)}
                      className="w-full flex items-center space-x-4 p-4 border-2 border-gray-700 rounded-xl hover:border-green-500/50 hover:bg-gray-800/50 transition-all text-left"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                        <span className="text-lg font-bold text-white">
                          {account.meta.name?.charAt(0).toUpperCase() || account.address.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-semibold text-white truncate">
                          {getAccountDisplayName(account)}
                        </h4>
                        <p className="text-sm text-gray-400 truncate">
                          {formatAddress(account.address, 12)}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                            via {account.meta.source}
                          </span>
                        </div>
                      </div>
                      
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Connected Step */}
            {step === 'connected' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Successfully Connected!</h3>
                <p className="text-sm text-gray-400 mb-6">
                  Your wallet is now connected to Sustained
                </p>
                
                {selectedAccount && (
                  <div className="bg-gray-800 rounded-xl p-4 mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {selectedAccount.meta.name?.charAt(0).toUpperCase() || selectedAccount.address.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-white">
                          {getAccountDisplayName(selectedAccount)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatAddress(selectedAccount.address, 8)}
                        </p>
                        <p className="text-xs text-green-400">
                          Connected via {selectedAccount.meta.source}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <motion.button
                  onClick={handleClose}
                  className="w-full py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Continue to App
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
} 