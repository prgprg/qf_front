import { useScroll, useTransform } from 'framer-motion'
import {
  HeroSection,
  AboutSection,
  SolutionSection,
  FeaturesSection,
  CTASection,
  Footer
} from './components'

function App() {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <HeroSection opacity={opacity} />
      <AboutSection />
      <SolutionSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </div>
  )
}

export default App
