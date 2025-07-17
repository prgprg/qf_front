import { useScroll, useTransform } from 'framer-motion'
import {
  HeroSection,
  AboutSection,
  SolutionSection,
  FeaturesSection,
  CTASection,
  Footer
} from '../components'

export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])

  return (
    <>
      <HeroSection opacity={opacity} />
      <AboutSection />
      <SolutionSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </>
  )
} 