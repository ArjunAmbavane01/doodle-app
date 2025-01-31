import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog"
import { getServerSession } from "next-auth"
import { authOptions, ICustomSession } from "./api/auth/[...nextauth]/options"
import LoginModal from "@/components/auth/LoginModal"

const Page = async () => {
  const session: ICustomSession | null = await getServerSession(authOptions)
  return (

    // <Navbar user={session?.user} />
    <div className="flex w-full min-h-svh">
      <div className="max-w-7xl w-full bg-black  mx-auto">
HELLO THERE
      </div>
    </div>
  )
}

export default Page;