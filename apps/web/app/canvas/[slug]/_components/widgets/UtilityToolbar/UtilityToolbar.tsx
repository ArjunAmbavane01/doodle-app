"use client"

import { useState } from "react";
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation'
import CollaboratorMenu from "./CollabPanel";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@workspace/ui/components/alert-dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover"
import { Button } from "@workspace/ui/components/button";
import { Users } from "lucide-react";

const UtilityToolbar = ({ sessionId, socket }: { sessionId: string, socket: WebSocket }) => {

    const router = useRouter()

    const [openCollaborators, setOpenCollaborators] = useState(false);
    const [animateJoin, setAnimatejoin] = useState(false);

    const leaveRoom = () => {
        socket.send(JSON.stringify({ type: 'leave_room' }));
        router.push('/');
    }

    return (
        <div className="flex gap-2 fixed bottom-7 sm:bottom-auto sm:top-6 right-5 z-10 font-heading">
            <Popover open={openCollaborators} onOpenChange={setOpenCollaborators}>
                <PopoverTrigger>
                    <motion.div
                        className="flex justify-center items-center gap-2 rounded bg-white text-zinc-800 hover:bg-white/90 hover:text-zinc-800 size-full p-2 px-3 text-sm relative"
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
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" className="p-2 rounded bg-red-500 text-white border-none hover:text-white hover:bg-red-600">Leave Room</Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader className="flex flex-col gap-">
                        <AlertDialogTitle className="font-heading text-lg text-zinc-800">Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription className="font-body text-base text-zinc-800">
                            You will be disconnected from this session. You can rejoin later with the session link if it&apos;s still active.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel asChild><Button variant={'outline'} className="bg-white shadow-xl hover:bg-gray-100/80 hover:text-black border-gray-300 text-black">Cancel</Button></AlertDialogCancel>
                        <AlertDialogAction onClick={leaveRoom} className="bg-red-500 text-white border-none hover:text-white hover:bg-red-600">Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default UtilityToolbar;