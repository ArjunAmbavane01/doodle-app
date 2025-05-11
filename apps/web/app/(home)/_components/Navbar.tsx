"use client"

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";

const Navbar = ({ children }: { children: React.ReactNode }) => {
    const navRef = useRef<HTMLElement>(null)

    return (
        <>
            <section className="flex w-full sticky top-0 inset-x-0 backdrop-blur-sm z-40">

                <nav ref={navRef} className="flex justify-between items-center h-14 md:h-20 w-full max-w-screen-8xl mx-auto p-5 px-5 sm:px-8 md:px-16">
                    <div className="flex items-center gap-2 md:gap-3 font-logo font-bold text-xl md:text-3xl text-white">
                        <Link href={'/'}>
                            Doodle
                        </Link>
                    </div>
                    <div className="flex items-center justify-center gap-2 md:gap-3">
                        {children}
                        <a href={'https://github.com/ArjunAmbavane01/doodle-app'} target="_blank" rel="noreferrer" className="p-2 bg-white drop-shadow-lg shadow-sm shadow-blue-800 text-white rounded-full hover:bg-gray-100 transition-colors duration-300">
                            <Image src={'/images/logos/github.png'} alt="github-logo" width={100} height={100} className="size-4 md:size-5" />
                        </a>
                    </div>

                </nav>
            </section>

        </>
    );
}

export default Navbar;