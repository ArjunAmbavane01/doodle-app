'use client'
import { Button } from "@workspace/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@workspace/ui/components/dialog"
import { signIn } from "next-auth/react";
import Image from "next/image";

  const handleLogin = () => {
    signIn("google",{
      callbackUrl:"/dashboard",
      redirect:true
    })
  }
const LoginModal = () => {
    return ( 
        <Dialog>
        <DialogTrigger asChild>
            <Button>Get started</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Welcome to Doodle</DialogTitle>
            <DialogDescription>
            A collaborative drawing app that lets teams brainstorm, sketch, and share ideas in real time on an interactive canvas.
            </DialogDescription>
          </DialogHeader>
          <Button variant={'outline'} onClick={handleLogin}>
            <Image src={'/images/google.png'} alt="Google logo" width={25} height={25} />
            Continue with Google
          </Button>
        </DialogContent>
      </Dialog>
      

     );
}
 
export default LoginModal;