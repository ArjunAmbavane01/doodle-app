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
            <nav ref={navRef} className="flex justify-between items-center absolute top-0 left-0 right-0 p-5 px-16 z-50">
                <div className="flex text-white font-bold font-heading text-2xl">
                    Doodle
                </div>
                <div className="flex items-center justify-center gap-2 md:gap-3">
                    {children}
                    <a href={'https://github.com/ArjunAmbavane01/doodle-app'} target="_blank" className="p-1 bg-white border-white border text-white rounded-full hover:bg-gray-100 transition-colors duration-300">
                        <Image src={'/images/logos/github.png'} alt="github-logo" width={100} height={100} className="size-5" />
                    </a>
                </div>

            </nav>
        </>
    );
}

export default Navbar;