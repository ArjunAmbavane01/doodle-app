"use client"

import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@workspace/ui/components/alert-dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover"
import { Button } from "@workspace/ui/components/button";
import CollaboratorMenu from "./CollabPanel";
import { motion } from 'motion/react';
import { Plus, Users } from "lucide-react";

const UtilityToolbar = ({ sessionId }: { sessionId: string }) => {

    const [openCollaborators, setOpenCollaborators] = useState(false);
    const [animateJoin, setAnimatejoin] = useState(false);

    return (
        <div className="flex gap-2 fixed bottom-7 sm:bottom-auto sm:top-5 right-5 z-10 font-heading">

            <Popover open={openCollaborators} onOpenChange={setOpenCollaborators}>
                <PopoverTrigger>
                    <motion.div
                        className="flex justify-center items-center gap-2 rounded bg-white text-black size-full p-2 px-3 text-sm relative"
                        animate={animateJoin
                            ? {
                                scale: [1, 1.1, 1],
                                boxShadow: ["0px 0px 0px rgba(59, 130, 246, 0)", "0px 0px 8px rgba(219, 234, 254, 0.6)", "0px 0px 0px rgba(59, 130, 246, 0)",],
                            } : {}
                        }
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        onClick={() => setOpenCollaborators(true)}
                    >

                        <Users className="size-4" />
                        {animateJoin && (
                            <motion.span
                                className="absolute -top-1 -right-1 size-3 bg-green-500 rounded-full"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.9 }}
                            />
                        )}
                    </motion.div>
                </PopoverTrigger>
                <PopoverContent className="p-0 mt-2 bg-transparent border-none">
                    <CollaboratorMenu
                        sessionId={sessionId}
                        setOpen={setOpenCollaborators}
                        onCollaboratorJoin={() => {
                            setAnimatejoin(true);
                            setTimeout(() => setAnimatejoin(false), 2000);
                        }} />
                </PopoverContent>
            </Popover>
            <Button variant="outline" className="rounded"><Plus className="size-4" /> New Canvas</Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" className="p-2 rounded bg-red-500 text-white border-none hover:text-white hover:bg-red-500/80"> Clear Canvas</Button>
                    {/* <Button variant="outline" className="rounded"><Plus className="size-4" /> New Canvas</Button> */}
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