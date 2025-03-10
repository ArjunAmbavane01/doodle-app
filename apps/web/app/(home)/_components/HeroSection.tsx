"use client"
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Info, PencilLine, Users } from "lucide-react";
import { CREATE_ROOM_URL } from "@/lib/apiEndPoints";
import { Button } from "@workspace/ui/components/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog"
import { useLoading } from "@/providers/LoadingProvider";
import { FloatingShapes } from "./FloatingShapes";

const HeroSection = ({ userToken }: { userToken: string | null | undefined }) => {
    const router = useRouter();
    const {setIsLoading} = useLoading();
    const inputRef = useRef<HTMLInputElement>(null);
    const [modalOpen, setModalopen] = useState(false);

    const createRoom = async () => {
        try {
            setIsLoading(true);
            const { data } = await axios.post(CREATE_ROOM_URL, {}, { headers: { 'Authorization': `Bearer ${userToken}` } });
            if (data.type === 'error') {
                console.log(data.error);
                setIsLoading(false);
                return;
            }
            router.push(`/canvas/${data.data.slug}`);
        } catch (error) {
            console.error("Error creating room:", error);
            setIsLoading(false);
        }
    }

    const joinRoom = async () => {
        try {
            const roomSlug = inputRef.current?.value.trim();
            if (!roomSlug) {
                inputRef.current?.focus();
                setIsLoading(false)
                return;
            }
            setIsLoading(true);
            setModalopen((s) => !s);
            router.push(`/canvas/${roomSlug}`);
        } catch (error) {
            console.error("Error joining room:", error);
            setIsLoading(false);
        }
    }

    return (
        <section className="flex w-full min-h-[100vh] p-20 py-24 bg-black">
            <div className="flex flex-col justify-center items-center gap-8 max-w-screen-8xl w-full mx-auto relative">
                <FloatingShapes />
                <div className="flex flex-col justify-center items-center gap-8 bg-black z-20 rounded-xl">
                    <div className="flex flex-col gap-8 p-3 md:p-0 text-md md:text-xl text-center font-heading font-semibold text-white z-20">
                        <span className="font-logo text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-300 to-pink-300 text-transparent bg-clip-text">Doodle</span>
                        Sketch, Collaborate, Innovate - All in One Place.
                    </div>
                    <div className="flex gap-8 z-20">
                        <Button className="flex items-center gap-3 px-4 py-5 md:p-6 bg-gray-100 text-black hover:bg-gray-100/90 group" onClick={createRoom}>
                            Start Doodling
                            <PencilLine className="size-3" />
                        </Button>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="flex items-center px-4 py-5 md:p-6 w-32 bg-black text-white border border-white" onClick={() => setModalopen((s) => !s)}>
                                    Join Room
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-lg">
                                <DialogHeader className="flex flex-col gap-5 md:gap-8">
                                    <DialogTitle className="text-left">Join Room</DialogTitle>
                                    <DialogDescription className="flex flex-col gap-5 md:gap-8 text-md">
                                        <span className="flex rounded bg-gray-100 border">
                                            <span className="p-2">
                                                <Users className="size-4" />
                                            </span>
                                            <input ref={inputRef} type="text" name="roomCode" id="" placeholder="Enter Room Code" className="pl-2 w-full h-full outline-none" />
                                        </span>
                                        <Button className="flex items-center gap-3 p-5" onClick={joinRoom}>
                                            join Room
                                        </Button>
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="flex flex-row items-start gap-1 text-sm p-2 rounded bg-gray-200  text-black">
                                    <Info /> <span>Don't have a room code? Ask your team member to share it with you or create a new room.</span>
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