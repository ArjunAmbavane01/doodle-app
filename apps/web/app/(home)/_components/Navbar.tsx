import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import LoginModal from "@/components/auth/LoginModal";
import { authOptions, ICustomSession } from "@/app/api/auth/[...nextauth]/options";
import UserDropdown from "@/components/navbar/UserDropdown";



const Navbar = async () => {
    const session: ICustomSession | null = await getServerSession(authOptions);
    return (
        <div className="fixed top-8 inset-x-0 flex justify-between items-center w-[30%] mx-auto p-3 px-5 border rounded-lg">
            <div className="flex items-center gap-3">
            <Image src={'/images/logos/doodle-logo.png'} alt="Doodle logo" width={100} height={100} className="size-5" />
            Doodle
            </div>
            <div className="flex items-center gap-3">
                <Link href={'https://github.com/ArjunAmbavane01/doodle-app'} prefetch={false} className="p-3 rounded hover:bg-gray-100 transition-colors duration-300">
                    <Image src={'/images/logos/github-outline.png'} alt="github-logo" width={100} height={100} className="size-5" />
                </Link>
                {session?.user ?
                   <UserDropdown user={session?.user} />
                    : <LoginModal />}
            </div>
        </div>
    );
}

export default Navbar;