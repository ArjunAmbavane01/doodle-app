'use client'
import { IRoomChat } from "@workspace/common/schemas";
import { useEffect, useRef, useState } from "react";
import Toolbar from "./Toolbar";
import ActionButtons from "./ActionButtons";
import ExtendedToolbar from "./ExtendedToolbar";
import DrawingEngine from "@/lib/class";

export type SelectedToolType = 'pan' | 'selection' | 'rectangle' | 'circle' | 'triangle' | 'pen' | 'line' | 'arrow' | 'text' | 'highlighter';

const Canvas = ({ socket, roomMessages, userId }: { socket: WebSocket | null, roomMessages: IRoomChat[], userId:string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [canvasGame, setCanvasGame] = useState<DrawingEngine>();
    const [selectedTool, setSelectedTool] = useState<SelectedToolType>("pen")

    useEffect(() => {
        canvasGame?.handleToolChange(selectedTool);
    }, [selectedTool, canvasGame])

    useEffect(() => {
        if (canvasRef.current && socket) {
            const canvasGame = new DrawingEngine(canvasRef.current,socket,userId,roomMessages);
            setCanvasGame(canvasGame);
            return () => {
                canvasGame.destroy();
            }
        }
    }, [socket, roomMessages, userId])

    return (
        <div className="w-screen h-screen relative overflow-hidden" id="canvas-container">
            <canvas ref={canvasRef} width={5000} height={5000} className="size-[5000] absolute inset-0" />
            <div id="textarea-container" />
            <Toolbar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
            <ExtendedToolbar />
            <ActionButtons />
        </div>
    );
}

export default Canvas;