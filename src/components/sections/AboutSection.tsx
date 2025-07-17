import { motion } from 'framer-motion'
import { Globe, Users, Target } from 'lucide-react'

const challenges = [
  {
    icon: <Globe className="w-8 h-8" />,
    title: "Global Disconnect",
    description: "Top-down approaches struggle to create lasting change at the community level"
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Fragmented Efforts",
    description: "Local initiatives work in isolation, missing opportunities for collaboration"
  },
  {
    icon: <Target className="w-8 h-8" />,
    title: "Resource Constraints",
    description: "Limited funding and visibility hinder the collective potential of local action"
  }
]

export default function AboutSection() {
  return (
    <section id="about" className="py-20 px-6 bg-black">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-green-400">
            The Challenge We Face
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Global sustainability targets like the SDGs are proving difficult to achieve amidst shifting political landscapes. 
            Local, community-driven initiatives offer resilience, but they operate in fragmented ecosystems with limited resources and visibility.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {challenges.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800 hover:border-green-400/50 transition-all duration-300"
            >
              <div className="text-green-400 mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold mb-3 text-white">{item.title}</h3>
              <p className="text-gray-400">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
} 