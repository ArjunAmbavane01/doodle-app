"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"

export default function LoadingScreen() {
    const [progress, setProgress] = useState(0)
    const [isComplete, setIsComplete] = useState(false)

    // Progress simulation
    useEffect(() => {
        let timer: NodeJS.Timeout

        const simulateProgress = () => {
            timer = setTimeout(() => {
                setProgress((prev) => {
                    // Slow down progress as it approaches 100%
                    const increment = prev < 70 ? 2 : prev < 90 ? 1 : 0.5
                    const nextProgress = prev + increment

                    if (nextProgress >= 100) {
                        clearTimeout(timer)
                        setTimeout(() => setIsComplete(true), 500)
                        return 100
                    }

                    simulateProgress()
                    return nextProgress
                })
            }, 80)
        }

        simulateProgress()

        return () => {
            clearTimeout(timer)
        }
    }, [])

    const loadingMessages = [
        "Preparing your canvas...",
        "Sharpening virtual pencils...",
        "Loading creative tools...",
        "Connecting collaborators...",
        "Almost ready to doodle...",
    ]

    const messageIndex = Math.min(Math.floor(progress / (100 / loadingMessages.length)), loadingMessages.length - 1)

    return (
        <div className="flex flex-col items-center justify-center gap-5 fixed inset-0 z-50 bg-black">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <span className="font-logo text-5xl font-bold text-center bg-gradient-to-r from-blue-300 to-pink-300 text-transparent bg-clip-text -translate-x-3">Doodle</span>
            </motion.div>

            <div className="w-64 h-1 bg-gray-800 rounded-full mb-6 overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-purple-400 to-pink-300 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.2 }}
                />
            </div>

            <div className="flex flex-col gap-3">

                <AnimatePresence mode="wait">
                    <motion.p
                        key={messageIndex}
                        className="text-gray-300 text-sm"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                    >
                        {loadingMessages[messageIndex]}
                    </motion.p>
                </AnimatePresence>
                <motion.p className="text-center text-gray-400 text-xs" animate={{ opacity: isComplete ? 0 : 1 }}>
                    {Math.round(progress)}%
                </motion.p>

            </div>
        </div>
    )
}

