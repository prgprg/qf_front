import { motion } from 'framer-motion'
import Button from '../ui/Button'

export default function CTASection() {
  return (
    <section className="py-20 px-6 bg-black">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-green-400">
            Ready to Make an Impact?
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Join your city's sustainability network and be part of the solution. Together, we can create lasting environmental change.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button>
              Get Started
            </Button>
            <Button variant="secondary">
              Learn More
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
} 