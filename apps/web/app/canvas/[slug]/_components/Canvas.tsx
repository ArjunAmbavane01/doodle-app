'use client'
import { IChatMessage } from "@workspace/common/interfaces";
import { useEffect, useRef, useState } from "react";

const Canvas = ({ sendMessage, messages }: { sendMessage: (message: string) => void, messages: IChatMessage[] }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false);

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.fillStyle = 'rgba(0,0,0)'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            let clicked = false;
            let startX = 0;
            let startY = 0;

            canvas.addEventListener('mousedown', (e) => {
                clicked = true
                startX = e.clientX
                startY = e.clientY
            })
            canvas.addEventListener('mouseup', (e) => {
                clicked = false
            })
            canvas.addEventListener('mousemove', (e) => {
                if (clicked) {
                    const width = e.clientX - startX;
                    const height = e.clientY - startY;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = 'rgba(0,0,0)';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.strokeStyle = 'rgba(255,255,255)';
                    ctx.strokeRect(startX, startY, width, height)
                }
            })
        }
    }, [canvasRef])

    return (
        <div className="w-screen h-screen relative overflow-hidden">
            <canvas ref={canvasRef} width={5000} height={5000} className="absolute inset-0" />
        </div>
    );
}

export default Canvas;