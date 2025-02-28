"use client"
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Info, PencilLine, Users } from "lucide-react";
import { CREATE_ROOM_URL } from "@/lib/apiEndPoints";
import { Button } from "@workspace/ui/components/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog"
import { FloatingShapes } from "./FloatingShapes";


const HeroSection = ({ userToken }: { userToken: string | null | undefined }) => {
    const router = useRouter();
    const [modalOpen, setModalopen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const createRoom = async () => {
        const { data } = await axios.post(CREATE_ROOM_URL, {}, { headers: { 'Authorization': `Bearer ${userToken}` } });
        if (data.type === 'error') {
            console.log(data.error)
            return;
        }
        const roomSlug = data.data.slug;
        router.push(`/canvas/${roomSlug}`);
    }

    const joinRoom = async () => {
        const roomSlug = inputRef.current?.value.trim();
        if (!roomSlug) inputRef.current?.focus;
        router.push(`/canvas/${roomSlug}`);
    }

    return (
        <section className="flex w-full min-h-[100vh] bg-black">
            <div className="flex flex-col justify-center items-center gap-8 max-w-screen-8xl w-full mx-auto">
                <FloatingShapes />
                <div className="flex flex-col justify-center items-center gap-8 bg-black z-20 rounded-xl">

                    <div className="flex flex-col gap-8 text-xl font-heading font-semibold text-white z-20 ">
                        <span className="font-logo text-8xl font-bold text-center bg-gradient-to-r from-blue-300 to-pink-300 text-transparent bg-clip-text">Doodle</span>
                        Sketch, Collaborate, Innovate - All in One Place.
                    </div>
                    <div className="flex gap-8 z-20">
                        <Button className="flex items-center gap-3 p-6 bg-gray-100 text-black hover:bg-gray-100/90 group" onClick={createRoom}>
                            Start Doodling
                            <PencilLine className="size-3" />
                        </Button>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="flex items-center p-6 w-32 bg-black text-white border border-white" onClick={() => setModalopen((s) => !s)}>
                                    Join Room
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader className="flex flex-col gap-8">
                                    <DialogTitle>Join Room</DialogTitle>
                                    <DialogDescription className="flex flex-col gap-8 text-md">
                                        <span className="flex rounded bg-gray-100 border">
                                            <span className="p-2">
                                                <Users />
                                            </span>
                                            <input ref={inputRef} type="text" name="roomCode" id="" placeholder="Enter Room Code" className="pl-2  w-full h-full outline-none" />
                                        </span>
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

            </div>
        </section>
    );
}

export default HeroSection;