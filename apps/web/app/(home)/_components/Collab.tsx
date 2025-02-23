'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { useEffect, useState } from "react";
import { motion } from "motion/react"
import Image from "next/image";

const Collab = () => {
    const [activeUsers, setActiveUsers] = useState(5)

    useEffect(() => {
        const interval = setInterval(() => {
          setActiveUsers((prev) => (prev % 8) + 1)
        }, 3000)
        return () => clearInterval(interval)
      }, [])

    return (
        <section className="flex w-full p-20 py-24 bg-black">
            <div className="grid grid-cols-2 items-center gap-8 max-w-screen-8xl w-full mx-auto text-white">
                <div className="flex flex-col gap-8">

                    <div className="text-4xl font-bold font-heading">Watch Ideas Flow in Real-Time</div>
                    <div className="text-xl font-body">See your team's creativity unfold live as they sketch, annotate, and brainstorm together.</div>
                    <div className="flex items-center gap-4">
                    <div className="flex -space-x-4">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: i < activeUsers ? 1 : 0.3,
                      scale: i < activeUsers ? 1 : 0.8,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <Avatar className="border-2 border-black ring-2 ring-purple-500/20">
                      <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                      <AvatarFallback>U{i + 1}</AvatarFallback>
                    </Avatar>
                  </motion.div>
                ))}
              </div>
              <Badge variant="default">
                {activeUsers} active now
              </Badge>
            </div>
                </div>
                <div className="flex justify-center items-center">
                    <div className="relative bg-white size-96 rounded-lg">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 blur-3xl" />
                    </div>
                </div>

            </div>

        </section>
    );
}

export default Collab;