'use client'
import { BASE_WS_URL } from "@/lib/apiEndPoints";
import { useEffect, useRef, useState } from "react";
import {IChatMessage} from "@workspace/common/interfaces";
import Canvas from "./Canvas";

const CanvasRoom = ({ wsToken,roomMessages,userId }: { wsToken: string, roomMessages:IChatMessage[] , userId:string}) => {
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const socketRef = useRef<WebSocket | null>(null);
    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = new WebSocket(`${BASE_WS_URL}?token=${wsToken}`);

            socketRef.current.onopen = () => {
                socketRef.current?.send(JSON.stringify({ type: "join_room" }));
                setIsConnected(true);
            };

            socketRef.current.onclose = () => {
                setIsConnected(false);
                socketRef.current = null;
            };
        }
    }, [wsToken])

    if(!isConnected){
        return <div className="flex justify-center items-center h-screen w-screen">Connecting to server</div>
    }
    return <Canvas socket={socketRef.current} roomMessages={roomMessages} userId={userId} />
}

export default CanvasRoom;