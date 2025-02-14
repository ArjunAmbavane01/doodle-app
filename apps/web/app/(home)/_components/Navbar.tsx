import Image from "next/image";
import Link from "next/link";

const Navbar = async ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="fixed top-8 inset-x-0 flex justify-between items-center w-[40%] mx-auto p-3 px-10 border backdrop-blur-sm shadow-md rounded-full z-50">
            <div className="flex items-center gap-3 font-logo font-bold text-2xl">
                <Image src={'/images/logos/doodle-logo.png'} alt="Doodle logo" width={100} height={100} className="size-5" />
                Doodle
            </div>
            <div className="flex items-center gap-3">
                <Link href={'https://github.com/ArjunAmbavane01/doodle-app'} prefetch={false} className="p-3 rounded hover:bg-gray-100 transition-colors duration-300">
                    <Image src={'/images/logos/github-outline.png'} alt="github-logo" width={100} height={100} className="size-5" />
                </Link>
                {children}
            </div>
        </div>
    );
}

export default Navbar;