'use client'
import { initDraw } from "@/lib/draw";
import { IRoomChat } from "@workspace/common/schemas";
import { useEffect, useRef } from "react";
import Toolbar from "./Toolbar";
import ActionButtons from "./ActionButtons";
import ExtendedToolbar from "./ExtendedToolbar";

export type SelectedToolType = 'pan' | 'selection' | 'rectangle' | 'circle' | 'triangle' | 'pen' | 'line' | 'arrow' | 'text' | 'highlighter';

const Canvas = ({ socket, roomMessages, userId }: { socket: WebSocket | null, roomMessages: IRoomChat[], userId:string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        if (canvasRef.current && socket) {
            const cleanup = initDraw(canvasRef.current, socket, roomMessages, userId);
            return cleanup;
        }
    }, [socket, roomMessages, userId])

    return (
        <div className="w-screen h-screen relative overflow-hidden" id="canvas-container">
            <canvas ref={canvasRef} width={5000} height={5000} className="size-[5000] absolute inset-0" />
            <div id="textarea-container" />
            <Toolbar />
            <ExtendedToolbar />
            <ActionButtons />
        </div>
    );
}

export default Canvas;