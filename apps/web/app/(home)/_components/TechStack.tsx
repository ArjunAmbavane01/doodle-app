"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { Badge } from "@workspace/ui/components/badge"
import { Code, Sparkles } from "lucide-react"

const technologies = [
  {
    name: "Next.js",
    icon: "/images/logos/next.png",
    reason: "For server-side rendering and optimal performance",
    category: "Frontend",
  },
  {
    name: "TypeScript",
    icon: "/images/logos/typescript.png",
    reason: "To ensure type safety and improve code quality",
    category: "Language",
  },
  {
    name: "Tailwind CSS",
    icon: "/images/logos/tailwind.png",
    reason: "For rapid UI development with utility classes",
    category: "Styling",
  },
  {
    name: "PostgreSQL",
    icon: "/images/logos/postgresql.png",
    reason: "Used as the primary database for data persistence",
    category: "Database",
  },
  {
    name: "Prisma",
    icon: "/images/logos/prisma.png",
    reason: "For type-safe database queries and migrations",
    category: "ORM",
  },
  {
    name: "Web Sockets",
    icon: "/images/logos/websocket.png",
    reason: "To enable real-time collaboration features",
    category: "Real-time",
  },
  {
    name: "Redis",
    icon: "/images/logos/redis.png",
    reason: "For caching and improving application speed",
    category: "Cache",
  },
  {
    name: "Docker",
    icon: "/images/logos/typescript.png",
    reason: "To ensure consistent development and deployment",
    category: "DevOps",
  },
]

const TechCard = ({ tech }: { tech: (typeof technologies)[0] }) => {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <motion.div
      className="relative place-items-center mx-auto size-52"
      initial={{ opacity: 0, scale: 0.8 }}
      viewport={{ once: true }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        className="absolute inset-0 cursor-pointer"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, animationDirection: "normal" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front of card */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-white/[0.07] p-6 backdrop-blur-xl backface-hidden border border-white/10 hover:border-white/20 transition-colors">
          <Badge className="absolute top-3 right-3 bg-white/10 text-xs font-medium text-white/60">
            {tech.category}
          </Badge>
          <img src={tech.icon || "/placeholder.svg"} alt={tech.name} className="size-16 mb-4 drop-shadow-lg" />
          <h3 className="text-lg font-semibold text-white text-center">{tech.name}</h3>
        </div>

        {/* Back of card */}
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/[0.07] p-6 text-center backdrop-blur-xl backface-hidden border border-white/10 [transform:rotateY(180deg)]">
          <p className="text-sm text-white/80 leading-relaxed">{tech.reason}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

const TechStack = () => {
  return (
    <section className="flex w-full bg-black py-24 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(255,164,228,0.05),transparent_50%)]" />

      <div className="flex flex-col gap-20 max-w-screen-8xl w-full mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4"
        >
          <Badge className="bg-white/5 text-white/80 gap-2 p-2">
            <Code className="size-4" />
            Tech Stack
          </Badge>
          <h2 className="font-heading font-bold text-center text-4xl text-white">
            The Stack Powering This Project
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center text-gray-400 font-body max-w-2xl"
          >
            Built with modern, efficient, and scalable tools.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-16 px-20 w-full mx-auto">
          {technologies.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <TechCard tech={tech} />
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .backface-hidden {
          backface-visibility: hidden;
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 8s linear infinite;
        }
      `}</style>
    </section>
  )
}

export default TechStack

