"use client"

import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@workspace/ui/components/alert-dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover"
import { Button } from "@workspace/ui/components/button";
import CollaboratorMenu from "./CollabPanel";
import { Plus, Users } from "lucide-react";

const UtilityToolbar = () => {

    const [openCollaborators, setOpenCollaborators] = useState(false);

    return (
        <div className="flex gap-2 fixed bottom-7 sm:bottom-auto sm:top-7 right-5 z-10 font-body">

            <Popover open={openCollaborators} onOpenChange={setOpenCollaborators}>
                <PopoverTrigger className="flex justify-center items-center gap-2 rounded bg-white text-black p-3 py-1 w-fit text-sm">
                    <Users className="size-4" onClick={() => setOpenCollaborators(true)} />
                </PopoverTrigger>
                <PopoverContent className="p-0"><CollaboratorMenu setOpen={setOpenCollaborators} /></PopoverContent>
            </Popover>
           
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" className="rounded"><Plus className="size-4" /> New Canvas</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            account and remove your data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default UtilityToolbar;