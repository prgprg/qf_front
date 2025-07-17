import type { 
  City, 
  Project, 
  EnrichedProject, 
  Round, 
  EnrichedRound, 
  Contribution, 
  ContractProject,
  UserStats,
  UserProfile 
} from '../types'

// =====================================================
// CITIES DATA
// =====================================================

export const mockCities: City[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Aachen',
    slug: 'aachen',
    is_active: true,
    contract_address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Berlin',
    slug: 'berlin',
    is_active: false,
    contract_address: null,
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Munich',
    slug: 'munich',
    is_active: false,
    contract_address: null,
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    name: 'Hamburg',
    slug: 'hamburg',
    is_active: false,
    contract_address: null,
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    name: 'Cologne',
    slug: 'cologne',
    is_active: false,
    contract_address: null,
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    name: 'Stuttgart',
    slug: 'stuttgart',
    is_active: false,
    contract_address: null,
    created_at: '2024-01-15T10:00:00Z'
  }
]

// =====================================================
// PROJECTS DATA (Aachen Projects)
// =====================================================

export const mockProjects: Project[] = [
  {
    contract_project_id: 1,
    city_id: '00000000-0000-0000-0000-000000000001',
    title: 'Aachener Baumschutzbund',
    description: 'Dedicated to the preservation and expansion of urban tree canopy in Aachen. Our mission is to protect existing trees, plant new ones, and educate the community about the vital role trees play in urban ecosystems.',
    image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop',
    creator_name: 'Johannes Müller',
    creator_address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    category: 'Environmental',
    tags: ['Environmental Protection', 'Urban Forestry', 'Climate Action'],
    is_active: true,
    created_at: '2024-01-20T09:00:00Z'
  },
  {
    contract_project_id: 2,
    city_id: '00000000-0000-0000-0000-000000000001',
    title: 'Aachen, was geht?!',
    description: 'A platform for educational work and community development in Aachen. We focus on youth engagement, cultural events, and building bridges between different communities in our diverse city.',
    image_url: 'https://images.unsplash.com/photo-1560439513-74b037a25d84?w=800&h=600&fit=crop',
    creator_name: 'Ja Pfeiffer',
    creator_address: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
    category: 'Community',
    tags: ['Community Development', 'Education', 'Youth Engagement'],
    is_active: true,
    created_at: '2024-01-22T14:30:00Z'
  },
  {
    contract_project_id: 3,
    city_id: '00000000-0000-0000-0000-000000000001',
    title: 'Uni.Urban.Mobil. e.V.',
    description: 'A volunteer-driven initiative focused on sustainable mobility and urban gardening. We promote bike culture, public transport advocacy, and create green spaces throughout Aachen.',
    image_url: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800&h=600&fit=crop',
    creator_name: 'Sebastian Lukas',
    creator_address: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
    category: 'Mobility',
    tags: ['Sustainable Mobility', 'Urban Gardening', 'Bike Culture'],
    is_active: true,
    created_at: '2024-01-25T11:15:00Z'
  },
  {
    contract_project_id: 4,
    city_id: '00000000-0000-0000-0000-000000000001',
    title: 'nAChhaltig angezogen',
    description: 'An initiative focused on sustainable fashion and waste reduction. We organize clothing swaps, repair cafes, and educate about fast fashion\'s environmental impact.',
    image_url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&h=600&fit=crop',
    creator_name: 'Julia Schmidt',
    creator_address: '5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw',
    category: 'Fashion',
    tags: ['Sustainable Fashion', 'Waste Reduction', 'Circular Economy'],
    is_active: true,
    created_at: '2024-01-28T16:45:00Z'
  },
  {
    contract_project_id: 5,
    city_id: '00000000-0000-0000-0000-000000000001',
    title: 'Aachen Energy Collective',
    description: 'Community-driven renewable energy initiatives. We help residents organize solar panel cooperatives and energy-saving programs.',
    image_url: 'https://images.unsplash.com/photo-1558804462-1ab0abe5a8ea?w=800&h=600&fit=crop',
    creator_name: 'Michael Weber',
    creator_address: '5Fre3kQbhyJcVXVxqXQKo7mKj9g4r8n2LpQzCtR5VgE3nKj2',
    category: 'Environmental',
    tags: ['Renewable Energy', 'Community Solar', 'Energy Efficiency'],
    is_active: true,
    created_at: '2024-02-01T08:30:00Z'
  },
  {
    contract_project_id: 6,
    city_id: '00000000-0000-0000-0000-000000000001',
    title: 'Digital Skills for Seniors',
    description: 'Bridging the digital divide by teaching technology skills to elderly residents, fostering intergenerational connections.',
    image_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop',
    creator_name: 'Anna Hoffmann',
    creator_address: '5GhK8QfVqV2LpR3nYvJ7rX9mQzN4tP6eW1sF8uC2dE5hRtY9',
    category: 'Education',
    tags: ['Digital Literacy', 'Senior Care', 'Intergenerational'],
    is_active: true,
    created_at: '2024-02-03T13:20:00Z'
  }
]

// =====================================================
// CONTRACT DATA
// =====================================================

export const mockContractProjects: ContractProject[] = [
  { project_id: 1, total_contributions: 2450, contributor_count: 18 },
  { project_id: 2, total_contributions: 1890, contributor_count: 23 },
  { project_id: 3, total_contributions: 3200, contributor_count: 31 },
  { project_id: 4, total_contributions: 1650, contributor_count: 15 },
  { project_id: 5, total_contributions: 2800, contributor_count: 19 },
  { project_id: 6, total_contributions: 1200, contributor_count: 12 }
]

export const mockContributions: Contribution[] = [
  // Round 1 contributions
  { amount: 250, contributor: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', project_id: 1, round_id: 1, timestamp: 1706097600 },
  { amount: 150, contributor: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y', project_id: 1, round_id: 1, timestamp: 1706184000 },
  { amount: 300, contributor: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy', project_id: 2, round_id: 1, timestamp: 1706270400 },
  { amount: 200, contributor: '5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw', project_id: 3, round_id: 1, timestamp: 1706356800 },
  { amount: 100, contributor: '5Fre3kQbhyJcVXVxqXQKo7mKj9g4r8n2LpQzCtR5VgE3nKj2', project_id: 1, round_id: 1, timestamp: 1706443200 },
  // More contributions...
  { amount: 175, contributor: '5GhK8QfVqV2LpR3nYvJ7rX9mQzN4tP6eW1sF8uC2dE5hRtY9', project_id: 4, round_id: 1, timestamp: 1706529600 },
  
  // Round 2 contributions (active round)
  { amount: 320, contributor: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', project_id: 5, round_id: 2, timestamp: 1708635600 },
  { amount: 180, contributor: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y', project_id: 6, round_id: 2, timestamp: 1708722000 },
  { amount: 275, contributor: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy', project_id: 5, round_id: 2, timestamp: 1708808400 }
]

export const mockRounds: Round[] = [
  {
    round_id: 1,
    matching_pool: 10000,
    eligible_projects: [1, 2, 3, 4],
    start_time: 1706097600, // Jan 24, 2024
    end_time: 1707912000,   // Feb 14, 2024
    active: false,
    final_alpha: 8500, // 0.85 scaling factor
    is_finalized: true
  },
  {
    round_id: 2,
    matching_pool: 15000,
    eligible_projects: [3, 4, 5, 6],
    start_time: 1708635600, // Feb 23, 2024
    end_time: 1710450000,   // Mar 15, 2024
    active: true,
    final_alpha: undefined,
    is_finalized: false
  },
  {
    round_id: 3,
    matching_pool: 20000,
    eligible_projects: [1, 2, 5, 6],
    start_time: 1711659600, // Mar 29, 2024
    end_time: 1713474000,   // Apr 19, 2024
    active: false,
    final_alpha: undefined,
    is_finalized: false
  }
]

// =====================================================
// ENRICHED DATA (Combined database + contract)
// =====================================================

export const mockEnrichedProjects: EnrichedProject[] = mockProjects.map(project => {
  const contractData = mockContractProjects.find(cp => cp.project_id === project.contract_project_id)
  return {
    ...project,
    contract_data: contractData,
    funding_stats: contractData ? {
      total_raised: contractData.total_contributions,
      contributor_count: contractData.contributor_count,
      matching_estimate: Math.floor(contractData.total_contributions * 0.3) // Rough QF estimate
    } : undefined
  }
})

export const mockEnrichedRounds: EnrichedRound[] = mockRounds.map(round => {
  const roundProjects = mockEnrichedProjects.filter(p => 
    round.eligible_projects.includes(p.contract_project_id)
  )
  const roundContributions = mockContributions.filter(c => c.round_id === round.round_id)
  const uniqueContributors = new Set(roundContributions.map(c => c.contributor)).size
  const totalContributions = roundContributions.reduce((sum, c) => sum + c.amount, 0)

  const now = Date.now() / 1000
  let status: 'upcoming' | 'active' | 'ended' | 'finalized' = 'upcoming'
  
  if (round.is_finalized) {
    status = 'finalized'
  } else if (now > round.end_time) {
    status = 'ended'
  } else if (now >= round.start_time && now <= round.end_time) {
    status = 'active'
  }

  return {
    ...round,
    projects: roundProjects,
    total_contributions: totalContributions,
    unique_contributors: uniqueContributors,
    time_remaining: status === 'active' ? round.end_time - now : undefined,
    status
  }
})

// =====================================================
// USER DATA
// =====================================================

export const mockUserProfiles: UserProfile[] = [
  {
    wallet_address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    display_name: 'Alex Chen',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    wallet_address: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
    display_name: 'Sarah Miller',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    created_at: '2024-01-18T14:30:00Z'
  }
]

export const mockUserStats: UserStats = {
  total_contributed: 1275,
  projects_supported: 4,
  rounds_participated: [1, 2]
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export const getActiveCity = (): City => {
  return mockCities.find(city => city.is_active) || mockCities[0]
}

export const getProjectsByCity = (cityId: string): EnrichedProject[] => {
  return mockEnrichedProjects.filter(project => project.city_id === cityId)
}

export const getActiveRounds = (): EnrichedRound[] => {
  return mockEnrichedRounds.filter(round => round.status === 'active')
}

export const getRoundById = (roundId: number): EnrichedRound | undefined => {
  return mockEnrichedRounds.find(round => round.round_id === roundId)
} 