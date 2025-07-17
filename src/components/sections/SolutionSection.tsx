import { motion } from 'framer-motion'
import { Leaf } from 'lucide-react'

const features = [
  "Deep insights from environmental psychology",
  "Analysis of values, efficacy, and contextual barriers",
  "Targeted needs assessment with local initiatives",
  "Initiative-centric approach"
]

export default function SolutionSection() {
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
            Our Solution
          </h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            A research-driven digital platform designed for your city's unique sustainability ecosystem, 
            integrating environmental psychology with innovative Web3 funding mechanisms.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-3xl font-bold mb-6 text-white">Context-Aware Design</h3>
            <div className="space-y-4">
              {features.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="bg-gray-900/50 p-8 rounded-3xl border border-gray-800 hover:border-green-400/50 transition-all duration-300">
              <div className="text-center">
                <Leaf className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h4 className="text-2xl font-semibold mb-4 text-white">Initiative Hub</h4>
                <p className="text-gray-300">
                  Connect, collaborate, and amplify your impact within your city's sustainability network
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
} 