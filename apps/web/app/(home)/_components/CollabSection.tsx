"use client"

import { motion } from "motion/react"
import Image from "next/image"

const CollabSection = () => {
  return (
    <section className="flex w-full bg-black pb-8 sm:pb-12 md:pb-24 -mt-20 sm:-mt-28">
      <div className="flex flex-col lg:grid lg:grid-cols-1 justify-center items-center gap-3 max-w-screen-8xl w-full mx-auto relative">
        <motion.div
          className="w-[90%] lg:w-[70%] mx-auto rounded-xl border-t-2 border-white/20 backdrop-blur-sm relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="absolute inset-x-0 bottom-0 h-[60%] md:h-[70%] z-10 bg-gradient-to-t from-black via-black/80 to black/80" />

          <div className="aspect-[16/9] p-3 md:p-1 relative">
            <div className="flex items-center justify-center h-full rounded-lg relative overflow-hidden">
              <Image src={"/images/demo.png"}
                alt="Canvas App Demo"
                className="rounded-lg transition-transform duration-700"
                layout="fill"
                quality={100} priority
              />
              <motion.div className="absolute inset-0 rounded-full bg-white blur-3xl size-24 m-auto opacity-20"
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2], rotate: [0, 360], }}
                transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
              />
            </div>

          </div>
        </motion.div>

        <motion.div className="flex flex-col items-center gap-8 md:gap-14 text-white -mt-5 text-center px-3 sm:px-0"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        >
          <h2 className="flex flex-col items-center justify-center gap-1 md:gap-3 font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl mx-auto">
            <span>Real-Time Collaboration</span>
            <span className="bg-gradient-to-r from-blue-200 via-[#69e3ff] to-[#5eaff1f3] bg-clip-text text-transparent font-semibold">
              Made Simple
            </span>
          </h2>
          <p className="px-3 max-w-md md:max-w-2xl font-body text-sm md:text-base lg:text-lg tracking-wide text-gray-200 text-center">
            A powerful whiteboarding tool that brings your team&apos;s ideas to life. Sketch, design, and collaborate in
            real-time—all in one seamless experience.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default CollabSection

