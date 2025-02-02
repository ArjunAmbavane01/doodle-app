'use client'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@workspace/ui/components/alert-dialog"
import { signOut } from "next-auth/react";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";

  const handleLogout = () => {
    signOut({
      callbackUrl:"/",
      redirect:true
    })
  }
const LogoutModal = ({open,setOpen}:{open:boolean,setOpen:Dispatch<SetStateAction<boolean>>}) => {

    return ( 
        <AlertDialog open={open} onOpenChange={setOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete your session from your device.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleLogout}>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

      

     );
}
 
export default LogoutModal;