'use client'
import { Button } from "@workspace/ui/components/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog"
import { signIn } from "next-auth/react";
import Image from "next/image";

const LoginModal = () => {
  const handleLogin = () => {signIn("google", { redirect: true })}
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="rounded-full text-xs md:text-md px-3 md:px-5">Get started</Button>
      </DialogTrigger>
      <DialogContent className="rounded-lg">
        <DialogHeader>
          <DialogTitle>Welcome to Doodle</DialogTitle>
          <DialogDescription className="py-5 text-md text-gray-600">
            A collaborative drawing app that lets teams brainstorm, sketch, and share ideas in real time on an interactive canvas.
          </DialogDescription>
        </DialogHeader>
        <Button variant={'outline'} onClick={handleLogin} className="w-[80%] mx-auto">
          <Image src={'/images/logos/google.png'} alt="Google logo" width={100} height={100} className="size-5" />
          Continue with Google
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default LoginModal;