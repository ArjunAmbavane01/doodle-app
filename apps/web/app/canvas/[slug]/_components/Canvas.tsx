'use client'
import { IRoomChat } from "@workspace/common/schemas";
import { useEffect, useRef, useState } from "react";
import Toolbar from "./Toolbar";
import CanvasControls from "./CanvasControls";
import CustomizationToolbar from "./CustomizationToolbar";
import DrawingEngine from "@/lib/class";
import ProjectControls from "./ProjectControls";

export type SelectedToolType = 'pan' | 'selection' | 'rectangle' | 'circle' | 'triangle' | 'pen' | 'line' | 'arrow' | 'text' | 'highlighter';

const Canvas = ({ socket, roomMessages, userId }: { socket: WebSocket | null, roomMessages: IRoomChat[], userId:string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvasGame, setCanvasGame] = useState<DrawingEngine>();

    useEffect(() => {
        if (canvasRef.current && socket) {
            const game = new DrawingEngine(canvasRef.current,socket,userId,roomMessages);
            setCanvasGame(game);
            return () => {
                game.destroy();
            }
        }
    }, [socket, roomMessages, userId])

    return (
        <div className="w-screen h-screen relative overflow-hidden" id="canvas-container">
            <canvas ref={canvasRef} width={5000} height={5000} className="size-[5000] absolute inset-0" />
            <div id="textarea-container" />
            <Toolbar />
            <CustomizationToolbar />
            <CanvasControls />
            <ProjectControls />
        </div>
    );
}

export default Canvas;