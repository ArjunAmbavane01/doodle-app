"use client"

import { useState } from "react"
import { motion } from "motion/react"

const technologies = [
  {
    name: "Next.js",
    icon: "/placeholder.svg?height=64&width=64",
    reason: "For server-side rendering and optimal performance",
  },
  {
    name: "TypeScript",
    icon: "/placeholder.svg?height=64&width=64",
    reason: "To ensure type safety and improve code quality",
  },
  {
    name: "Tailwind CSS",
    icon: "/placeholder.svg?height=64&width=64",
    reason: "For rapid UI development with utility classes",
  },
  {
    name: "PostgreSQL",
    icon: "/placeholder.svg?height=64&width=64",
    reason: "Used as the primary database for data persistence",
  },
  {
    name: "Prisma",
    icon: "/placeholder.svg?height=64&width=64",
    reason: "For type-safe database queries and migrations",
  },
  {
    name: "Socket.io",
    icon: "/placeholder.svg?height=64&width=64",
    reason: "To enable real-time collaboration features",
  },
  {
    name: "Redis",
    icon: "/placeholder.svg?height=64&width=64",
    reason: "For caching and improving application speed",
  },
  {
    name: "Docker",
    icon: "/placeholder.svg?height=64&width=64",
    reason: "To ensure consistent development and deployment",
  },
]

const TechCard = ({ tech }: { tech: (typeof technologies)[0] }) => {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <motion.div
      className="relative h-40 w-40 cursor-pointer"
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
      onMouseEnter={() => setIsFlipped(!isFlipped)}
      onMouseLeave={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, animationDirection: "normal" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front of card */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-white/10 p-6 backdrop-blur-lg backface-hidden">
          <img src={tech.icon || "/placeholder.svg"} alt={tech.name} className="h-16 w-16 mb-4" />
          <h3 className="text-lg font-semibold text-white text-center">{tech.name}</h3>
        </div>

        {/* Back of card */}
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/10 p-4 text-center backdrop-blur-lg backface-hidden [transform:rotateY(180deg)]">
          <p className="text-sm text-white">{tech.reason}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

const TechStack = () => {
  return (
    <section className="relative w-full bg-black py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(120,119,198,0.15),transparent)]" />

      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mb-12 text-center text-4xl font-bold text-white md:text-5xl"
        >
          Tech Stack Used
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16 text-center text-xl text-gray-400"
        >
          Click on each card to see why we chose these technologies
        </motion.p>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4">
          {technologies.map((tech) => (
            <TechCard key={tech.name} tech={tech} />
          ))}
        </div>
      </div>

      <style jsx global>{`
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </section>
  )
}

export default TechStack

