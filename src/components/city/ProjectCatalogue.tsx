import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Users, Target, Calendar } from 'lucide-react'
import type { City, EnrichedProject, ProjectCategory } from '../../types'
import ProjectCard from './ProjectCard'

interface ProjectCatalogueProps {
  city: City
  projects: EnrichedProject[]
}

const categories: ProjectCategory[] = [
  'Environmental',
  'Community', 
  'Mobility',
  'Fashion',
  'Education',
  'Technology',
  'Other'
]

export default function ProjectCatalogue({ projects }: ProjectCatalogueProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | 'all'>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'funded'>('recent')

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    const filtered = projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.creator_name?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory
      
      return matchesSearch && matchesCategory && project.is_active
    })

    // Sort projects
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.funding_stats?.contributor_count || 0) - (a.funding_stats?.contributor_count || 0)
        case 'funded':
          return (b.funding_stats?.total_raised || 0) - (a.funding_stats?.total_raised || 0)
        case 'recent':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    return filtered
  }, [projects, searchTerm, selectedCategory, sortBy])

  const totalFunding = projects.reduce((sum, p) => sum + (p.funding_stats?.total_raised || 0), 0)
  const totalContributors = projects.reduce((sum, p) => sum + (p.funding_stats?.contributor_count || 0), 0)

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center space-x-3">
            <Target className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-white">{projects.length}</p>
              <p className="text-gray-400 text-sm">Active Projects</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-white">{totalContributors}</p>
              <p className="text-gray-400 text-sm">Contributors</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center space-x-3">
            <Calendar className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-white">€{totalFunding.toLocaleString()}</p>
              <p className="text-gray-400 text-sm">Total Funding</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-900/30 p-6 rounded-xl border border-gray-800"
      >
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects, creators, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ProjectCategory | 'all')}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular' | 'funded')}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-green-500 focus:outline-none"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="funded">Highest Funded</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Results Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-xl font-semibold text-white">
          {filteredProjects.length} Projects Found
        </h2>
        
        {searchTerm && (
          <span className="text-gray-400 text-sm">
            Searching for "{searchTerm}"
          </span>
        )}
      </motion.div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.contract_project_id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center py-12"
        >
          <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No Projects Found</h3>
          <p className="text-gray-500">
            Try adjusting your search terms or filters to find more projects.
          </p>
        </motion.div>
      )}
    </div>
  )
} 