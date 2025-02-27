'use client'
import { initDraw } from "@/lib/draw";
import { IChatMessage } from "@workspace/common/interfaces";
import { useEffect, useRef } from "react";
import Toolbar from "./Toolbar";
import ActionButtons from "./CanvasActionButtons";

// add highlighter option
export type SelectedToolType = 'pan' | 'selection' | 'rectangle' | 'circle' | 'triangle' | 'pen' | 'line' | 'arrow' | 'text' | 'highlighter';

const Canvas = ({ socket, roomMessages, userId }: { socket: WebSocket | null, roomMessages: IChatMessage[], userId:string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (canvasRef.current && socket) {
            // const container = containerRef.current;
            // if(container){
            //     canvasRef.current.width = container.clientWidth * window.devicePixelRatio;
            //     canvasRef.current.height = container.clientHeight * window.devicePixelRatio;

            //     const handleResize = () => {
            //         if(canvasRef.current && containerRef){
            //             canvasRef.current.width = container.clientWidth * window.devicePixelRatio;
            //             canvasRef.current.height = container.clientHeight * window.devicePixelRatio;
            //         }
            //     }
            //     window.addEventListener('resize',handleResize)
                const cleanup = initDraw(canvasRef.current, socket, roomMessages, userId);
                return () => {
                    cleanup();
                    // window.removeEventListener('resize',handleResize);
                };
            // }
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