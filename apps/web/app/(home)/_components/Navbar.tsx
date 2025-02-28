import Image from "next/image";

const Navbar = async ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="fixed top-8 inset-x-0 flex justify-between items-center w-[40%] mx-auto p-2 px-10 border bg-white backdrop-blur-sm rounded-full z-40">
            <div className="flex items-center gap-3 font-logo font-bold text-2xl text-black">
                <Image src={'/images/logos/doodle-logo.png'} alt="Doodle logo" width={100} height={100} className="size-5" />
                Doodle
            </div>
            <div className="flex items-center justify-center gap-3">
                <a href={'https://github.com/ArjunAmbavane01/doodle-app'} target="_blank" className="p-3 rounded hover:bg-gray-100 transition-colors duration-300">
                    <Image src={'/images/logos/github.png'} alt="github-logo" width={100} height={100} className="size-5" />
                </a>
                {children}
            </div>
        </div>
    );
}

export default Navbar;