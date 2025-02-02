import { Button } from "@workspace/ui/components/button";

const HeroSection = () => {
    return (
        <section className="flex w-full">
        <div className="flex flex-col gap-5 justify-center items-center max-w-screen-8xl w-full h-[90svh]">
            <div className="flex flex-col gap-3 text-xl">
                <span className="text-5xl text-center">Doodle</span>
                Sketch, Collaborate, Innovate - All in One Place.
            </div>
            <div className="flex gap-5">
        <Button>
            Start Doodling
        </Button>
        <Button>
            join a room
        </Button>
            </div>
                {/* <MainSection /> */}
        </div>
        </section>
    );
}

export default HeroSection;