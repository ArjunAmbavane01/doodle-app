import { Button } from "@workspace/ui/components/button";
import { PencilLine } from "lucide-react";
import Image from "next/image";

const HeroSection = () => {
    return (
        <section className="flex w-full">
        <div className="flex flex-col gap-10 justify-center items-center max-w-screen-8xl w-full h-[90svh]">
            <div className="flex flex-col gap-5 text-xl font-heading font-semibold">
                <span className="font-logo text-7xl font-bold text-center">Doodle</span>
                Sketch, Collaborate, Innovate - All in One Place.
            </div>
            <div className="flex gap-5">
        <Button className="flex items-center gap-3 p-5">
            Start Doodling
            <PencilLine className="size-3"/>
        </Button>
        <Button variant={'outline'} className="flex items-center p-5">
            join a room
        </Button>
            </div>
        </div>
        </section>
    );
}

export default HeroSection;