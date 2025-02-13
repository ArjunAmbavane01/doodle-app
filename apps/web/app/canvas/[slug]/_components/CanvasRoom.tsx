'use client'
import { BASE_WS_URL } from "@/lib/apiEndPoints";
import { useEffect, useState } from "react";
import {IChatMessage} from "@workspace/common/interfaces";
import Canvas from './Canvas';

const CanvasRoom = ({ wsToken,roomMessages }: { wsToken: string, roomMessages:IChatMessage[] }) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [messages,setMessages] = useState<IChatMessage[]>(roomMessages);

    const sendMessage = (message:string) => {
        if(socket) socket.send(JSON.stringify({ type: "chat", message }));
    }
    useEffect(() => {
        const ws = new WebSocket(`${BASE_WS_URL}?token=${wsToken}`);
        ws.onopen = () => {
            setSocket(ws);
            ws.send(JSON.stringify({ type: 'join_room' }));
        }
        ws.onmessage = (event) => {
            try {
                const receivedData = JSON.parse(event.data);
                if (receivedData.type === "chat") setMessages((prev) => [...prev, receivedData]);
            } catch (error) {
                console.error("Error parsing message:", error);
            }
        };
        return () => {
         ws.close();
         setSocket(null);   
        }
    }, [wsToken])
    if(!socket){
        return <div className="flex justify-center items-center h-screen w-screen">Connecting to server</div>
    }
    return <Canvas sendMessage={sendMessage} messages={messages} />
}

export default CanvasRoom;