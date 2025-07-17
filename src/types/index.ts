// =====================================================
// DATABASE TYPES (Based on the simplified schema)
// =====================================================

export interface City {
  id: string
  name: string
  slug: string
  is_active: boolean
  contract_address: string | null
  created_at: string
}

export interface Project {
  contract_project_id: number
  city_id: string
  title: string
  description: string
  short_description?: string
  image_url?: string
  creator_name?: string
  creator_address?: string
  website?: string
  category: string
  tags?: string[]
  is_active: boolean
  created_at: string
  funding_stats?: {
    total_raised: number
    contributor_count: number
    last_contribution: number
  }
}

export interface UserProfile {
  wallet_address: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface ContractCache {
  id: string
  cache_type: 'round_data' | 'project_stats' | 'user_stats'
  cache_key: string
  data: RoundData | ContractProject | UserStats | Record<string, unknown>
  last_updated: string
}

// =====================================================
// SMART CONTRACT TYPES (Based on lib.rs)
// =====================================================

export interface Contribution {
  project_id: number
  contributor: string
  amount: number
  timestamp: number
}

export interface ContractProject {
  project_id: number
  total_contributions: number
  contributor_count: number
}

export interface Round {
  round_id: number
  status: 'upcoming' | 'active' | 'completed'
  start_time: number
  end_time: number
  matching_pool: number
  time_remaining?: number
}

export interface RoundData {
  round_info: Round
  projects: ContractProject[]
  contributions: Contribution[]
}

export interface UserStats {
  total_contributed: number
  projects_supported: number
  rounds_participated: number[]
}

// =====================================================
// COMBINED/ENRICHED TYPES (For frontend usage)
// =====================================================

export interface EnrichedProject extends Omit<Project, 'funding_stats'> {
  contract_data?: ContractProject
  funding_stats?: {
    total_raised: number
    contributor_count: number
    matching_estimate?: number
  }
}

export interface EnrichedRound extends Omit<Round, 'status'> {
  projects: EnrichedProject[]
  total_contributions: number
  unique_contributors: number
  time_remaining?: number
  status: 'upcoming' | 'active' | 'ended' | 'finalized'
}

// =====================================================
// UI/COMPONENT TYPES
// =====================================================

export interface TabItem {
  id: string
  label: string
  count?: number
}

export interface QfContributionData {
  project_id: number
  amount: number
  timestamp: number
  tx_hash?: string
}

export interface FundingHistory {
  round_id: number
  project_id: number
  amount: number
  timestamp: number
  round_name?: string
  project_title?: string
}

export type ProjectCategory = 
  | 'Environmental' 
  | 'Community' 
  | 'Mobility' 
  | 'Fashion' 
  | 'Education' 
  | 'Technology'
  | 'Other'

export type RoundStatus = 'upcoming' | 'active' | 'ended' | 'finalized'

export type ContributionRange = 'all' | '1-10' | '10-50' | '50-100' | '100+'

// =====================================================
// WALLET TYPES
// =====================================================

// Polkadot wallet account interface
export interface PolkadotAccount {
  address: string
  meta: {
    name?: string
    source: string
  }
  type?: string
}

// Wallet extension types
export interface InjectedWeb3 {
  [key: string]: {
    enable: (appName: string) => Promise<unknown>
    version: string
  }
}

// Window interface extension for wallet detection
declare global {
  interface Window {
    injectedWeb3?: InjectedWeb3
  }
}

export type WalletSource = 'talisman' | 'polkadot-js' | 'subwallet-js' | string

export interface WalletInfo {
  name: string
  icon: string
  color?: string
}

export interface WalletConnectionState {
  isConnected: boolean
  isConnecting: boolean
  accounts: PolkadotAccount[]
  selectedAccount: PolkadotAccount | null
  error: string | null
} 