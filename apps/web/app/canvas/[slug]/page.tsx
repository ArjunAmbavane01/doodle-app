import { authOptions, ICustomSession } from "@/app/api/auth/[...nextauth]/options";
import { JOIN_ROOM_URL } from "@/lib/apiEndPoints";
import axios from "axios";
import { getServerSession } from "next-auth";
import CanvasWrapper from "./_components/CanvasWrapper";

const page = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const session: ICustomSession | null = await getServerSession(authOptions);
    const { slug } = await params;
    const { data } = await axios.post(JOIN_ROOM_URL, {slug}, {headers: {Authorization: `Bearer ${session?.user?.token}`}})
    if(data.type === 'error') console.error(data.message);
    const wsToken = data?.data?.token;
    const roomMessages = data?.data?.roomMessages;
    const userId = session?.user?.id;

    return <CanvasWrapper wsToken={wsToken} roomMessages={roomMessages} userId={userId as unknown as string} sessionId={slug}/>
}

export default page;