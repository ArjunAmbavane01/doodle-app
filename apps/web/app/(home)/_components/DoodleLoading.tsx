'use client'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

const DoodleLoading = () => {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer)
                    return 100
                }
                return prev + 5
            })
        }, 150)

        return () => clearInterval(timer)
    }, [])

    // Array of fun loading messages
    const loadingMessages = [
        "Sharpening pencils...",
        "Mixing colors...",
        "Preparing canvas...",
        "Gathering doodle ideas...",
        "Warming up creativity...",
        "Connecting collaborators..."
    ]

    const messageIndex = Math.min(Math.floor(progress / (100 / loadingMessages.length)), loadingMessages.length - 1)

    return (
        <div className="flex justify-center fixed inset-0 z-50 bg-black">
            <div className="flex flex-col justify-center gap-5 w-80 text-center">
                <motion.div className="font-logo text-5xl font-bold text-center bg-gradient-to-r from-blue-300 to-pink-300 text-transparent bg-clip-text mb-6 whitespace-nowrap overflow-visible"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Doodle
                </motion.div>

                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-purple-400 to-pink-300 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.2 }}
                    />
                </div>

                <div className="flex flex-col gap-3 text-body text-2xl">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={messageIndex}
                            className="text-gray-300 text-lg"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.2 }}
                        >
                            {loadingMessages[messageIndex]}
                        </motion.p>
                    </AnimatePresence>
                    <motion.p className="text-center text-gray-400 text-sm" >
                        {Math.round(progress)}%
                    </motion.p>

                </div>
            </div>
        </div>
    )
}

export default DoodleLoading