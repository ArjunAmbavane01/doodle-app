"use client"

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { gsap } from "gsap";
import { CREATE_ROOM_URL } from "@/lib/apiEndPoints";
import { useLoading } from "@/providers/LoadingProvider";
import { FloatingShapes } from "./visuals/FloatingShapes";
import { errorToast } from "@/components/ui/Toast";
import { Button } from "@workspace/ui/components/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog"
import { Info, PencilLine, Users } from "lucide-react";


const HeroSection = ({ userToken }: { userToken: string | null | undefined }) => {

    const router = useRouter();
    const { setIsLoading } = useLoading();

    const inputRef = useRef<HTMLInputElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const buttonsRef = useRef<HTMLDivElement>(null);

    const [modalOpen, setModalopen] = useState(false);
    const [loadingRoom, setLoadingRoom] = useState(false);
    const [shapeNum, setShapeNum] = useState<number>(13);

    const createRoom = async () => {
        try {
            setLoadingRoom(true);
            const { data } = await axios.post(CREATE_ROOM_URL, {}, { headers: { 'Authorization': `Bearer ${userToken}` } });
            console.log(data)
            if (data.type === 'success') {
                setIsLoading(true);
                router.push(`/canvas/${data.data.slug}`);
            } else {
                setIsLoading(false);
                errorToast({ title: 'There was a problem creating your room. Please try again.' });
            }
            setLoadingRoom(false);
            return;
        } catch (error: unknown) {
            setLoadingRoom(false);
            setIsLoading(false);
            if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
                errorToast({ title: 'Could not reach the server. Please check your connection or try again later.' });
            } else {
                errorToast({ title: 'There was a problem creating your room. Please try again.' });
            }
        }
    }

    const joinRoom = async () => {
        try {
            const roomSlug = inputRef.current?.value.trim();
            if (!userToken) {
                errorToast({ title: 'Please log in to join a room.' });
                setModalopen((c) => !c);
                return;
            }
            if (!roomSlug) {
                inputRef.current?.focus();
                setIsLoading(false);
                return;
            }
            console.log('here')
            setModalopen((c) => !c);
            setIsLoading(true);
            router.push(`/canvas/${roomSlug}`);
            setTimeout(() => {
                setIsLoading(false);
            }, 8000);
        } catch (error: unknown) {
            setIsLoading(false);
            if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
                errorToast({ title: 'Could not reach the server. Please check your connection or try again later.' });
            } else {
                errorToast({ title: 'There was a problem creating your room. Please try again.' });
            }
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
        <section className="flex items-center justify-center relative w-full h-[calc(100vh)] -mt-14 md:-mt-20 overflow-hidden bg-black">
            <div className="absolute inset-0 pointer-events-none">
                <div className="triangle absolute -top-10 right-0 size-40 bg-pink-400 rotate-45 opacity-80"></div>
                <div className="triangle absolute bottom-20 -left-20 size-40 bg-green-400 rotate-12"></div>

                <FloatingShapes />
            </div>

            <div className="flex flex-col items-center justify-center gap-14 md:gap-12 max-w-screen-8xl w-full z-10">
                <h1 ref={headingRef}
                    className="text-7xl lg:text-9xl font-bold font-heading tracking-tight bg-gradient-to-b from-[#8be9fd] to-white text-transparent bg-clip-text [text-shadow:_0_4px_12px_rgb(99_102_241_/_0.2)]"
                >
                    Doodle
                </h1>


                <div ref={buttonsRef} className="flex flex-col md:flex-row gap-5">
                    <Button onClick={createRoom} className="p-5 md:p-6 rounded-full text-blue-950 bg-gradient-to-br from-blue-400 via-blue-200 shadow-sm shadow-blue-300">
                        <span className="flex items-center gap-2 font-semibold font-body text-base md:text-lg">{loadingRoom ? 'Doodling...' : 'Start Doodling'}
                            <PencilLine className="size-3" />
                        </span>
                    </Button>

                    <Dialog open={modalOpen} onOpenChange={setModalopen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                className="rounded-full p-5 md:p-6 border border-white text-white font-bold font-body text-base md:text-lg bg-black shadow-md shadow-blue-800 hover:bg-white/10"
                                onClick={() => setModalopen(true)}
                            >
                                Join Room
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-lg bg-white text-zinc-800 max-w-xs md:max-w-md lg:max-w-lg">
                            <DialogHeader className="flex flex-col gap-3 md:gap-5">
                                <DialogTitle className="text-lg text-left font-heading text-zinc-800">Join Room</DialogTitle>
                                <DialogDescription asChild>
                                    <div className="flex flex-col gap-3 md:gap-5 text-sm md:text-base">
                                        <div className="flex rounded border border-blue-300">
                                            <span className="p-2 bg-blue-100 text-blue-800 border-r border-blue-300">
                                                <Users className="size-3 md:size-4" />
                                            </span>
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                name="roomCode"
                                                placeholder="Enter Room Code"
                                                className="bg-white text-zinc-800 pl-2 size-full outline-none"
                                            />
                                        </div>
                                        <Button
                                            className="flex items-center gap-3 p-3 md:p-5 text-sm md:text-base tracking-wide text-white [text-shadow:_0_2px_4px_rgb(23_37_84_/_0.9)] bg-gradient-to-br from-blue-500 via-blue-300 to-blue-200 shadow-sm shadow-blue-600 transition-colors duration-200 font-medium"
                                            onClick={joinRoom}
                                        >
                                            Join Room
                                        </Button>
                                    </div>
                                </DialogDescription>

                            </DialogHeader>
                            <DialogFooter className="flex flex-row items-start gap-1 text-sm p-2 rounded bg-blue-50 border border-blue-200 text-zinc-800">
                                <Info className="size-5 text-zinc-800" />
                                <span className="text-xs md:text-sm">Don't have a room code? Ask your team member to share it with you or create a new room.</span>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </section>
    );
}



export default HeroSection;
