"use client"

import { motion } from "motion/react"
import { Sparkles, Users } from "lucide-react"
import Image from "next/image"

const CollabSection = () => {
  return (
    <section className="flex w-full bg-black p-3 md:p-10 lg:p-20 py-24 overflow-hidden">
      <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 justify-center items-center gap-12 max-w-screen-8xl w-full mx-auto relative">
          <motion.div
            className="rounded-2xl border border-white/10 backdrop-blur-sm w-[70%] lg:w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="px-3 md:px-5 py-2 md:py-3 rounded-t-2xl border-b border-white/10 bg-white/5">
              <div className="flex items-center justify-start gap-2 md:gap-3">
                  <div className="size-2 md:size-3 rounded-full bg-red-500" />
                  <div className="size-2 md:size-3 rounded-full bg-yellow-500" />
                  <div className="size-2 md:size-3 rounded-full bg-green-500" />
              </div>
            </div>
            <div className="aspect-[16/9] p-3 md:p-5 relative group">
              <div className="flex items-center justify-center h-full rounded-lg border border-dashed border-white/20 relative overflow-hidden">
                <Image src={"/images/appDemo.png"} alt="Canvas App Demo"
                  className="rounded-lg transition-transform duration-700 group-hover:scale-105"
                  layout="fill" quality={100} priority 
                />
                <motion.div className="absolute inset-0 rounded-full bg-white blur-3xl size-24 m-auto opacity-20"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2], rotate: [0, 360],}}
                  transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
                />
              </div>

              <motion.div className="absolute -right-4 top-10 bg-white/10 backdrop-blur-md rounded sm:rounded-lg p-1 lg:p-3 border border-white/20"
                animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              >
                <Users className="size-4 sm:size-5 text-white" />
              </motion.div>

              <motion.div className="absolute -left-4 bottom-10 bg-white/10 backdrop-blur-md rounded sm:rounded-lg p-1 lg:p-3 border border-white/20"
                animate={{ y: [0, 10, 0] }} transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
              >
                <Sparkles className="size-4 sm:size-5 text-white" />
              </motion.div>
            </div>
          </motion.div>

        <motion.div className="flex flex-col items-start gap-10 p-5 lg:pl-10 text-white"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        >
          <h2 className="font-heading text-3xl md:text-4xl leading-tight mx-auto lg:mx-0 text-center lg:text-left">
            Real-Time Collaboration
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
              Made Simple
            </span>
          </h2>
          <p className=" max-w-[550px] font-body text-md md:text-lg tracking-wide text-white/80 text-center lg:text-left">
            A powerful whiteboarding tool that brings your team's ideas to life. Sketch, design, and collaborate in
            real-time—all in one seamless experience.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default CollabSection

