"use client"

import { Button } from "@workspace/ui/components/button";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap"


const Navbar = ({ children }: { children: React.ReactNode }) => {
    const navRef = useRef<HTMLElement>(null)


    useEffect(() => {
        gsap.from(navRef.current, {
            y: -20,
            opacity: 0,
            duration: 1,
            ease: "power2.out",
        })
    }, [])
    return (
        <>
            {/* <section className="flex w-full p-20 py-5 fixed top-5 inset-x-0 z-40">
                <div className="flex justify-between items-center w-full max-w-[500px] xl:max-w-[600px] mx-auto p-1 px-5 xl:p-2 xl:px-10 border bg-white backdrop-blur-sm rounded-full z-40">
                    <div className="flex items-center gap-2 md:gap-3 font-logo font-bold text-xl md:text-2xl text-black">
                        <Image src={'/images/logos/doodle-logo.png'} alt="Doodle logo" width={100} height={100} className="size-4 md:size-5" />
                        Doodle
                    </div>
                    <div className="flex items-center justify-center gap-2 md:gap-3">
                        <a href={'https://github.com/ArjunAmbavane01/doodle-app'} target="_blank" className="p-3 rounded hover:bg-gray-100 transition-colors duration-300">
                            <Image src={'/images/logos/github.png'} alt="github-logo" width={100} height={100} className="size-5" />
                        </a>
                        {children}
                    </div>
                </div>
            </section> */}
            <nav ref={navRef} className="flex justify-between items-center absolute top-0 left-0 right-0 p-8 px-10 z-50">
                <div className="text-white font-bold font-heading text-2xl">
                    {/* <Image src={'/images/logos/doodle-logo.png'} alt="Doodle logo" width={100} height={100} className="size-4 md:size-5" /> */}
                    Doodle
                </div>
                <div className="hidden md:flex gap-5">
                    <Link href="#" className="text-white/70 hover:text-white text-sm">
                        Tools
                    </Link>
                    <Link href="#" className="text-white/70 hover:text-white text-sm">
                        About
                    </Link>
                    <Link href="#" className="text-white/70 hover:text-white text-sm">
                        Showcase
                    </Link>
                    <Link href="#" className="text-white/70 hover:text-white text-sm">
                        Community
                    </Link>

                    <Link href="#" className="text-white/70 hover:text-white text-sm">
                        Docs
                    </Link>
                </div>
                <Button className="bg-white text-black hover:bg-white/90 rounded-full text-sm px-4">
                    {/* {children} */}
                    Get Started
                </Button>
            </nav>
        </>
    );
}

export default Navbar;