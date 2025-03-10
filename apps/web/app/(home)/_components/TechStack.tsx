"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { Badge } from "@workspace/ui/components/badge"
import { Code } from "lucide-react"
import Image from "next/image"

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
    <motion.div className="relative place-items-center mx-auto size-48 xl:size-52"
      initial={{ opacity: 0, scale: 0.8 }} viewport={{ once: true }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
      onMouseEnter={() => setIsFlipped(true)} onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div className="absolute inset-0 cursor-pointer" initial={false} animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.6, animationDirection: "normal" }} style={{ transformStyle: "preserve-3d" }}
      >
        {/* front of card */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 rounded-xl bg-white/10 backdrop-blur-xl backface-hidden border border-white/10 hover:border-white/20 transition-colors">
          <Badge className="absolute top-3 right-3 bg-white/15 text-xs font-body text-white">
            {tech.category}
          </Badge>
          <Image src={tech.icon || "/placeholder.svg"} alt={tech.name} width={30} height={30} quality={100} className="size-16 drop-shadow-lg" />
          <h3 className="text-lg font-semibold text-white text-center">{tech.name}</h3>
        </div>

        {/* back of card */}
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/10 p-5 text-center backdrop-blur-xl backface-hidden border border-white/10 [transform:rotateY(180deg)]">
          <p className="font-body text-sm text-white">{tech.reason}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

const TechStack = () => {
  return (
    <section className="flex w-full bg-black px-5 md:px-10 lg:p-20 py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(255,164,228,0.06),transparent_40%)]" />

      <div className="flex flex-col gap-16 md:gap-20 max-w-screen-8xl w-full mx-auto">
        <motion.div className="flex flex-col items-center gap-4 text-white text-center"
          initial={{ opacity: 0, y: 20 }} viewport={{ once: true }} whileInView={{ opacity: 1, y: 0 }}
        >
          <Badge className="flex items-center gap-2 p-1 px-3 font-body bg-white/15 text-white">
            <Code className="size-3" />
            Tech Stack
          </Badge>
          <h2 className="font-heading text-center text-3xl md:text-4xl">
            The Stack Powering This Project
          </h2>
          <motion.p className="max-w-2xl font-body text-md md:text-lg text-gray-400"
            initial={{ opacity: 0, y: 20 }} viewport={{ once: true }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            Built with modern, efficient, and scalable tools.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 md:gap-16 w-full mx-auto">
          {technologies.map((tech, index) => (
            <motion.div key={tech.name} initial={{ opacity: 0, y: 20 }} viewport={{ once: true }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <TechCard tech={tech} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TechStack

