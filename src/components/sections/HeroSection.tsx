import { motion, AnimatePresence, type MotionValue } from 'framer-motion'
import { useState, useEffect } from 'react'
import Spline from '@splinetool/react-spline'
import ScrollIndicator from '../ui/ScrollIndicator'

interface HeroSectionProps {
  opacity: MotionValue<number>
}

export default function HeroSection({ opacity }: HeroSectionProps) {
  const [isSplineLoading, setIsSplineLoading] = useState(true)
  const [splineError, setSplineError] = useState(false)
  const [showChevron, setShowChevron] = useState(false)

  // Mouse movement logic for chevron
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>

    const handleMouseMove = () => {
      setShowChevron(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => setShowChevron(false), 2000) // Hide after 2 seconds of no movement
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(timeout)
    }
  }, [])

  const handleSplineLoad = () => {
    setIsSplineLoading(false)
  }

  const handleSplineError = () => {
    setIsSplineLoading(false)
    setSplineError(true)
  }

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Spline Background */}
      <div className="absolute inset-0 z-0">
        {/* Loading State */}
        <AnimatePresence>
          {isSplineLoading && (
            <motion.div 
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0 z-10 bg-black/80 flex items-center justify-center backdrop-blur-sm"
            >
              <div className="text-center">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 mx-auto mb-4 border-4 border-green-400 border-t-transparent rounded-full"
                />
                <motion.p 
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-green-400 text-sm font-medium"
                >
                  Loading Experience...
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Error State */}
        {splineError && (
          <div className="absolute inset-0 z-10 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full animate-pulse"></div>
              <p className="text-green-400/80 text-sm font-medium">Preparing experience...</p>
            </div>
          </div>
        )}

        {/* Spline Component */}
        <Spline
          scene="https://prod.spline.design/JpNUmNU5Bv5kX9ge/scene.splinecode"
          onLoad={handleSplineLoad}
          onError={handleSplineError}
          style={{
            width: '125%', // Make it bigger to hide watermark
            height: '120%',
            transform: 'translate(-10%, -10%)', // Center the enlarged scene
            background: 'transparent',
            pointerEvents: 'auto',
          }}
          className="transition-opacity duration-1000"
        />
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
        <ScrollIndicator 
          targetId="about" 
          show={showChevron} 
          opacity={opacity}
        />
      </div>
    </section>
  )
} 