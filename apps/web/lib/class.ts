import { RoomShape } from "@workspace/common/shapes";
import { clearCanvas, getShapesFromMessages } from "./draw/canvasUtils";
import { IRoomChat } from "@workspace/common/schemas";
import { SelectedToolType } from "@/app/canvas/[slug]/_components/Canvas";

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

  private roomShapes: RoomShape[];

  private selectedTool = "pen";
  private strokeColour = "#ffffff";
  private strokeWidth = 2;
  private fillColour = "transparent";
  private fontSize = 24;
  private fontFamily = "Caveat";
  private textColour = "#ffffff";
  private textStyle = { bold: false, italic: false };

  constructor( canvas: HTMLCanvasElement, socket: WebSocket, userId: string, initialMessages: IRoomChat[]) {
    this.canvas = canvas;
    this.socket = socket;
    this.userId = userId;
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true, }) as CanvasRenderingContext2D;
    this.roomShapes = getShapesFromMessages(initialMessages);

    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;
    this.offscreenCanvas = offscreenCanvas;
    this.offscreenCtx = offscreenCanvas.getContext("2d") as CanvasRenderingContext2D;

    this.initHandlers();
  }

  private renderPersistentShapes = () =>
    clearCanvas(this.roomShapes, this.offscreenCanvas, this.offscreenCtx);

  private initHandlers() {
    this.canvas.addEventListener("mousedown", handleMouseDown);
    this.canvas.addEventListener("mousemove", handleMouseMove);
    this.canvas.addEventListener("mouseup", handleMouseUp);
    this.canvas.addEventListener("mouseleave", handleMouseLeave);
    this.canvas.addEventListener("wheel", handleCanvasScroll);
    this.socket.addEventListener("message", handleMessage);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("redo", handleRedo);
    window.addEventListener("undo", handleUndo);
    window.addEventListener("zoomIn", handleZoomIn);
    window.addEventListener("zoomOut", handleZoomOut);
    window.addEventListener("zoomReset", handleZoomReset);
    window.addEventListener("strokeColourChange", handleStrokeColourChange);
    window.addEventListener("bgColourChange", handleBGColourChange);
    window.addEventListener("fontFamilyChange", handleFontFamilyChange);
    window.addEventListener("fontSizeChange", handleFontSizeChange);
    window.addEventListener("textColorChange", handleTextColorChange);
    window.addEventListener("textStyleChange", handleTextStyleChange);
    window.addEventListener("penWidthChange", handlePenWidthChange);
  }

  selectTool(tool:SelectedToolType){
    this.selectedTool = tool;
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", handleMouseDown);
    this.canvas.removeEventListener("mousemove", handleMouseMove);
    this.canvas.removeEventListener("mouseup", handleMouseUp);
    this.canvas.removeEventListener("mouseleave", handleMouseLeave);
    this.canvas.removeEventListener("wheel", handleCanvasScroll);
    this.socket.removeEventListener("message", handleMessage);
    window.removeEventListener("redo", handleRedo);
    window.removeEventListener("undo", handleUndo);
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("zoomIn", handleZoomIn);
    window.removeEventListener("zoomOut", handleZoomOut);
    window.removeEventListener("zoomReset", handleZoomReset);
    window.removeEventListener("strokeColourChange", handleStrokeColourChange);
    window.removeEventListener("bgColourChange", handleBGColourChange);
    window.removeEventListener("fontFamilyChange", handleFontFamilyChange);
    window.removeEventListener("fontSizeChange", handleFontSizeChange);
    window.removeEventListener("textColorChange", handleTextColorChange);
    window.removeEventListener("textStyleChange", handleTextStyleChange);
    window.removeEventListener("penWidthChange", handlePenWidthChange);
  }
}

export default DrawingEngine;
