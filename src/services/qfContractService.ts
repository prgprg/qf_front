/* eslint-disable @typescript-eslint/no-explicit-any */
import { contracts, paseo } from '@polkadot-api/descriptors'
import { createInkSdk } from '@polkadot-api/sdk-ink'
import { createClient } from 'polkadot-api'
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat'
import { getWsProvider } from 'polkadot-api/ws-provider/web'

// Configuration
const WS_PROVIDER_URL = 'wss://testnet-passet-hub.polkadot.io'
const ADMIN_ADDRESS = '5G9G6KPc1h2f2npsRBj4Y97JVvJSGHKuuLnhJCCdHVH8der1'

// Deployed contract address
const CONTRACT_ADDRESS = '0xc1dFdCE72Ed817DDcA6cfe296011516679Bb6618'

// Types matching our contract
export interface QfRound {
  round_id: number
  matching_pool: string
  eligible_projects: number[]
  start_time: number
  end_time: number
  active: boolean
  final_alpha?: number
  is_finalized: boolean
}

export interface QfProject {
  project_id: number
  wallet_address: string
  total_contributions: string
  contributor_count: number
  ideal_match?: string
  scaled_match?: string
  total_funding?: string
}

export interface QfContribution {
  amount: string
  contributor: string
  project_id: number
  round_id: number
  timestamp: number
}

export interface QfRoundData {
  round_info: QfRound
  projects: QfProject[]
  contributions: QfContribution[]
  current_alpha?: number
  total_matching_available?: string
}

export interface QfUserStats {
  total_contributed: string
  projects_supported: number[]
  rounds_participated: number[]
}

// Type for signer
export interface Signer {
  signAndSubmit: (extrinsic: any) => Promise<any>
}

// Contract service class
export class QfContractService {
  private client: ReturnType<typeof createClient>
  private typedApi: any
  private qfSdk: any
  private contract: any

  constructor() {
    // Initialize client and API
    this.client = createClient(
      withPolkadotSdkCompat(getWsProvider(WS_PROVIDER_URL))
    )
    this.typedApi = this.client.getTypedApi(paseo)
    
    // Initialize QF contract SDK
    this.qfSdk = createInkSdk(this.typedApi, contracts.qf_funding)
    
    // Contract is ready with deployed address
    this.contract = this.qfSdk.getContract(CONTRACT_ADDRESS)
  }

  // Simple compatibility check (optional)
  async initialize(): Promise<void> {
    try {
      console.log('🔍 Checking contract at address:', CONTRACT_ADDRESS)
      console.log('🔗 Connecting to network:', WS_PROVIDER_URL)
      
      // Test network connectivity first
      await this.typedApi.query.System.Number.getValue()
      console.log('✅ Network connection successful')
      
      // Check if contract exists and is compatible
      console.log('🔍 Checking contract compatibility...')
      const isCompatible = await this.contract.isCompatible()
      console.log('🔍 Contract compatibility result:', isCompatible)
      
      if (!isCompatible) {
        throw new Error(`Contract at ${CONTRACT_ADDRESS} is incompatible with current metadata. This could mean:
        - The contract address is wrong
        - The contract was deployed with different code
        - The metadata doesn't match the deployed contract`)
      }
      
      console.log('✅ Contract compatibility check passed')
    } catch (error) {
      console.error('❌ Contract initialization failed:', error)
      
      if (error instanceof Error) {
        // Provide more specific error messages
        if (error.message.includes('Network')) {
          throw new Error(`Network connection failed: Cannot connect to ${WS_PROVIDER_URL}`)
        }
        if (error.message.includes('incompatible')) {
          throw error // Re-throw our custom compatibility error
        }
        if (error.message.includes('not found')) {
          throw new Error(`Contract not found at address ${CONTRACT_ADDRESS}. Please verify the contract is deployed.`)
        }
      }
      
      throw new Error(`Contract initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Contract is always ready now
  private ensureInitialized(): void {
    if (!this.contract) {
      throw new Error('Contract service error: contract not available')
    }
  }

  // =================== ADMIN FUNCTIONS ===================

  /**
   * Add a new project (Admin only)
   */
  async addProject(
    projectWallet: string,
    signerAccount: string,
    signer: any
  ): Promise<number> {
    this.ensureInitialized()

    const result = await this.contract
      .send('add_project', {
        origin: signerAccount,
        data: {
          project_wallet: projectWallet
        }
      })
      .signAndSubmit(signer)

    if (result.ok) {
      const events = this.contract.filterEvents(result.events)
      console.log('Project added successfully:', events)
      
      // Extract project ID from events or return value
      // This depends on how your contract emits events
      return events.length // Placeholder - adjust based on actual event structure
    } else {
      throw new Error(`Failed to add project: ${result.dispatchError}`)
    }
  }

  /**
   * Create a new funding round (Admin only)
   */
  async createRound(
    matchingPoolAmount: string,
    eligibleProjects: number[],
    durationHours: number,
    signerAccount: string,
    signer: any
  ): Promise<number> {
    this.ensureInitialized()

    const result = await this.contract
      .send('create_round', {
        origin: signerAccount,
        data: {
          matching_pool_unscaled: matchingPoolAmount,
          eligible_projects: eligibleProjects,
          duration_hours: durationHours
        }
      })
      .signAndSubmit(signer)

    if (result.ok) {
      const events = this.contract.filterEvents(result.events)
      console.log('Round created successfully:', events)
      
      // Extract round ID from events
      return events.length // Placeholder - adjust based on actual event structure
    } else {
      throw new Error(`Failed to create round: ${result.dispatchError}`)
    }
  }

  /**
   * Distribute matching funds for a completed round (Admin only)
   */
  async distributeMatchingFunds(
    roundId: number,
    signerAccount: string,
    signer: any
  ): Promise<void> {
    this.ensureInitialized()

    const result = await this.contract
      .send('distribute_matching_funds', {
        origin: signerAccount,
        data: {
          round_id: roundId
        }
      })
      .signAndSubmit(signer)

    if (result.ok) {
      const events = this.contract.filterEvents(result.events)
      console.log('Matching funds distributed:', events)
    } else {
      throw new Error(`Failed to distribute funds: ${result.dispatchError}`)
    }
  }

  // =================== USER FUNCTIONS ===================

  /**
   * Contribute to a project in a round
   */
  async contribute(
    roundId: number,
    projectId: number,
    amount: string,
    signerAccount: string,
    signer: any
  ): Promise<void> {
    this.ensureInitialized()

    const result = await this.contract
      .send('contribute', {
        origin: signerAccount,
        data: {
          round_id: roundId,
          project_id: projectId
        },
        value: amount // Send the contribution amount as value
      })
      .signAndSubmit(signer)

    if (result.ok) {
      const events = this.contract.filterEvents(result.events)
      console.log('Contribution successful:', events)
    } else {
      throw new Error(`Failed to contribute: ${result.dispatchError}`)
    }
  }

  // =================== QUERY FUNCTIONS ===================

  /**
   * Get complete round data with projects and contributions
   */
  async getRoundData(roundId: number, originAccount: string): Promise<QfRoundData> {
    this.ensureInitialized()

    const result = await this.contract.query('get_round_data', {
      origin: originAccount,
      data: {
        round_id: roundId
      }
    })

    if (result.success) {
      return this.formatRoundData(result.value.response)
    } else {
      throw new Error(`Failed to get round data: ${result.value}`)
    }
  }

  /**
   * Get project details
   */
  async getProject(projectId: number, originAccount: string): Promise<QfProject | null> {
    this.ensureInitialized()

    const result = await this.contract.query('get_project', {
      origin: originAccount,
      data: {
        project_id: projectId
      }
    })

    if (result.success) {
      return this.formatProject(result.value.response)
    } else {
      return null
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userAddress: string, originAccount: string): Promise<QfUserStats> {
    this.ensureInitialized()

    const result = await this.contract.query('get_user_stats', {
      origin: originAccount,
      data: {
        user_address: userAddress
      }
    })

    if (result.success) {
      return this.formatUserStats(result.value.response)
    } else {
      throw new Error(`Failed to get user stats: ${result.value}`)
    }
  }

  /**
   * Get user contribution history
   */
  async getUserContributions(userAddress: string, originAccount: string): Promise<QfContribution[]> {
    this.ensureInitialized()

    const result = await this.contract.query('get_user_contributions', {
      origin: originAccount,
      data: {
        user_address: userAddress
      }
    })

    if (result.success) {
      return result.value.response.map((contrib: any) => this.formatContribution(contrib))
    } else {
      throw new Error(`Failed to get contributions: ${result.value}`)
    }
  }

  /**
   * Get all active rounds
   */
  async getAllActiveRounds(originAccount: string): Promise<QfRound[]> {
    this.ensureInitialized()

    // Query multiple rounds (1-20) to find active ones
    const rounds: QfRound[] = []
    
    for (let roundId = 1; roundId <= 20; roundId++) {
      try {
        const roundData = await this.getRoundData(roundId, originAccount)
        if (roundData.round_info.active) {
          rounds.push(roundData.round_info)
        }
             } catch {
         // Round doesn't exist, continue
         break
       }
    }
    
    return rounds
  }

  // =================== UTILITY FUNCTIONS ===================

  /**
   * Format contract response to QfRoundData
   */
  private formatRoundData(rawData: any): QfRoundData {
    return {
      round_info: {
        round_id: rawData.round_info.round_id,
        matching_pool: rawData.round_info.matching_pool.toString(),
        eligible_projects: rawData.round_info.eligible_projects,
        start_time: rawData.round_info.start_time,
        end_time: rawData.round_info.end_time,
        active: rawData.round_info.active,
        final_alpha: rawData.round_info.final_alpha,
        is_finalized: rawData.round_info.is_finalized
      },
      projects: rawData.projects.map((project: any) => ({
        project_id: project.project.project_id,
        wallet_address: project.project.wallet_address,
        total_contributions: project.project.total_contributions.toString(),
        contributor_count: project.project.contributor_count,
        ideal_match: project.ideal_match?.toString(),
        scaled_match: project.scaled_match?.toString(),
        total_funding: project.total_funding?.toString()
      })),
      contributions: rawData.contributions.map((contrib: any) => this.formatContribution(contrib)),
      current_alpha: rawData.current_alpha,
      total_matching_available: rawData.total_matching_available?.toString()
    }
  }

  /**
   * Format contract response to QfProject
   */
  private formatProject(rawProject: any): QfProject {
    return {
      project_id: rawProject.project_id,
      wallet_address: rawProject.wallet_address,
      total_contributions: rawProject.total_contributions.toString(),
      contributor_count: rawProject.contributor_count
    }
  }

  /**
   * Format contract response to QfContribution
   */
  private formatContribution(rawContrib: any): QfContribution {
    return {
      amount: rawContrib.amount.toString(),
      contributor: rawContrib.contributor,
      project_id: rawContrib.project_id,
      round_id: rawContrib.round_id,
      timestamp: rawContrib.timestamp
    }
  }

  /**
   * Format contract response to QfUserStats
   */
  private formatUserStats(rawStats: any): QfUserStats {
    return {
      total_contributed: rawStats.total_contributed.toString(),
      projects_supported: rawStats.projects_supported,
      rounds_participated: rawStats.rounds_participated
    }
  }

  /**
   * Convert amount to contract format (scaled down by 1M)
   */
  static formatAmountForContract(amount: string): string {
    const amountBigInt = BigInt(amount)
    return (amountBigInt / BigInt(1_000_000)).toString()
  }

  /**
   * Convert amount from contract format (scale up by 1M)
   */
  static formatAmountFromContract(amount: string): string {
    const amountBigInt = BigInt(amount)
    return (amountBigInt * BigInt(1_000_000)).toString()
  }

  /**
   * Check if current user is admin
   */
  isAdmin(userAddress: string): boolean {
    return userAddress === ADMIN_ADDRESS
  }

  // Cleanup
  destroy(): void {
    if (this.client) {
      this.client.destroy()
    }
  }
}

// Singleton instance
let qfContractService: QfContractService | null = null

/**
 * Get or create QF contract service instance
 */
export function getQfContractService(): QfContractService {
  if (!qfContractService) {
    qfContractService = new QfContractService()
  }
  return qfContractService
}

/**
 * Initialize the contract service (contract address is already configured)
 */
export async function initializeQfContract(): Promise<void> {
  const service = getQfContractService()
  await service.initialize()
}

// Export admin address and contract address for reference
export { ADMIN_ADDRESS, CONTRACT_ADDRESS } 