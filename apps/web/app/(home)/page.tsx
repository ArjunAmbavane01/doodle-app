import Navbar from "./_components/Navbar"
import HeroSection from "./_components/HeroSection"
import Collab from "./_components/Collab";
import { authOptions, ICustomSession } from "../api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import UserDropdown from "@/components/navbar/UserDropdown";
import LoginModal from "@/components/auth/LoginModal";
import ShortcutsSection from "./_components/Shortcuts";
import Footer from "./_components/Footer";
import TechStack from "./_components/TechStack";


// ADD BUILT USING THESE TOOLS SECTION

const Page = async () => {
  const session: ICustomSession | null = await getServerSession(authOptions);

  return (
    <>
      <Navbar>
        {session?.user ? <UserDropdown user={session?.user} /> : <LoginModal />}
      </Navbar>
      <HeroSection userToken={session?.user?.token} />
      <Collab />
      <ShortcutsSection />
      <TechStack />
      <Footer />
    </>
  )
}

export default Page;