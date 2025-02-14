'use client'
import { BASE_WS_URL } from "@/lib/apiEndPoints";
import { useEffect, useState } from "react";
import {IChatMessage} from "@workspace/common/interfaces";
import Canvas from './Canvas';
import { getShapesFromMessages, Shape } from "@/lib/draw";


const CanvasRoom = ({ wsToken,roomMessages }: { wsToken: string, roomMessages:IChatMessage[] }) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [roomShapes,setRoomShapes] = useState<Shape[]>(getShapesFromMessages(roomMessages));

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
                if (receivedData.type === "chat") {
                    setRoomShapes([...roomShapes,receivedData.message])
                }
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
    return <Canvas sendMessage={sendMessage} roomShapes={roomShapes} />
}

export default CanvasRoom;