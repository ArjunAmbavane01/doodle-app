'use client'
import { useEffect, useRef, useState } from "react";
import DrawingEngine from "@/lib/draw-engine";
import { IRoomChat } from "@workspace/common/messages";
import MainToolbar from "./widgets/MainToolbar/MainToolbar";
import QuickActions from "./widgets/QuickActions";
import StyleToolbar from "./widgets/StyleToolbar/StyleToolbar";
import UtilityToolbar from "./widgets/UtilityToolbar/UtilityToolbar";

export type SelectedToolType = 'pan' | 'selection' | 'rectangle' | 'circle' | 'triangle' | 'pen' | 'line' | 'arrow' | 'text' | 'highlighter' | 'genAI';

const Canvas = ({ socket, roomMessages, userId, sessionId }: { socket: WebSocket | null, roomMessages: IRoomChat[], userId: string, sessionId: string }) => {
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
    }, [socket, roomMessages, userId]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = 5000 * dpr;
            canvas.height = 5000 * dpr;
            canvas.style.width = '5000px';
            canvas.style.height = '5000px';
        }
    }, []);

    return (
        <div className="w-screen h-screen relative overflow-hidden" id="canvas-container">
            <canvas ref={canvasRef} width={5000} height={5000} className="size-[5000px] absolute inset-0 touch-none" />
            <div id="textarea-container" />
            {canvasGame && socket && <>
                <MainToolbar selectTool={canvasGame.onToolSelect} />
                <StyleToolbar
                    selectStrokeColour={canvasGame.selectStrokeColour}
                    selectFillColour={canvasGame.selectFillColour}
                    selectTextColor={canvasGame.selectTextColor}
                    selectTextStyle={canvasGame.selectTextStyle}
                    selectFontFamily={canvasGame.selectFontFamily}
                    selectFontSize={canvasGame.selectFontSize}
                    selectPenWidth={canvasGame.selectPenWidth} />
                <QuickActions
                    handleZoomIn={canvasGame.handleZoomIn}
                    handleZoomOut={canvasGame.handleZoomOut}
                    handleZoomReset={canvasGame.handleZoomReset}
                    handleRedo={canvasGame.handleRedo}
                    handleUndo={canvasGame.handleUndo}
                />
                <UtilityToolbar sessionId={sessionId} socket={socket} />
            </>}

        </div>
    );
}

export default Canvas;