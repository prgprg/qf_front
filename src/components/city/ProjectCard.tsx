import { motion } from 'framer-motion'
import { Users, Target, Calendar } from 'lucide-react'
import type { EnrichedProject } from '../../types'

interface ProjectCardProps {
  project: EnrichedProject
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'Environmental':
        return 'text-green-400 bg-green-400/10'
      case 'Community':
        return 'text-blue-400 bg-blue-400/10'
      case 'Mobility':
        return 'text-purple-400 bg-purple-400/10'
      case 'Fashion':
        return 'text-pink-400 bg-pink-400/10'
      case 'Education':
        return 'text-yellow-400 bg-yellow-400/10'
      case 'Technology':
        return 'text-cyan-400 bg-cyan-400/10'
      default:
        return 'text-gray-400 bg-gray-400/10'
    }
  }

  return (
    <motion.div
      className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:border-green-500/50 transition-all duration-300 group h-full flex flex-col"
      whileHover={{ y: -4 }}
    >
      {/* Project Image */}
      <div className="relative h-48 overflow-hidden">
        {project.image_url ? (
          <img
            src={project.image_url}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <Target className="w-16 h-16 text-gray-600" />
          </div>
        )}
        
        {/* Category Badge */}
        {project.category && (
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getCategoryColor(project.category)}`}>
              {project.category}
            </span>
          </div>
        )}

        {/* Funding Overlay */}
        {project.funding_stats && (
          <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-lg text-xs text-white">
            €{project.funding_stats.total_raised.toLocaleString()}
          </div>
        )}
      </div>

      {/* Project Content */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-4 flex-1">
          <h3 className="text-lg font-semibold text-white group-hover:text-green-400 transition-colors line-clamp-2 mb-2">
            {project.title}
          </h3>
          
          {project.description && (
            <p className="text-gray-400 text-sm line-clamp-3">
              {project.description}
            </p>
          )}
        </div>

        {/* Creator Info */}
        {project.creator_name && (
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {project.creator_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-gray-300 text-sm">{project.creator_name}</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 gap-3 mb-4">
          {project.funding_stats && (
            <>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">
                  {project.funding_stats.contributor_count} supporters
                </span>
              </div>
              
              {project.funding_stats.matching_estimate && (
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-300">
                    €{project.funding_stats.matching_estimate.toLocaleString()} estimated match
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-md"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-md">
                +{project.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-800 mt-auto">
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(project.created_at)}</span>
          </div>
          
          <motion.button
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View Details
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
} 