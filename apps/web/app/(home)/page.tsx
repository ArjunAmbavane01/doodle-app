import { getServerSession } from "next-auth";
import { authOptions, ICustomSession } from "../api/auth/[...nextauth]/options";
import LoginModal from "@/components/auth/LoginModal";
import UserDropdown from "@/components/navbar/UserDropdown";
import Navbar from "./_components/Navbar"
import HeroSection from "./_components/HeroSection"
import Collab from "./_components/Collab";
import ShortcutsSection from "./_components/Shortcuts";
import TechStack from "./_components/TechStack";
import Footer from "./_components/Footer";

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