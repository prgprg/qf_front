import { motion, type MotionValue } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface ScrollIndicatorProps {
  targetId: string
  show: boolean
  opacity?: MotionValue<number>
}

export default function ScrollIndicator({ targetId, show, opacity }: ScrollIndicatorProps) {
  const scrollToSection = () => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <motion.div 
      style={{ opacity }}
      className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 transition-opacity duration-300 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="cursor-pointer"
        onClick={scrollToSection}
      >
        <ChevronDown size={32} className="text-green-400 hover:text-green-300 transition-colors" />
      </motion.div>
    </motion.div>
  )
} 