'use client'
import { IRoomChat } from "@workspace/common/messages";
import { useEffect, useRef, useState } from "react";
import MainToolbar from "./widgets/MainToolbar";
import QuickActions from "./widgets/QuickActions";
import StyleToolbar from "./widgets/StyleToolbar/StyleToolbar";
import DrawingEngine from "@/lib/class";
import UtilityToolbar from "./widgets/UtilityToolbar/UtilityToolbar";

export type SelectedToolType = 'pan' | 'selection' | 'rectangle' | 'circle' | 'triangle' | 'pen' | 'line' | 'arrow' | 'text' | 'highlighter' | 'genAI';

const Canvas = ({ socket, roomMessages, userId }: { socket: WebSocket | null, roomMessages: IRoomChat[], userId: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvasGame, setCanvasGame] = useState<DrawingEngine>();

    useEffect(() => {
        if (canvasRef.current && socket) {
            const game = new DrawingEngine(canvasRef.current, socket, userId, roomMessages);
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
            <MainToolbar />
            <StyleToolbar />
            <QuickActions />
            <UtilityToolbar />
        </div>
    );
}

export default Canvas;