'use client'
import { BASE_WS_URL } from "@/lib/apiEndPoints";
import { useEffect, useState } from "react";

interface IChat {
    type: "chat",
    message: string,
    roomId:number,
}

const Canvas = ({ wsToken }: { wsToken: string }) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [messages,setMessages] = useState<String[]>([]);

    useEffect(() => {
        const ws = new WebSocket(`${BASE_WS_URL}?token=${wsToken}`);
        ws.onopen = () => {
            setSocket(ws);
            const data = JSON.stringify({ type: 'join_room' })
            console.log(data);
            ws.send(data);
        }
        ws.onmessage = (event) => {
            try {
                const receivedData = JSON.parse(event.data);
                if (receivedData.type === "chat") setMessages((prev) => [...prev, receivedData.message]);
            } catch (error) {
                console.error("Error parsing message:", error);
            }
        };
        return () => ws.close();
    }, [wsToken])

    

    if(!socket){
        return  <div>Connecting to server</div>
    }
    return (
        <div>
           <button onClick={()=>socket.send(JSON.stringify({type:"chat",message:"Hey there"}))}>send message</button>
           {messages.map((msg,idx)=> <div key={idx}>{msg}</div>)}
        </div>
    );
}

export default Canvas;