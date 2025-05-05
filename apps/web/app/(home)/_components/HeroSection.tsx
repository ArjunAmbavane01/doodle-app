"use client"

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AnimatePresence } from 'motion/react'
import { CREATE_ROOM_URL } from "@/lib/apiEndPoints";
import { Button } from "@workspace/ui/components/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog"
import { useLoading } from "@/providers/LoadingProvider";
import { FloatingShapes } from "./visuals/FloatingShapes";
import Toast from "@/components/ui/Toast";
import { Info, PencilLine, Users } from "lucide-react";
import { gsap } from "gsap"
import HoverButton from "@/components/ui/GooeyButton";

const HeroSection = ({ userToken }: { userToken: string | null | undefined }) => {

    const router = useRouter();
    const { setIsLoading } = useLoading();

    const inputRef = useRef<HTMLInputElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const buttonsRef = useRef<HTMLDivElement>(null);

    const [modalOpen, setModalopen] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: "", type: "success" });
    const [loadingRoom, setLoadingRoom] = useState(false);
    const [shapeNum, setShapeNum] = useState<number>(13);

    const showToast = (message: string, type = "success") => setToast({ visible: true, message, type });

    const hideToast = () => setToast({ ...toast, visible: false });

    const createRoom = async () => {
        try {
            setLoadingRoom(true);
            console.log('here')
            const { data } = await axios.post(CREATE_ROOM_URL, {}, { headers: { 'Authorization': `Bearer ${userToken}` } });
            console.log(data)
            if (data.type === 'success') {
                setIsLoading(true);
                router.push(`/canvas/${data.data.slug}`);
            } else {
                setIsLoading(false);
                showToast("There was a problem creating your room. Please try again.", "error");
            }
            setLoadingRoom(false);
            return;
        } catch (error) {
            setLoadingRoom(false);
            setIsLoading(false);
            showToast("There was a problem creating your room. Please try again.", "error");
        }
    }

    const joinRoom = async () => {
        try {
            const roomSlug = inputRef.current?.value.trim();
            if (!userToken) {
                showToast("Please log in to join a room.", "error");
                setModalopen((c) => !c);
                return;
            }
            if (!roomSlug) {
                inputRef.current?.focus();
                setIsLoading(false)
                return;
            }
            setModalopen((c) => !c);
            setIsLoading(true);
            router.push(`/canvas/${roomSlug}`);
            setTimeout(() => {
                setIsLoading(false);
            }, 8000);
        } catch (error) {
            setIsLoading(false);
            showToast("Error joining room. Please try again.", "error");
        }
    }

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(headingRef.current, {
                y: 50,
                opacity: 0,
                duration: 1.2,
                ease: "power3.out",
            })

            gsap.from(buttonsRef.current?.children || [], {
                y: 30,
                opacity: 0,
                stagger: 0.2,
                duration: 0.8,
                delay: 0.6,
                ease: "back.out(1.7)",
            })

            gsap.from(".triangle", {
                rotate: "0deg",
                scale: 0.5,
                opacity: 0,
                duration: 1.5,
                ease: "elastic.out(1, 0.3)",
                stagger: 0.2,
            })
        })

        return () => ctx.revert()
    }, [])

    useEffect(() => {

        const handleResize = () => {

        }
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, [])

    return (
        <section className="relative w-full min-h-screen overflow-hidden bg-black flex items-center justify-center">

            <div className="absolute inset-0 pointer-events-none">
                <div className="triangle absolute -top-10 right-0 size-40 bg-pink-400 rotate-45 opacity-80"></div>

                <div className="triangle absolute -bottom-20 left-0 size-40 bg-green-400 rotate-45"></div>

                <FloatingShapes />
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center gap-5 text-center w-fit">
                <h1 ref={headingRef}
                    className="text-7xl lg:text-9xl font-bold font-heading tracking-tight px-3 bg-gradient-to-b from-[#8be9fd] to-white text-transparent bg-clip-text"
                >
                    Doodle
                </h1>


                <div ref={buttonsRef} className="mt-8 flex flex-col md:flex-row gap-8">
                    <Button onClick={createRoom} className="flex items-center gap-3 px-4 py-5 md:p-6 rounded-full text-md text-zinc-800 border-2 border-[#037f9a] bg-gradient-to-tl from-white via-[#9bedff] to-[#20a1bdcb]  hover:bg-gradient-to-t hover:from-[#8be9fd] hover:to-white hover:text-zinc-800 transition-colors duration-500">
                        <span>{loadingRoom ? 'Doodling...' : 'Start Doodling'}</span>
                        <PencilLine className="size-3" />
                    </Button>

                    <Dialog open={modalOpen} onOpenChange={setModalopen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                className="rounded-full border-2 border-white p-6 text-white font-semibold text-lg bg-black"
                                onClick={() => setModalopen(true)}
                            >
                                Join Room
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-lg bg-white text-zinc-800">
                            <DialogHeader className="flex flex-col gap-5 md:gap-8">
                                <DialogTitle className="text-left font-heading text-zinc-800">Join Room</DialogTitle>
                                <DialogDescription className="flex flex-col gap-5 md:gap-8 text-md">
                                    <div className="flex rounded border border-blue-300">
                                        <span className="p-2 bg-blue-100 text-zinc-800 border-r border-blue-300">
                                            <Users className="w-4 h-4" />
                                        </span>
                                        <input
                                            type="text"
                                            placeholder="Enter Room Code"
                                            className="bg-white text-zinc-800 pl-2 w-full h-full outline-none"
                                        />
                                    </div>
                                    <Button
                                        className="flex items-center gap-3 p-5 bg-blue-100 border border-blue-400 text-zinc-800 hover:bg-blue-50 hover:text-zinc-800 transition-colors duration-200 font-medium"
                                        onClick={() => { }}
                                    >
                                        Join Room
                                    </Button>
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="flex flex-row items-start gap-1 text-sm p-2 rounded bg-blue-50 text-zinc-800">
                                <Info className="w-4 h-4" />
                                <span>Don't have a room code? Ask your team member to share it with you or create a new room.</span>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>


                    {/* <Button onClick={createRoom} className="flex items-center gap-3 px-4 py-5 md:p-6 text-md text-zinc-800 border-2 border-blue-200 bg-gradient-to-t from-blue-200 to-white hover:bg-gradient-to-t hover:from-blue-300 hover:via-blue-100 hover:to-white hover:text-zinc-800 transition-all duration-500">
                            <span>{loadingRoom ? 'Doodling...' : 'Start Doodling'}</span>
                            <PencilLine className="size-3" />
                        </Button>

                        <Dialog open={modalOpen} onOpenChange={setModalopen}>
                            <DialogTrigger asChild>
                                <Button
                                    className="flex items-center px-4 py-5 md:p-6 text-md bg-black text-white border border-white hover:bg-gradient-to-t hover:from-blue-200 hover:to-white transition-all duration-500 hover:text-zinc-800 group relative  overflow-hidden"
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
                        </Dialog> */}


                </div>
            </div>
        </section>
    );
}



export default HeroSection;
