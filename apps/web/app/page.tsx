import { getServerSession } from "next-auth"
import { authOptions, ICustomSession } from "./api/auth/[...nextauth]/options"
import Navbar from "@/components/auth/Navbar"
import MainSection from "@/components/auth/MainSection"

const Page = async () => {
  const session: ICustomSession | null = await getServerSession(authOptions)
  return (

    <div className="w-full h-full">
      <Navbar user={session?.user} />
      <div className="mt-10 mx-auto w-fit">
          HELLO THERE
          Sketch, Collaborate, Innovate - All in One Place.
          <MainSection />
      </div>
    </div>
  )
}

export default Page;