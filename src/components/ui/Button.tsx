import { motion } from 'framer-motion'
import { type ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  className?: string
}

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick,
  className = '' 
}: ButtonProps) {
  const baseClasses = "font-semibold rounded-full transition-all duration-300"
  
  const variants = {
    primary: "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg pulse-glow",
    secondary: "border-2 border-green-500 text-white hover:bg-green-500/10"
  }
  
  const sizes = {
    sm: "px-6 py-2 text-sm",
    md: "px-8 py-4 text-lg",
    lg: "px-10 py-5 text-xl"
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </motion.button>
  )
} 