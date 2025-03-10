'use client'
import { useEffect, useRef, useState } from "react";
import { BASE_WS_URL } from "@/lib/apiEndPoints";
import {IChatMessage} from "@workspace/common/schemas";
import Canvas from "./Canvas";
import { useLoading } from "@/providers/LoadingProvider";

const CanvasRoom = ({ wsToken,roomMessages,userId }: { wsToken: string, roomMessages:IChatMessage[] , userId:string}) => {
    const {setIsLoading} = useLoading();
    const socketRef = useRef<WebSocket | null>(null);
    useEffect(() => {
        if (!socketRef.current) {
            setIsLoading(true);
            socketRef.current = new WebSocket(`${BASE_WS_URL}?token=${wsToken}`);
            socketRef.current.onopen = () => { 
                socketRef.current?.send(JSON.stringify({ type: "join_room" })) 
                setIsLoading(false);
            };
            socketRef.current.onclose = () => { socketRef.current = null };
            socketRef.current.onerror = (error) => {
                console.error("WebSocket error:", error);
                setIsLoading(false); 
            };
        }
    }, [wsToken])

    return <Canvas socket={socketRef.current} roomMessages={roomMessages} userId={userId} />
}

export default CanvasRoom;