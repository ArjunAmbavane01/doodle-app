'use client'
import { Dispatch, SetStateAction } from "react";
import { signOut } from "next-auth/react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle} from "@workspace/ui/components/alert-dialog"


const LogoutModal = ({ open, setOpen }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>> }) => {
  const handleLogout = () => {
    signOut({
      callbackUrl: "/",
      redirect: true
    })
  }
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="rounded-lg bg-white font-body">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading text-zinc-800">Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-600">
            This action cannot be undone. This will permanently delete your session from your device.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-white border border-slate-200 outline-none text-zinc-800 hover:bg-slate-50 hover:text-zinc-800">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogout} className="bg-red-500 text-white hover:!bg-red-500/85 hover:!text-white">Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default LogoutModal;