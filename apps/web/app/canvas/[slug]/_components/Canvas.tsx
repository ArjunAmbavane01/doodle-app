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
            const canvasWidth = 3000;
            const canvasHeight = 3000;
            canvas.width = canvasWidth * dpr;
            canvas.height = canvasHeight * dpr;
            canvas.style.width = `${canvasWidth}px`;
            canvas.style.height = `${canvasHeight}px`;
        }
    }, []);

    return (
        <div className="w-screen h-screen relative overflow-hidden" id="canvas-container" onTouchMove={(e) => { if (e.touches.length === 1) e.preventDefault()}}>
            <canvas ref={canvasRef} width={3000} height={3000} className="absolute inset-0 touch-none" />
            <div id="textarea-container" />
            {
                canvasGame && socket &&
                <>
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
                </>
            }
        </div>
    );
}

export default Canvas;