// Helper functions for Polkadot wallet management

export interface PolkadotAccount {
  address: string
  meta: {
    name?: string
    source: string
  }
  type?: string
}

// Helper function to format address for display
export const formatAddress = (address: string, length = 8): string => {
  if (!address) return ''
  return `${address.slice(0, length)}...${address.slice(-length)}`
}

// Helper function to get account display name
export const getAccountDisplayName = (account: PolkadotAccount): string => {
  return account.meta.name || formatAddress(account.address)
} 