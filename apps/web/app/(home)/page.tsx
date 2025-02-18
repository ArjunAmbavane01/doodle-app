import Navbar from "./_components/Navbar"
import HeroSection from "./_components/HeroSection"
import AppDemo from "./_components/AppDemo";
import Collab from "./_components/Collab";
import { authOptions, ICustomSession } from "../api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import UserDropdown from "@/components/navbar/UserDropdown";
import LoginModal from "@/components/auth/LoginModal";
import ShortcutsSection from "./_components/Shortcuts";
import Footer from "./_components/Footer";

const Page = async () => {
  const session: ICustomSession | null = await getServerSession(authOptions);

  return (
    <>
      <Navbar>
        {session?.user ? <UserDropdown user={session?.user} /> : <LoginModal />}
      </Navbar>
      <HeroSection userToken={session?.user?.token} />
      <AppDemo />
      <Collab />
      <ShortcutsSection />
      <Footer />
    </>
  )
}

export default Page;