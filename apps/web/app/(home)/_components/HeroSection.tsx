"use client"
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Info, PencilLine, Users } from "lucide-react";
import { CREATE_ROOM_URL } from "@/lib/apiEndPoints";
import { Button } from "@workspace/ui/components/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog"
import { useLoading } from "@/providers/LoadingProvider";
import { FloatingShapes } from "./visuals/FloatingShapes";
import { AnimatePresence } from 'motion/react'
import Toast from "@/components/ui/Toast";

const HeroSection = ({ userToken }: { userToken: string | null | undefined }) => {
    const router = useRouter();
    const { setIsLoading } = useLoading();
    const inputRef = useRef<HTMLInputElement>(null);
    const [modalOpen, setModalopen] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

    const showToast = (message: string, type = "success") => {
        setToast({ visible: true, message, type });
    };

    const hideToast = () => {
        setToast({ ...toast, visible: false });
    };

    const createRoom = async () => {
        try {
            const { data } = await axios.post(CREATE_ROOM_URL, {}, { headers: { 'Authorization': `Bearer ${userToken}` } });
            if (data.type === 'success') {
                setIsLoading(true);
                router.push(`/canvas/${data.data.slug}`);
            } else {
                setIsLoading(false);
                showToast("There was a problem creating your room. Please try again.", "error");
            }
            return;
        } catch (error) {
            setIsLoading(false);
            showToast("There was a problem creating your room. Please try again.", "error");
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
            setIsLoading(false);
            showToast("Error joining room. Please try again.", "error");
        }
    }

    return (
        <section className="flex w-full min-h-[100vh] p-20 py-24 bg-black">
            <div className="flex flex-col justify-center items-center gap-20 max-w-screen-8xl w-full mx-auto relative">
                <FloatingShapes />
                <div className="flex flex-col justify-center items-center gap-10 bg-black/40 z-20 rounded-xl">
                    <div className="flex flex-col gap-12 p-3 md:p-0 text-md md:text-xl text-center font-heading font-semibold text-white z-20">
                        <span className="font-logo text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-300 to-pink-300 text-transparent bg-clip-text">Doodle</span>
                        <span>Sketch, Collaborate, Innovate - All in One Place.</span>
                    </div>
                    <div className="flex gap-8 z-20 font-body">
                        <Button className="flex items-center gap-3 px-4 py-5 md:p-6 text-md text-zinc-800 border-2 border-blue-200 bg-gradient-to-t from-blue-300 to-white hover:bg-gradient-to-t hover:from-blue-400 hover:via-blue-200 hover:to-white hover:text-zinc-800 transition-all duration-500">
                            <span>Start Doodling</span>
                            <PencilLine className="size-3" />
                        </Button>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    className="flex items-center px-4 py-5 md:p-6 text-md bg-black text-white border border-white hover:bg-gradient-to-t hover:from-blue-300 hover:to-white transition-all duration-500 hover:text-zinc-800 group relative  overflow-hidden"
                                    onClick={() => setModalopen((s) => !s)}
                                >
                                    <span className="relative z-10">Join Room</span>

                                    <span className="absolute inset-0 border border-white/50 group-hover:border-transparent transition-all duration-300"></span>
                                    <span className="absolute inset-0 border border-transparent group-hover:border-blue-200 transition-all duration-500"></span>
                                    <span className="absolute -inset-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-all duration-1000 ease-in-out"></span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-lg bg-white text-zinc-800">
                                <DialogHeader className="flex flex-col gap-5 md:gap-8">
                                    <DialogTitle className="text-left font-heading text-zinc-800">Join Room</DialogTitle>
                                    <DialogDescription className="flex flex-col gap-5 md:gap-8 text-md">
                                        <span className="flex rounded border border-blue-300">
                                            <span className="p-2 bg-blue-100 text-zinc-800 border-r border-blue-300">
                                                <Users className="size-4" />
                                            </span>
                                            <input ref={inputRef} type="text" name="roomCode" id="" placeholder="Enter Room Code" className="bg-white text-zinc-800  pl-2 w-full h-full outline-none autofill:bg-white autofill:text-zinc-800" />
                                        </span>
                                        <Button className="flex items-center gap-3 p-5 bg-blue-100 border border-blue-400 text-zinc-800 hover:bg-blue-50 hover:text-zinc-800 transition-colors duration-200 font-heading font-semibold" onClick={joinRoom}>
                                            Join Room
                                        </Button>
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="flex flex-row items-start gap-1 text-sm p-2 rounded bg-blue-50 text-zinc-800 font-body">
                                    <Info /> <span>Don't have a room code? Ask your team member to share it with you or create a new room.</span>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {toast.visible && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={hideToast}
                    />
                )}
            </AnimatePresence>
        </section>
    );
}



export default HeroSection;