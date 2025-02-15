'use client'
import { initDraw, Shape } from "@/lib/draw";
import { IChatMessage } from "@workspace/common/interfaces";
import { useEffect, useRef } from "react";

const Canvas = ({ socket, roomMessages }: { socket:WebSocket|null , roomMessages: IChatMessage[] }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current && socket) {
            const cleanup = initDraw(canvasRef.current, socket, roomMessages);
            return cleanup;
        }
    }, [socket,roomMessages])

    return (
        <div className="w-screen h-screen relative overflow-hidden">
            <canvas ref={canvasRef} width={5000} height={5000} className="absolute inset-0" />
        </div>
    );
}

export default Canvas;