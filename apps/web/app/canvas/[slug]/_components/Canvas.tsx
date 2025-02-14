'use client'
import { initDraw, Shape } from "@/lib/draw";
import { useEffect, useRef } from "react";

const Canvas = ({ sendMessage, roomShapes }: { sendMessage: (message: string) => void, roomShapes: Shape[] }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false);

    useEffect(() => {
        if (canvasRef.current) {
            initDraw(canvasRef.current,roomShapes,sendMessage);
        }
    }, [canvasRef])

    return (
        <div className="w-screen h-screen relative overflow-hidden">
            <canvas ref={canvasRef} width={5000} height={5000} className="absolute inset-0" />
        </div>
    );
}

export default Canvas;