import { getServerSession } from "next-auth";
import { authOptions, ICustomSession } from "../api/auth/[...nextauth]/options";
import LoginModal from "@/components/auth/LoginModal";
import UserDropdown from "@/components/navbar/UserDropdown";
import Navbar from "./_components/Navbar"
import HeroSection from "./_components/HeroSection"
import CollabSection from "./_components/CollabSection";
import ShortcutsSection from "./_components/Shortcuts";
import Footer from "./_components/Footer";
import TechStack from "./_components/TechStack";

const Page = async () => {
  const session: ICustomSession | null = await getServerSession(authOptions);
  return (
    <>
      <Navbar>
        {session?.user ? <UserDropdown user={session.user} /> : <LoginModal />}
      </Navbar>
      <HeroSection userToken={session?.user?.token ?? ""} />
      <CollabSection />
      <ShortcutsSection />
      <TechStack />
      <Footer />
    </>
  )
}

export default Page;