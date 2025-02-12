import { authOptions, ICustomSession } from "@/app/api/auth/[...nextauth]/options";
import { JOIN_ROOM_URL } from "@/lib/apiEndPoints";
import axios from "axios";
import { getServerSession } from "next-auth";
import Canvas from "./_components/Canvas";

const CanvasRoom = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const session: ICustomSession | null = await getServerSession(authOptions);
    const { slug } = await params;
    const { data } = await axios.post(JOIN_ROOM_URL, {slug}, {headers: {Authorization: `Bearer ${session?.user?.token}`}})
    if(data.type === 'error') alert('Room does not exists');
    const wsToken = data?.data?.token;

    return (
        <div>
           <Canvas wsToken={wsToken}/>
        </div>
    );
}

export default CanvasRoom;