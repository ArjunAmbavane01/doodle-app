"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image";
import { motion } from "framer-motion"
import { cn } from "@workspace/ui/lib/utils";

function useScreenSize() {
    const [screenSize, setScreenSize] = useState('desktop');

    useEffect(() => {
        const updateScreenSize = () => {
            if (window.innerWidth < 640) {
                setScreenSize('mobile');
            } else {
                setScreenSize('desktop');
            }
        };

        updateScreenSize();
        window.addEventListener('resize', updateScreenSize);
        return () => window.removeEventListener('resize', updateScreenSize);
    }, []);

    return screenSize;
}

interface Technology {
    name: string
    icon: React.ReactNode
    color: string
    animation: {
        y: number[]
        duration: number
        delay: number
    }
    position: {
        desktop: {
            left: string
            top: string
        }
        mobile?: {
            left: string
            top: string
        }
    }
}

const technologies: Technology[] = [
    {
        name: "Next.js",
        icon: <span className="text-lg sm:text-2xl">▲</span>,
        color: "bg-zinc-800 text-white",
        animation: {
            y: [0, -15, 0],
            duration: 4,
            delay: 0,
        },
        position: {
            desktop: {
                left: "20%",
                top: "35%",
            },
            mobile: {
                left: "10%",
                top: "10%",
            }
        },
    },
    {
        name: "TypeScript",
        icon: <span className="text-lg sm:text-2xl">TS</span>,
        color: "bg-blue-100 text-blue-800",
        animation: {
            y: [0, -20, 0],
            duration: 5,
            delay: 1,
        },
        position: {
            desktop: {
                left: "60%",
                top: "24%",
            },
            mobile: {
                left: "65%",
                top: "20%",
            }
        },
    },
    {
        name: "Tailwind CSS",
        icon: <Image src={'/images/logos/tailwind.png'} alt={'tailwind'} width={12} height={12} quality={100} className="size-4 sm:size-6"></Image>,
        color: "bg-teal-100 text-teal-800",
        animation: {
            y: [0, -12, 0],
            duration: 4.5,
            delay: 0.5,
        },
        position: {
            desktop: {
                left: "16%",
                top: "72%",
            },
            mobile: {
                left: "5%",
                top: "40%",
            }
        },
    },
    {
        name: "PostgreSQL",
        icon: <Image src={'/images/logos/postgresql.png'} alt={'postgres'} width={12} height={12} quality={100} className="size-4 sm:size-6"></Image>,
        color: "bg-[#336791] text-blue-800",
        animation: {
            y: [0, -18, 0],
            duration: 6,
            delay: 2,
        },
        position: {
            desktop: {
                left: "34%",
                top: "64%",
            },

            mobile: {
                left: "40%",
                top: "60%",
            }
        },
    },
    {
        name: "Prisma",
        icon: <span className="text-lg sm:text-2xl">◭</span>,
        color: "bg-[#187367] text-white",
        animation: {
            y: [0, -15, 0],
            duration: 5.5,
            delay: 1.5,
        },
        position: {
            desktop: {
                left: "71%",
                top: "15%",
            },
            mobile: {
                left: "70%",
                top: "45%",
            }
        },
    },
    {
        name: "Express",
        icon: <Image src={'/images/logos/express.png'} alt={'express'} width={12} height={12} quality={100} className="size-4 sm:size-6"></Image>,
        color: "bg-white",
        animation: {
            y: [0, -10, 0],
            duration: 3.5,
            delay: 0.7,
        },
        position: {
            desktop: {
                left: "70%",
                top: "55%",
            },
            mobile: {
                left: "40%",
                top: "30%",
            }
        },
    },
    {
        name: "Web Sockets",
        icon: <Image src={'/images/logos/websocket.png'} alt={'web sockets'} width={12} height={12} quality={100} className="size-4 sm:size-6"></Image>,
        color: "bg-orange-500 text-white",
        animation: {
            y: [0, -10, 0],
            duration: 3.5,
            delay: 0.7,
        },
        position: {
            desktop: {
                left: "30%",
                top: "10%",
            },
            mobile: {
                left: "70%",
                top: "75%",
            }
        },
    },
    {
        name: "Redis",
        icon: <Image src={'/images/logos/redis.png'} alt={'redis'} width={12} height={12} quality={100} className="size-4 sm:size-6"></Image>,
        color: "bg-red-300 text-red-800",
        animation: {
            y: [0, -15, 0],
            duration: 5,
            delay: 2.2,
        },
        position: {
            desktop: {
                left: "50%",
                top: "0%",
            },
            mobile: {
                left: "30%",
                top: "85%",
            }
        },
    },
    {
        name: "Docker",
        icon: <span className="text-lg sm:text-2xl">🐳</span>,
        color: "bg-[#1d63ed] text-blue-800",
        animation: {
            y: [0, -15, 0],
            duration: 4.8,
            delay: 1.8,
        },
        position: {
            desktop: {
                left: "60%",
                top: "80%",
            },
            mobile: {
                left: "8%",
                top: "70%",
            }
        },
    },
]

export default function TechStackShowcase() {
    const screenSize = useScreenSize();

    const getPosition = (tech: Technology) => {
        if (screenSize === 'mobile' && tech.position.mobile) return tech.position.mobile;
        return tech.position.desktop;
    };

    return (
        <div className="w-full p-5 md:p-10 lg:p-20 bg-black overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(255,164,228,0.06),transparent_30%)] z-10" />

            <div className="flex flex-col gap-16 w-full h-[500px] max-w-screen-8xl mx-auto relative">

                <div className="relative flex h-[50rem] w-full items-center justify-center bg-white dark:bg-black z-5">
                    <div
                        className={cn(
                            "absolute inset-0",
                            "[background-size:40px_40px]",
                            "[background-image:linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)]",
                            "dark:[background-image:linear-gradient(to_right,#3a3a3a_1px,transparent_1px),linear-gradient(to_bottom,#3a3a3a_1px,transparent_1px)]",
                        )}
                    />

                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute inset-0 bg-white dark:bg-black [mask-image:radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_40%,rgba(0,0,0,0.7)_70%,black_100%)]"></div>

                        <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white dark:from-black dark:via-transparent dark:to-black opacity-80"></div>

                        <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white dark:from-black dark:via-transparent dark:to-black opacity-80"></div>
                    </div>

                    <p className="relative z-20 bg-gradient-to-b from-white via-neutral-300 to-neutral-500 bg-clip-text py-4 sm:py-6 md:py-8 text-3xl sm:text-5xl md:text-7xl font-bold text-transparent">
                        Tech Stack
                    </p>
                </div>

                <div className="absolute inset-0 z-20">
                    {technologies.map((tech, index) => (
                        <div key={tech.name} className="absolute transition-all duration-500" style={{ left: getPosition(tech).left, top: getPosition(tech).top }}>
                            <motion.div className="relative"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0, transition: { delay: index * 0.2, duration: 0.6 } }}
                            >
                                <motion.div className="flex flex-col items-center"
                                    whileHover="hovered"
                                    initial="initial"
                                    animate={{ y: tech.animation.y }}
                                    transition={{
                                        duration: tech.animation.duration,
                                        repeat: Number.POSITIVE_INFINITY,
                                        repeatType: "reverse",
                                        ease: "easeInOut",
                                        delay: tech.animation.delay,
                                    }}
                                >
                                    <motion.div className={`flex items-center justify-center size-10 sm:size-14 md:size-16 ${tech.color} rounded-xl sm:rounded-2xl text-lg sm:text-xl font-bold mb-2 sm:mb-3 shadow-lg sm:shadow-xl shadow-blue-500/30`}
                                        whileHover={{ scale: 1.1, rotate: [0, -5, 5, -5, 0] }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        {tech.icon}
                                    </motion.div>
                                    <motion.div className="bg-black/10 text-white border border-white px-3 py-1 rounded-full"
                                        variants={{
                                            initial: { opacity: 0, y: -10 },
                                            hovered: { opacity: 1, y: 0 },
                                        }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <p className="text-xs">{tech.name}</p>
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    )
}