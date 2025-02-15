import { IChatMessage } from "@workspace/common/interfaces";
import { useRef, useState } from "react";

export type Shape =
  | { type: "rectangle"; startX: number; startY: number; width: number; height: number;}
  | { type: "circle"; centerX: number; centerY: number; radius: number };

export const initDraw = ( canvas: HTMLCanvasElement, socket: WebSocket, roomMessages: IChatMessage[]) => {
  const roomShapes = getShapesFromMessages(roomMessages);
//   const roomShapes = shapesRef.current;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  socket.onmessage = (event) => {
    try {
      const receivedData = JSON.parse(event.data);
      if (receivedData.type === "chat") {
        const newShape: Shape = JSON.parse(receivedData.message);
        roomShapes.push(newShape)
        clearCanvas(roomShapes, canvas, ctx);
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  };

  clearCanvas(roomShapes, canvas, ctx);

  let clicked = false;
  let startX = 0;
  let startY = 0;

  canvas.addEventListener("mousedown", (e) => {
    clicked = true;
    startX = e.clientX;
    startY = e.clientY;
  });
  canvas.addEventListener("mouseup", (e) => {
    clicked = false;
    const newShape = {
      type: "rectangle",
      startX,
      startY,
      width: e.clientX - startX,
      height: e.clientY - startY,
    } as Shape;
    roomShapes.push(newShape);
    if (socket) socket.send(JSON.stringify({ type: "chat", message:JSON.stringify(newShape) }));

  });
  canvas.addEventListener("mousemove", (e) => {
    if (clicked) {
      clearCanvas(roomShapes, canvas, ctx);
      const width = e.clientX - startX;
      const height = e.clientY - startY;
      ctx.strokeStyle = "rgba(255,255,255)";
      ctx.strokeRect(startX, startY, width, height);
    }
  });
};

export const clearCanvas = (roomShapes: Shape[],canvas: HTMLCanvasElement,ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0,0,0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  roomShapes.map((shape: Shape) => {
    if (shape.type === "rectangle") {
      ctx.strokeStyle = "rgba(255,255,255)";
      ctx.strokeRect(shape.startX, shape.startY, shape.width, shape.height);
    }
  });
};

export const getShapesFromMessages = (messages: IChatMessage[]) => messages.map((msg: { message: string }) => JSON.parse(msg.message));

