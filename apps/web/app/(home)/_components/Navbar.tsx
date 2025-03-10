import Image from "next/image";

const Navbar = async ({ children }: { children: React.ReactNode }) => {
    return (
        <section className="flex w-full p-20 py-5 fixed top-5 xl:top-8 inset-x-0 z-40">
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
        </section>
    );
}

export default Navbar;