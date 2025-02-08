import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";

const Collab = () => {
    const activeUsers = 5;
    return (
        <section className="flex w-full p-20 py-24 bg-black">
            <div className="grid grid-cols-2 items-center gap-8 max-w-screen-8xl w-full mx-auto text-white">
                <div className="flex flex-col gap-8">

                    <div className="text-4xl font-bold font-heading">Watch Ideas Flow in Real-Time</div>
                    <div className="text-xl font-body">See your team's creativity unfold live as they sketch, annotate, and brainstorm together.</div>
                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-4">
                            {[...Array(5)].map((_, i) => (
                                <Avatar key={i} className={`border-2 border-black transition-opacity duration-500 ${i < activeUsers ? "opacity-100" : "opacity-30"}`}>
                                    <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                                    <AvatarFallback className="text-black">U{i + 1}</AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                        <Badge variant="secondary" className="h-fit">{activeUsers} active now</Badge>
                    </div>
                </div>
                <div className="flex justify-center items-center">
                    <div className="relative bg-white h-96 w-96 rounded-lg">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 blur-3xl" />

                    </div>
                </div>

            </div>

        </section>
    );
}

export default Collab;