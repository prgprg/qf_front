import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Lock } from 'lucide-react'
import { mockCities } from '../data/mockData'
import { Button } from '../components'

// Import city images
import aachenImg from '/assets/Aachen.png'
import berlinImg from '/assets/Berlin.png'
import munichImg from '/assets/Munich.png'
import hamburgImg from '/assets/Hamburg.png'
import cologneImg from '/assets/Cologne.png'
import stuttgartImg from '/assets/Stutgart.png'

// Map city slugs to their images
const cityImages: Record<string, string> = {
  aachen: aachenImg,
  berlin: berlinImg,
  munich: munichImg,
  hamburg: hamburgImg,
  cologne: cologneImg,
  stuttgart: stuttgartImg,
}

export default function CitySelection() {
  const navigate = useNavigate()

  const handleCityClick = (citySlug: string, isActive: boolean) => {
    if (isActive) {
      navigate(`/cities/${citySlug}`)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <motion.button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors"
            whileHover={{ x: -4 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </motion.button>
          
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-green-400"
          >
            Sustained
          </motion.h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Choose Your City
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover and support local sustainability initiatives in your community. 
              More cities coming soon as we expand across Germany.
            </p>
          </motion.div>

          {/* Cities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {mockCities.map((city, index) => (
              <motion.div
                key={city.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                onClick={() => handleCityClick(city.slug, city.is_active)}
                className={`
                  relative 
                  p-8 
                  rounded-2xl 
                  border-2
                  transition-all 
                  duration-300
                  h-[280px]
                  flex
                  flex-col
                  justify-between
                  overflow-hidden
                  group
                  ${city.is_active 
                    ? 'border-green-500 hover:border-green-400 cursor-pointer' 
                    : 'border-gray-700 cursor-not-allowed opacity-60'
                  }
                `}
                style={{
                  backgroundImage: `url(${cityImages[city.slug]})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Dark overlay */}
                <div className={`
                  absolute inset-0 
                  ${city.is_active 
                    ? 'bg-black/50 group-hover:bg-black/40' 
                    : 'bg-black/70'
                  } 
                  transition-colors duration-300
                `} />

                {/* Status Indicator */}
                <div className="absolute top-4 right-4 z-10">
                  {city.is_active ? (
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  ) : (
                    <Lock className="w-4 h-4 text-gray-500" />
                  )}
                </div>

                {/* City Content */}
                <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                  <MapPin className={`w-12 h-12 mb-4 ${
                    city.is_active ? 'text-green-400' : 'text-gray-500'
                  }`} />
                  
                  <h3 className={`text-2xl font-bold mb-2 ${
                    city.is_active ? 'text-white' : 'text-gray-400'
                  }`}>
                    {city.name}
                  </h3>
                  
                  <p className={`text-sm ${
                    city.is_active ? 'text-green-300' : 'text-gray-500'
                  }`}>
                    {city.is_active ? 'Active & Ready' : 'Coming Soon'}
                  </p>
                </div>

                {/* Action Button for Active City */}
                {city.is_active && (
                  <motion.div
                    className="mt-6 relative z-10"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      variant="primary" 
                      size="sm"
                      className="w-full"
                    >
                      Explore Projects
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Coming Soon Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-center mt-16"
          >
            <p className="text-gray-400 text-lg mb-4">
              Want to bring Sustained to your city?
            </p>
            <Button 
              variant="secondary" 
              size="md"
              onClick={() => window.open('mailto:hello@sustained.qf', '_blank')}
            >
              Get in Touch
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  )
} 