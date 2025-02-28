'use client'
import { initDraw } from "@/lib/draw";
import { IChatMessage } from "@workspace/common/interfaces";
import { useEffect, useRef } from "react";
import Toolbar from "./Toolbar";
import ActionButtons from "./CanvasActionButtons";

export type SelectedToolType = 'pan' | 'selection' | 'rectangle' | 'circle' | 'triangle' | 'pen' | 'line' | 'arrow' | 'text' | 'highlighter';

const Canvas = ({ socket, roomMessages, userId }: { socket: WebSocket | null, roomMessages: IChatMessage[], userId:string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (canvasRef.current && socket) {
                const cleanup = initDraw(canvasRef.current, socket, roomMessages, userId);
                return () => {
                    cleanup();
                };
        }
    }, [socket, roomMessages, userId])

    return (
        <div ref={containerRef} className="w-screen h-screen relative overflow-hidden">
            <canvas ref={canvasRef} width={5000} height={5000} className="size-[5000] absolute inset-0" />
            <ActionButtons />
            <Toolbar />
        </div>
    );
}

export default Canvas;