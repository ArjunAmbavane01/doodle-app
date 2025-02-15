// index.ts
import { IChatMessage } from "@workspace/common/interfaces";
import { useRef, useState } from "react";

export type Shape =
  | { type: "rectangle"; startX: number; startY: number; width: number; height: number; }
  | { type: "circle"; centerX: number; centerY: number; radius: number };

export const initDraw = (canvas: HTMLCanvasElement, socket: WebSocket, initialMessages: IChatMessage[]) => {
  const roomShapes = getShapesFromMessages(initialMessages);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let isDrawing = false;
  let startX = 0;
  let startY = 0;

  // Debounced render function to prevent unnecessary redraws
  const render = () => {
    clearCanvas(roomShapes, canvas, ctx);
  };

  const handleMessage = (event: MessageEvent) => {
    try {
      const receivedData = JSON.parse(event.data);
      if (receivedData.type === "chat") {
        const newShape: Shape = JSON.parse(receivedData.message);
        roomShapes.push(newShape);
        render();
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    isDrawing = true;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    // Clear and redraw all shapes plus current preview
    clearCanvas(roomShapes, canvas, ctx);
    ctx.strokeStyle = "rgba(255,255,255)";
    ctx.strokeRect(startX, startY, currentX - startX, currentY - startY);
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    const newShape: Shape = {
      type: "rectangle",
      startX,
      startY,
      width: endX - startX,
      height: endY - startY,
    };

    roomShapes.push(newShape);
    socket.send(JSON.stringify({ type: "chat", message: JSON.stringify(newShape) }));
    
    isDrawing = false;
    render();
  };

  const handleMouseLeave = () => {
    if (isDrawing) {
      isDrawing = false;
      render();
    }
  };

  // Initial render
  render();

  // Clean up old listeners if any
  canvas.removeEventListener("mousedown", handleMouseDown);
  canvas.removeEventListener("mousemove", handleMouseMove);
  canvas.removeEventListener("mouseup", handleMouseUp);
  canvas.removeEventListener("mouseleave", handleMouseLeave);
  socket.removeEventListener("message", handleMessage);

  // Add new listeners
  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseup", handleMouseUp);
  canvas.addEventListener("mouseleave", handleMouseLeave);
  socket.addEventListener("message", handleMessage);

  // Return cleanup function
  return () => {
    canvas.removeEventListener("mousedown", handleMouseDown);
    canvas.removeEventListener("mousemove", handleMouseMove);
    canvas.removeEventListener("mouseup", handleMouseUp);
    canvas.removeEventListener("mouseleave", handleMouseLeave);
    socket.removeEventListener("message", handleMessage);
  };
};

export const clearCanvas = (
  roomShapes: Shape[],
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0,0,0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  roomShapes.forEach((shape: Shape) => {
    if (shape.type === "rectangle") {
      ctx.strokeStyle = "rgba(255,255,255)";
      ctx.strokeRect(shape.startX, shape.startY, shape.width, shape.height);
    }
  });
};

export const getShapesFromMessages = (messages: IChatMessage[]) => 
  messages.map((msg: { message: string }) => JSON.parse(msg.message));