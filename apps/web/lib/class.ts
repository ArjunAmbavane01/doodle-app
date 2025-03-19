import { RoomShape } from "@workspace/common/shapes";

export interface IRoomUserPos {
  posX: number;
  posY: number;
  displayName?: string;
}

export interface IUserAction {
  type: "add" | "delete" | "move";
  roomShape: RoomShape;
  prevShape?: RoomShape;
}

class DrawingEngine {
  private canvas: HTMLCanvasElement;
  private socket: WebSocket;
  private userId: string;
  private ctx: CanvasRenderingContext2D;
  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, socket: WebSocket, userId: string) {
    this.canvas = canvas;
    this.socket = socket;
    this.userId = userId;
    this.ctx = this.canvas.getContext("2d", {
      willReadFrequently: true,
    }) as CanvasRenderingContext2D;
    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;
    this.offscreenCanvas = offscreenCanvas;
    this.offscreenCtx = offscreenCanvas.getContext(
      "2d"
    ) as CanvasRenderingContext2D;
  }
}
