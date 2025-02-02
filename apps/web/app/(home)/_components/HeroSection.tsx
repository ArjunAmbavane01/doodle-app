import { Button } from "@workspace/ui/components/button";

const HeroSection = () => {
    return (
        <section className="flex w-full">
        <div className="flex flex-col gap-10 justify-center items-center max-w-screen-8xl w-full h-[90svh]">
            <div className="flex flex-col gap-5 text-xl font-heading font-semibold">
                <span className="font-logo text-7xl font-bold text-center">Doodle</span>
                Sketch, Collaborate, Innovate - All in One Place.
            </div>
            <div className="flex gap-5">
        <Button>
            Start Doodling
        </Button>
        <Button variant={'outline'}>
            join a room
        </Button>
            </div>
                {/* <MainSection /> */}
        </div>
        </section>
    );
}

export default HeroSection;