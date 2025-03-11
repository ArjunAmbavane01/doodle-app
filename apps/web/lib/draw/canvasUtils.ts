import { IRoomChat } from "@workspace/common/schemas";
import { RoomShape, Shape } from "@workspace/common/shapes";
import { drawShape, getBoundingBoxFromPath } from "./shapeUtils";

export const clearCanvas = ( roomShapes: RoomShape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#0C0C0C";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  roomShapes.forEach((roomShape: RoomShape) => {
    if (!roomShape.shape) return;
    drawShape(roomShape.shape, ctx);
  });
};

export const getShapesFromMessages = (messages: IRoomChat[]) =>
  messages.map((msg: { userId: string; message: string }) => {
    return { userId: msg.userId, shape: JSON.parse(msg.message) };
  });

export const setupContext = (ctx: CanvasRenderingContext2D) => {
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.font = `${24 * window.devicePixelRatio}px Caveat`;
  ctx.strokeStyle = "#ffffff";
};
