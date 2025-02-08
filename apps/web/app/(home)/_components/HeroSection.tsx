'use client'
import { CREATE_ROOM_URL } from "@/lib/apiEndPoints";
import { Button } from "@workspace/ui/components/button";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Info, PencilLine, Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog"

import { useRef, useState } from "react";

const HeroSection = ({ userToken }: { userToken: string | null | undefined }) => {
    console.log(userToken)
    const router = useRouter();
    const [modalOpen, setModalopen] = useState(false);
    const roomRef = useRef<HTMLInputElement>(null);

    const createRoom = async () => {
        const { data } = await axios.post(CREATE_ROOM_URL, {}, { headers: { 'Authorization': `Bearer ${userToken}` } });
        if (data.type === 'error') {
            console.log(data.error)
            return
        }
        const roomSlug = data.data.slug;
        router.push(`/canvas/${roomSlug}`);
    }
    const joinRoom = async () => {
        const roomSlug = roomRef.current?.value.trim();
        if(!roomSlug) roomRef.current?.focus;
        router.push(`/canvas/${roomSlug}`);
    }
    return (
        <section className="flex w-full">
            <div className="flex flex-col gap-10 justify-center items-center max-w-screen-8xl w-full h-[90svh] mx-auto">
                <div className="flex flex-col gap-5 text-xl font-heading font-semibold">
                    <span className="font-logo text-7xl font-bold text-center">Doodle</span>
                    Sketch, Collaborate, Innovate - All in One Place.
                </div>
                <div className="flex gap-5">
                    <Button className="flex items-center gap-3 p-5" onClick={createRoom}>
                        Start Doodling
                        <PencilLine className="size-3" />
                    </Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant={'outline'} className="flex items-center p-5" onClick={() => setModalopen((s) => !s)}>
                                join a room
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Join Room</DialogTitle>
                                <DialogDescription className="flex flex-col gap-8 pt-10 text-md">
                                    <div className="flex rounded bg-gray-100 border">
                                        <div className="p-2">
                                            <Users />
                                        </div>
                                        <input ref={roomRef} type="text" name="roomCode" id="" placeholder="Enter Room Code" className="pl-2  w-full h-10 outline-none" />

                                    </div>
                                    <Button className="flex items-center gap-3 p-5" onClick={joinRoom}>
                                       join Room
                                    </Button>

                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="flex gap-3 text-sm p-2 rounded bg-gray-200  text-black">
                                <Info />Don't have a room code? Ask your team member to share it with you or create a new room.
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </section>
    );
}

export default HeroSection;