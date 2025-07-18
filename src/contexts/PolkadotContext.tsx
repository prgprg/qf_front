import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp'
import type { InjectedExtension } from '@polkadot/extension-inject/types'
import type { PolkadotAccount } from '../utils/polkadot'
import { NETWORKS, type NetworkConfig } from '../utils/networks'

interface PolkadotContextType {
  // Connection state
  api: ApiPromise | null
  isApiReady: boolean
  isConnecting: boolean
  
  // Accounts and wallet
  accounts: PolkadotAccount[]
  selectedAccount: PolkadotAccount | null
  injector: InjectedExtension | null
  isWalletConnected: boolean
  
  // Balance and network
  balance: string | null
  isLoadingBalance: boolean
  currentNetwork: NetworkConfig
  availableNetworks: NetworkConfig[]
  
  // Actions
  connectWallet: (preferredSource?: string) => Promise<void>
  disconnectWallet: () => void
  selectAccount: (account: PolkadotAccount) => void
  switchNetwork: (networkId: string) => Promise<void>
  refreshBalance: () => Promise<void>
  
  // Network info
  chainInfo: {
    chain: string
    chainType: string
    ss58Format: number
  } | null
  
  // Error handling
  error: string | null
}

const PolkadotContext = createContext<PolkadotContextType | undefined>(undefined)

interface PolkadotProviderProps {
  children: ReactNode
}

export function PolkadotProvider({ children }: PolkadotProviderProps) {
  // API and connection state
  const [api, setApi] = useState<ApiPromise | null>(null)
  const [isApiReady, setIsApiReady] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  
  // Wallet and accounts
  const [accounts, setAccounts] = useState<PolkadotAccount[]>([])
  const [selectedAccount, setSelectedAccount] = useState<PolkadotAccount | null>(null)
  const [injector, setInjector] = useState<InjectedExtension | null>(null)
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  
  // Balance and network
  const [balance, setBalance] = useState<string | null>(null)
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)
  const [currentNetwork, setCurrentNetwork] = useState<NetworkConfig>(NETWORKS.popNetwork)
  const availableNetworks = Object.values(NETWORKS)
  
  // Network and chain info
  const [chainInfo, setChainInfo] = useState<{
    chain: string
    chainType: string
    ss58Format: number
  } | null>(null)
  
  // Error handling
  const [error, setError] = useState<string | null>(null)

  // Initialize API connection on mount
  useEffect(() => {
    const savedNetworkId = localStorage.getItem('selectedNetwork')
    if (savedNetworkId && NETWORKS[savedNetworkId]) {
      setCurrentNetwork(NETWORKS[savedNetworkId])
    }
    initializeApi()
    
    return () => {
      if (api) {
        api.disconnect()
      }
    }
  }, [])

  // Load saved account from localStorage
  useEffect(() => {
    const savedAccount = localStorage.getItem('selectedPolkadotAccount')
    if (savedAccount && accounts.length > 0) {
      const account = accounts.find(acc => acc.address === savedAccount)
      if (account) {
        selectAccount(account)
      }
    }
  }, [accounts])

  // Fetch balance when account or network changes
  useEffect(() => {
    if (selectedAccount && api && isApiReady) {
      refreshBalance()
    }
  }, [selectedAccount, api, isApiReady, currentNetwork])

  const initializeApi = async () => {
    try {
      setIsConnecting(true)
      setError(null)
      
      console.log(`Connecting to ${currentNetwork.name}...`)
      
      const wsProvider = new WsProvider(currentNetwork.endpoint)
      
      // Configure types based on network
      const getNetworkTypes = () => {
        if (currentNetwork.id === 'popNetwork') {
          // POP Network specific types for contract compatibility
          return {
            // Contract-specific types for POP Network
            ContractExecResult: 'ContractExecResult',
            ContractInstantiateResult: 'ContractInstantiateResult',
          }
        }
        return undefined // Use default types for other networks
      }
      
      const networkTypes = getNetworkTypes()
      const apiConfig = { 
        provider: wsProvider,
        ...(networkTypes && { types: networkTypes })
      }
      
      const apiInstance = await ApiPromise.create(apiConfig)
      
      await apiInstance.isReady
      
      // Get chain information
      const [chain, chainType] = await Promise.all([
        apiInstance.rpc.system.chain(),
        apiInstance.rpc.system.chainType ? apiInstance.rpc.system.chainType() : Promise.resolve('Live')
      ])
      
      const ss58Format = apiInstance.registry.chainSS58 || currentNetwork.ss58Format
      
      setChainInfo({
        chain: chain.toString(),
        chainType: chainType.toString(),
        ss58Format: ss58Format
      })
      
      setApi(apiInstance)
      setIsApiReady(true)
      console.log(`Connected to ${currentNetwork.name}:`, chain.toString())
      
    } catch (err) {
      console.error(`Failed to connect to ${currentNetwork.name}:`, err)
      setError(`Failed to connect to ${currentNetwork.name}: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsConnecting(false)
    }
  }

  const connectWallet = async (preferredSource?: string) => {
    try {
      setError(null)
      setIsConnecting(true)
      
      // Request access to wallet extensions
      const extensions = await web3Enable('Sustained QF Platform')
      
      if (extensions.length === 0) {
        throw new Error('No wallet extension found. Please install Talisman, Polkadot.js, or another compatible wallet.')
      }
      
      // Get all accounts from all extensions
      const allAccounts = await web3Accounts()
      
      if (allAccounts.length === 0) {
        throw new Error('No accounts found. Please create an account in your wallet and try again.')
      }
      
      let accountsToUse = allAccounts
      
      // If a preferred source is specified, filter for those accounts first
      if (preferredSource) {
        const preferredAccounts = allAccounts.filter(account => account.meta.source === preferredSource)
        if (preferredAccounts.length > 0) {
          accountsToUse = preferredAccounts
          console.log(`Connected to ${preferredSource} with ${preferredAccounts.length} accounts`)
        } else {
          console.log(`No accounts found for ${preferredSource}, using all available accounts`)
        }
      }
      
      setAccounts(accountsToUse)
      setIsWalletConnected(true)
      
      // Auto-select first account if none selected
      if (accountsToUse.length > 0) {
        selectAccount(accountsToUse[0])
      }
      
      console.log(`Connected ${accountsToUse.length} accounts`)
      
    } catch (err) {
      console.error('Wallet connection failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAccounts([])
    setSelectedAccount(null)
    setInjector(null)
    setIsWalletConnected(false)
    setBalance(null)
    localStorage.removeItem('selectedPolkadotAccount')
    console.log('Wallet disconnected')
  }

  const selectAccount = async (account: PolkadotAccount) => {
    try {
      // Get the injector for this account's source
      const injectorInstance = await web3FromSource(account.meta.source)
      
      setSelectedAccount(account)
      setInjector(injectorInstance)
      
      // Save selected account to localStorage
      localStorage.setItem('selectedPolkadotAccount', account.address)
      
      console.log('Selected account:', account.address, account.meta.name)
      
    } catch (err) {
      console.error('Failed to select account:', err)
      setError('Failed to select account')
    }
  }

  const switchNetwork = async (networkId: string) => {
    const network = NETWORKS[networkId]
    if (!network) {
      setError('Invalid network selected')
      return
    }

    try {
      setIsConnecting(true)
      setError(null)
      
      // Disconnect current API
      if (api) {
        await api.disconnect()
        setApi(null)
        setIsApiReady(false)
      }
      
      // Update network
      setCurrentNetwork(network)
      localStorage.setItem('selectedNetwork', networkId)
      
      // Reconnect to new network
      console.log(`Switching to ${network.name}...`)
      
      const wsProvider = new WsProvider(network.endpoint)
      const apiInstance = await ApiPromise.create({ 
        provider: wsProvider
      })
      
      await apiInstance.isReady
      
      // Get chain information
      const [chain, chainType] = await Promise.all([
        apiInstance.rpc.system.chain(),
        apiInstance.rpc.system.chainType ? apiInstance.rpc.system.chainType() : Promise.resolve('Live')
      ])
      
      const ss58Format = apiInstance.registry.chainSS58 || network.ss58Format
      
      setChainInfo({
        chain: chain.toString(),
        chainType: chainType.toString(),
        ss58Format: ss58Format
      })
      
      setApi(apiInstance)
      setIsApiReady(true)
      
      console.log(`Successfully switched to ${network.name}`)
      
    } catch (err) {
      console.error(`Failed to switch to ${network.name}:`, err)
      setError(`Failed to switch to ${network.name}: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsConnecting(false)
    }
  }

  const refreshBalance = useCallback(async () => {
    if (!selectedAccount || !api || !isApiReady) {
      setBalance(null)
      return
    }

    try {
      setIsLoadingBalance(true)
      
      // Get account balance
      const accountInfo = await api.query.system.account(selectedAccount.address)
      
      // Cast the account info to access the data properly
      const accountData = accountInfo.toJSON() as {
        data?: { free?: string | number }
      }
      const freeBalance = accountData?.data?.free || '0'
      
      // Convert to string and format balance (divide by 10^decimals)
      const balanceStr = typeof freeBalance === 'string' ? freeBalance : freeBalance.toString()
      const formattedBalance = (parseInt(balanceStr) / Math.pow(10, currentNetwork.decimals)).toFixed(4)
      setBalance(formattedBalance)
      
    } catch (err) {
      console.error('Failed to fetch balance:', err)
      setBalance('0.0000')
    } finally {
      setIsLoadingBalance(false)
    }
  }, [selectedAccount, api, isApiReady, currentNetwork.decimals])

  const contextValue: PolkadotContextType = {
    // Connection state
    api,
    isApiReady,
    isConnecting,
    
    // Accounts and wallet
    accounts,
    selectedAccount,
    injector,
    isWalletConnected,
    
    // Balance and network
    balance,
    isLoadingBalance,
    currentNetwork,
    availableNetworks,
    
    // Actions
    connectWallet,
    disconnectWallet,
    selectAccount,
    switchNetwork,
    refreshBalance,
    
    // Network info
    chainInfo,
    
    // Error handling
    error
  }

  return (
    <PolkadotContext.Provider value={contextValue}>
      {children}
    </PolkadotContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePolkadot = () => {
  const context = useContext(PolkadotContext)
  if (context === undefined) {
    throw new Error('usePolkadot must be used within a PolkadotProvider')
  }
  return context
} 