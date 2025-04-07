'use client'
import { signIn } from "next-auth/react";
import Image from "next/image";
import { Button } from "@workspace/ui/components/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog"

const LoginModal = () => {
  const handleLogin = () => {signIn("google", { redirect: true, callbackUrl: '/' })}
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="rounded-full text-xs md:text-md px-3 md:px-5 bg-blue-200 border-blue-400 text-zinc-800 border hover:bg-blue-100 transition-colors duration-200">
        Get Started
        </Button>
        
      </DialogTrigger>
      <DialogContent className="rounded-lg bg-white">
        <DialogHeader>
          <DialogTitle className="text-zinc-800 font-heading">Welcome to Doodle</DialogTitle>
          <DialogDescription className="py-5 text-md text-zinc-600 font-body">
            A collaborative drawing app that lets teams brainstorm, sketch, and share ideas in real time on an interactive canvas.
          </DialogDescription>
        </DialogHeader>
        <Button variant={'outline'} onClick={handleLogin} className="w-[80%] mx-auto bg-blue-100 border-blue-400 text-zinc-800 hover:bg-blue-50 hover:text-zinc-800 transition-colors duration-200">
          <Image src={'/images/logos/google.png'} alt="Google logo" width={100} height={100} className="size-5" />
          Continue with Google
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default LoginModal;