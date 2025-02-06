import Navbar from "./_components/Navbar"
import HeroSection from "./_components/HeroSection"
import AppDemo from "./_components/AppDemo";
import Collab from "./_components/Collab";

const Page = async () => {
  return (
    <>
      <Navbar />
      <HeroSection />
      <AppDemo />
      <Collab />
    </>
  )
}

export default Page;