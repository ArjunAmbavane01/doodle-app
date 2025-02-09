'use client'
import { BASE_WS_URL } from "@/lib/apiEndPoints";
import { useEffect, useState } from "react";
import {IChat} from "@workspace/common/interfaces";
import Canvas from './Canvas';

const CanvasRoom = ({ wsToken,roomMessages }: { wsToken: string,roomMessages:IChat[] }) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [messages,setMessages] = useState<IChat[]>(roomMessages);

    useEffect(() => {
        const ws = new WebSocket(`${BASE_WS_URL}?token=${wsToken}`);
        ws.onopen = () => {
            setSocket(ws);
            const data = JSON.stringify({ type: 'join_room' })
            ws.send(data);
        }
        ws.onmessage = (event) => {
            try {
                const receivedData = JSON.parse(event.data);
                if (receivedData.type === "chat") setMessages((prev) => [...prev, receivedData]);
            } catch (error) {
                console.error("Error parsing message:", error);
            }
        };
        return () => ws.close();
    }, [wsToken])

    return (
        <div>
            <Canvas socket={socket} messages={messages} />
        </div>
    );
}

export default CanvasRoom;