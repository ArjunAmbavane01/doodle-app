import { authOptions, ICustomSession } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import StartButton from "../StartButton";

const MainSection = async () => {
    const session: ICustomSession | null = await getServerSession(authOptions)
    return (
        <div>
            <StartButton userId={session?.user?.id as string} />
        </div>
    );
}

export default MainSection;