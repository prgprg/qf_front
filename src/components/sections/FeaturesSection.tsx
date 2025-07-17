import { motion } from 'framer-motion'
import { Users, Target, Zap, Heart, Globe, Leaf } from 'lucide-react'
import FeatureCard from '../ui/FeatureCard'

const features = [
  {
    icon: <Users className="w-8 h-8" />,
    title: "Initiative Hub",
    description: "Discover and connect with local sustainability projects in your city"
  },
  {
    icon: <Target className="w-8 h-8" />,
    title: "Impact Visualization",
    description: "See tangible results and track collective environmental progress"
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Quadratic Funding",
    description: "Revolutionary Web3 funding mechanism for democratic resource allocation"
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: "Behavioral Science",
    description: "Evidence-based design promoting sustained pro-environmental behavior"
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: "Local Focus",
    description: "Tailored specifically for your city's unique sustainability ecosystem"
  },
  {
    icon: <Leaf className="w-8 h-8" />,
    title: "Community-Driven",
    description: "By the community, for the community - fostering grassroots action"
  }
]

export default function FeaturesSection() {
  return (
    <section className="py-20 px-6 bg-black">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-green-400">
            Platform Features
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  )
} 