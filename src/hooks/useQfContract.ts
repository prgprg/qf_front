import { useState, useCallback } from 'react'
import { usePolkadot } from '../contexts/PolkadotContext'
import { getQfContractService, initializeQfContract } from '../services/qfContractService'

// Simplified contract interface for immediate use
export interface QfRound {
  round_id: number
  matching_pool: string
  eligible_projects: number[]
  start_time: number
  end_time: number
  active: boolean
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

export interface UseQfContractReturn {
  // State
  isLoading: boolean
  error: string | null
  activeRounds: QfRound[]
  selectedRoundData: QfRoundData | null
  
  // Actions
  loadActiveRounds: () => Promise<void>
  loadRoundData: (roundId: number) => Promise<void>
  contribute: (roundId: number, projectId: number, amount: string) => Promise<void>
  initializeContract: () => Promise<void>
  
  // Utilities
  formatAmount: (amount: string | number) => string
  calculateTimeRemaining: (endTime: number) => number
}

export function useQfContract(): UseQfContractReturn {
  const { selectedAccount, injector } = usePolkadot()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeRounds, setActiveRounds] = useState<QfRound[]>([])
  const [selectedRoundData, setSelectedRoundData] = useState<QfRoundData | null>(null)
  const [isContractInitialized, setIsContractInitialized] = useState(false)
  
  const contractService = getQfContractService()

  const formatAmount = useCallback((amount: string | number): string => {
    const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount
    if (amountNum >= 1_000_000) {
      return `${(amountNum / 1_000_000).toFixed(1)}M`
    } else if (amountNum >= 1_000) {
      return `${(amountNum / 1_000).toFixed(1)}K`
    }
    return amountNum.toFixed(2)
  }, [])

  const calculateTimeRemaining = useCallback((endTime: number): number => {
    const now = Math.floor(Date.now() / 1000)
    return Math.max(0, endTime - now)
  }, [])

  const initializeContract = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      await initializeQfContract()
      setIsContractInitialized(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize contract')
      console.error('Error initializing contract:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadActiveRounds = useCallback(async () => {
    if (!isContractInitialized || !selectedAccount) {
      setError('Contract not initialized or account not connected')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const rounds = await contractService.getAllActiveRounds(selectedAccount.address)
      setActiveRounds(rounds.map(round => ({
        round_id: round.round_id,
        matching_pool: round.matching_pool,
        eligible_projects: round.eligible_projects,
        start_time: round.start_time,
        end_time: round.end_time,
        active: round.active || false,
        is_finalized: round.is_finalized
      })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load active rounds')
      console.error('Error loading active rounds:', err)
    } finally {
      setIsLoading(false)
    }
  }, [isContractInitialized, selectedAccount, contractService])

  const loadRoundData = useCallback(async (roundId: number) => {
    if (!isContractInitialized || !selectedAccount) {
      setError('Contract not initialized or account not connected')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const roundData = await contractService.getRoundData(roundId, selectedAccount.address)
      
      setSelectedRoundData({
        round_info: {
          round_id: roundData.round_info.round_id,
          matching_pool: roundData.round_info.matching_pool,
          eligible_projects: roundData.round_info.eligible_projects,
          start_time: roundData.round_info.start_time,
          end_time: roundData.round_info.end_time,
          active: roundData.round_info.active || false,
          is_finalized: roundData.round_info.is_finalized
        },
        projects: roundData.projects.map(project => ({
          project_id: project.project_id,
          wallet_address: project.wallet_address,
          total_contributions: project.total_contributions,
          contributor_count: project.contributor_count,
          ideal_match: project.ideal_match,
          scaled_match: project.scaled_match,
          total_funding: project.total_funding
        })),
        contributions: roundData.contributions.map(contrib => ({
          amount: contrib.amount,
          contributor: contrib.contributor,
          project_id: contrib.project_id,
          round_id: contrib.round_id,
          timestamp: contrib.timestamp
        })),
        current_alpha: roundData.current_alpha,
        total_matching_available: roundData.total_matching_available
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load round data')
      console.error('Error loading round data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [isContractInitialized, selectedAccount, contractService])

  const contribute = useCallback(async (roundId: number, projectId: number, amount: string) => {
    if (!isContractInitialized || !selectedAccount || !injector) {
      setError('Contract not initialized or wallet not connected')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await contractService.contribute(
        roundId,
        projectId,
        amount,
        selectedAccount.address,
        injector.signer
      )
      
      // Reload round data after contribution
      await loadRoundData(roundId)
      
      console.log('Contribution successful')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to contribute')
      console.error('Error contributing:', err)
    } finally {
      setIsLoading(false)
    }
  }, [isContractInitialized, selectedAccount, injector, contractService, loadRoundData])

  return {
    isLoading,
    error,
    activeRounds,
    selectedRoundData,
    loadActiveRounds,
    loadRoundData,
    contribute,
    initializeContract,
    formatAmount,
    calculateTimeRemaining
  }
} 