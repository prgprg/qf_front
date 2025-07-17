// Network configurations
export interface NetworkConfig {
  id: string
  name: string
  endpoint: string
  symbol: string
  decimals: number
  ss58Format: number
  chainType: 'testnet' | 'mainnet'
}

export const NETWORKS: Record<string, NetworkConfig> = {
  assetHub: {
    id: 'assetHub',
    name: 'Asset Hub Testnet',
    endpoint: 'wss://testnet-passet-hub.polkadot.io',
    symbol: 'DOT',
    decimals: 10,
    ss58Format: 42,
    chainType: 'testnet'
  },
  polkadot: {
    id: 'polkadot',
    name: 'Polkadot',
    endpoint: 'wss://rpc.polkadot.io',
    symbol: 'DOT',
    decimals: 10,
    ss58Format: 0,
    chainType: 'mainnet'
  },
  kusama: {
    id: 'kusama',
    name: 'Kusama',
    endpoint: 'wss://kusama-rpc.polkadot.io',
    symbol: 'KSM',
    decimals: 12,
    ss58Format: 2,
    chainType: 'mainnet'
  },
  westend: {
    id: 'westend',
    name: 'Westend Testnet',
    endpoint: 'wss://westend-rpc.polkadot.io',
    symbol: 'WND',
    decimals: 12,
    ss58Format: 42,
    chainType: 'testnet'
  }
} 