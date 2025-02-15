import { selectedShape } from "@/app/canvas/[slug]/_components/Canvas";
import { IChatMessage } from "@workspace/common/interfaces";

export type Shape =
  | {
      type: "rectangle";
      startX: number;
      startY: number;
      width: number;
      height: number;
    }
  | { type: "circle"; centerX: number; centerY: number; radius: number };

export const initDraw = (
  canvas: HTMLCanvasElement,
  socket: WebSocket,
  initialMessages: IChatMessage[],
  currentShape: selectedShape
) => {
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

    const width = currentX - startX;
    const height = currentY - startY;

    // Clear and redraw all shapes
    clearCanvas(roomShapes, canvas, ctx);
    ctx.strokeStyle = "rgba(255,255,255)";
    if (currentShape === "circle") {
      const centerX = startX + width / 2;
      const centerY = startY + height / 2;
      const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();
    }
    if (currentShape === "rectangle") ctx.strokeRect(startX, startY, currentX - startX, currentY - startY);
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!isDrawing) return;
    console.log(currentShape);

    const rect = canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    const width = endX - startX;
    const height = endY - startY;

    let newShape: Shape | null = null;
    
    if (currentShape === "rectangle") {
        newShape = { type: "rectangle", startX, startY, width, height};
    } else if (currentShape === "circle") {
      const centerX = startX + width / 2;
      const centerY = startY + height / 2;
      const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
      newShape = { type: "circle", centerX, centerY, radius };
    }

    roomShapes.push(newShape);
    socket.send(
        JSON.stringify({ type: "chat", message: JSON.stringify(newShape) })
    );
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

  // Clean up old listeners
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
    if(!shape) return
    if (shape.type === "rectangle") {
      ctx.strokeStyle = "rgba(255,255,255)";
      ctx.strokeRect(shape.startX, shape.startY, shape.width, shape.height);
    }
    if (shape.type === "circle") {
      ctx.strokeStyle = "rgba(255,255,255)";
      ctx.beginPath();
      ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();
    }
  });
};

export const getShapesFromMessages = (messages: IChatMessage[]) =>
  messages.map((msg: { message: string }) => JSON.parse(msg.message));
