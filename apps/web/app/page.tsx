import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog"
import { getServerSession } from "next-auth"
import { authOptions, ICustomSession } from "./api/auth/[...nextauth]/options"
import LoginModal from "@/components/auth/LoginModal"

const Page = async () => {
  const session: ICustomSession | null = await getServerSession(authOptions)
  return (

    <>
    {/* <Navbar user={session?.user} /> */}
    <LoginModal />
    <div className="flex w-full min-h-svh">
      <div className="max-w-screen-8xl w-full bg-black  mx-auto">
HELLO THERE
Sketch, Collaborate, Innovate - All in One Place.
      </div>
    </div></>
  )
}

export default Page;