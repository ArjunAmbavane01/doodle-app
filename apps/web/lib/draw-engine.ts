import { clearCanvas, getShapesFromMessages, setupContext } from "./utils/canvasUtils";
import { createTextArea } from "./utils/textUtils";
import { drawUserCursor, getUserDisplayName } from "./utils/cursorUtils";
import { drawHighlightPoints, drawShape, getBoundingShape, strokeToSVG, translateSVGPath } from "./utils/shapeUtils";
import { HighlightPoint, Point, RoomShape, Shape } from "@workspace/common/shapes";
import { IRoomChat, messageSchema } from "@workspace/common/messages";
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

  private selectedTool: SelectedToolType = "pen";
  private strokeColour: string = "#ffffff";
  private strokeWidth: number = 2;
  private fillColour: string = "transparent";
  private fontSize: number = 24;
  private fontFamily: string = "Caveat";
  private textColour: string = "#ffffff";
  private textStyle = { bold: false, italic: false };

  private currentShape: Shape | null = null;
  private currentAiGeneratedShape: Shape | null = null;
  private movedShape: RoomShape | null = null;
  private selectedRoomShape: RoomShape | null = null;
  private zoomChangeTimeout: number | null = null;
  private originalShapePath: string | null = null;

  private isDrawing: boolean = false;
  private isPanning: boolean = false;
  private isDragging: boolean = false;
  private hasMovedSinceMouseDown: boolean = false;
  private mouseMoveThrottle: boolean = false;
  private touchMoveThrottle: boolean = false;

  private startX: number = 0;
  private startY: number = 0;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;
  private panOffsetX: number = -1500;
  private panOffsetY: number = -1500;
  private zoomScale: number = 1;
  private zoomFactor: number = 1.01;
  private zoomOffsetX: number = 0;
  private zoomOffsetY: number = 0;
  private shapeStartX: number = 0;
  private shapeStartY = 0;
  private shapeEndX: number = 0;
  private shapeEndY: number = 0;
  private lastPositionUpdate: number = 0;

  private strokePoints: Point[] = [];
  private highlightPoints: HighlightPoint[] = [];
  private undoStack: IUserAction[] = [];
  private redoStack: IUserAction[] = [];

  private renderQueued = false;

  private roomUsers = new Map<string, { username: string, displayName: string, posX: number, posY: number }>();

  constructor(canvas: HTMLCanvasElement, socket: WebSocket, userId: string, initialMessages: IRoomChat[]) {
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

    setupContext(this.ctx);
    setupContext(this.offscreenCtx);

    this.renderPersistentShapes();
    this.render();
  }

  private isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  private renderPersistentShapes = () => clearCanvas(this.roomShapes, this.offscreenCanvas, this.offscreenCtx);

  private render = () => {

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "#0C0C0C";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const scaledWidth = this.canvas.width * this.zoomScale;
    const scaledHeight = this.canvas.height * this.zoomScale;
    this.zoomOffsetX = (scaledWidth - this.canvas.width) / 2;
    this.zoomOffsetY = (scaledHeight - this.canvas.height) / 2;
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.scale(this.zoomScale, this.zoomScale);
    this.ctx.translate(-centerX, -centerY);
    this.ctx.translate(this.panOffsetX + this.zoomOffsetX, this.panOffsetY + this.zoomOffsetY);

    // copy all shapes from bg canvas to main canvas
    this.ctx.drawImage(this.offscreenCanvas, 0, 0);

    // draw collaborator cursors
    this.roomUsers.forEach((user, userId) => drawUserCursor(user, userId, this.ctx));
    // draw selected shape 
    if (this.selectedRoomShape && !this.hasMovedSinceMouseDown) drawShape(this.currentShape as Shape, this.ctx, true);
    // draw current shape that user is drawing
    else if (this.currentShape && this.hasMovedSinceMouseDown) drawShape(this.currentShape, this.ctx, this.selectedRoomShape != null);
    // draw highlighter points that user is drawing
    if (this.highlightPoints.length !== 0) drawHighlightPoints(this.highlightPoints, this.ctx, this.socket, this.userId);
    this.ctx.restore();
  };

  private debouncedRender = () => {
    if (this.renderQueued) return;
    this.renderQueued = true;

    requestAnimationFrame(() => {
      this.render();
      this.renderQueued = false;
    });
  };

  private getCanvasPoint = (clientX: number, clientY: number) => {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    const canvasX = (clientX - rect.left) * scaleX;
    const canvasY = (clientY - rect.top) * scaleY;

    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    const x = (canvasX - centerX) / this.zoomScale + centerX - this.panOffsetX - this.zoomOffsetX;
    const y = (canvasY - centerY) / this.zoomScale + centerY - this.panOffsetY - this.zoomOffsetY;

    return { x, y };
  };

  private handleMessage = (event: MessageEvent) => {
    try {
      const receivedData = JSON.parse(event.data);
      const result = messageSchema.safeParse(receivedData);
      if (result.error) {
        console.error(`Invalid message format : ${result.error}`);
        return;
      }
      const msg = result.data;
      switch (msg.type) {
        case "collaborator_joined": {
          const { userId, username } = msg;
          const displayName = getUserDisplayName(userId) || "collaborator";
          this.roomUsers.set(userId, { username, displayName, posX: 0, posY: 0 });
          window.dispatchEvent(new CustomEvent('collaboratorJoined', { detail: { userId, username, displayName } }))
          this.render();
          return;
        }
        case "collaborator_left": {
          const { userId } = msg;
          this.roomUsers.delete(userId);
          window.dispatchEvent(new CustomEvent('collaboratorLeft', { detail: { userId } }))
          this.render();
          return;
        }
        case "collaborator_pos": {
          const { userId, posX, posY } = msg;
          const roomUser = this.roomUsers.get(userId);
          if (roomUser) {
            roomUser.posX = posX;
            roomUser.posY = posY;
          }
          this.render();
          return;
        }
        case "chat": {
          const recievedShape: Shape = JSON.parse(msg.message);
          if (recievedShape.type === "highlighter") {
            const shapeWithUser = { userId: msg.userId, shape: recievedShape };
            this.roomShapes.push(shapeWithUser);
            this.renderPersistentShapes();
            this.roomShapes.pop();
          } else {
            const shapeWithUser = { userId: msg.userId, shape: recievedShape };
            this.roomShapes.push(shapeWithUser);
            this.renderPersistentShapes();
          }
          this.render();
          break;
        }
        case "remove_shape": {
          const shapeWithUser = { userId: msg.userId, shape: JSON.parse(msg.message) };
          const index = this.roomShapes.findIndex((roomShape: RoomShape) => JSON.stringify(roomShape) === JSON.stringify(shapeWithUser));
          if (index !== -1) {
            this.roomShapes.splice(index, 1);
            this.renderPersistentShapes();
            this.render();
          }
          break;
        }
        case "move_shape": {
          const { prevShape, newShape } = msg.message;
          const shapeWithUser = { userId: msg.userId, shape: JSON.parse(prevShape) };
          const index = this.roomShapes.findIndex((roomShape: RoomShape) => JSON.stringify(roomShape) === JSON.stringify(shapeWithUser));
          if (index !== -1) {
            this.roomShapes[index] = { userId: msg.userId, shape: JSON.parse(newShape) };
            this.renderPersistentShapes();
            this.render();
          }
        }
      }

    } catch (error) { console.error("Error parsing message:", error); }
  };

  private handleMouseDown = (e: MouseEvent | TouchEvent) => {
    const clientX = (e instanceof TouchEvent) ? e.touches[0]?.clientX as number : e.clientX;
    const clientY = (e instanceof TouchEvent) ? e.touches[0]?.clientY as number : e.clientY;
    const { x, y } = this.getCanvasPoint(clientX, clientY);
    if (this.selectedTool === "pan") {
      this.isPanning = true;
      this.lastMouseX = clientX;
      this.lastMouseY = clientY;
      this.canvas.style.cursor = "grabbing";
      return;
    } else if (this.selectedTool === "selection") {
      const { roomShape: boundingShape, index } = getBoundingShape(x, y, this.roomShapes, this.ctx);
      if (boundingShape) {
        this.selectedRoomShape = boundingShape;
        this.currentShape = boundingShape.shape as Shape;
        switch (this.currentShape.type) {
          case "rectangle": {
            this.shapeStartX = this.currentShape.startX;
            this.shapeStartY = this.currentShape.startY;
            break;
          }
          case "triangle": {
            this.shapeStartX = this.currentShape.startX;
            this.shapeStartY = this.currentShape.startY;
            break;
          }
          case "circle": {
            this.shapeStartX = this.currentShape.centerX;
            this.shapeStartY = this.currentShape.centerY;
            break;
          }
          case "line": {
            this.shapeStartX = this.currentShape.startX;
            this.shapeStartY = this.currentShape.startY;
            this.shapeEndX = this.currentShape.endX;
            this.shapeEndY = this.currentShape.endY;
            break;
          }
          case "arrow": {
            this.shapeStartX = this.currentShape.startX;
            this.shapeStartY = this.currentShape.startY;
            this.shapeEndX = this.currentShape.endX;
            this.shapeEndY = this.currentShape.endY;
            break;
          }
          case "text": {
            this.shapeStartX = this.currentShape.startX;
            this.shapeStartY = this.currentShape.startY;
            break;
          }
          case "pen": {
            this.originalShapePath = this.currentShape.path;
            const match = this.originalShapePath.match(/M\s+(\d+\.?\d*)\s+(\d+\.?\d*)/);
            if (match) {
              this.shapeStartX = parseFloat(match[1] as string);
              this.shapeStartY = parseFloat(match[2] as string);
            }
            break;
          }
          case "genAI": {
            this.originalShapePath = this.currentShape.svgPath;
            this.shapeStartX = this.currentShape.startX;
            this.shapeStartY = this.currentShape.startY;
            break;
          }
        }
        if (index !== -1) this.roomShapes.splice(index, 1);
        this.movedShape = boundingShape;
        this.startX = x;
        this.startY = y;
        this.isDragging = true;
      } else {
        this.selectedRoomShape = null;
      }
      this.renderPersistentShapes();
      this.render();
    } else if (this.selectedTool === "genAI") {
      this.startX = x;
      this.startY = y;
      this.isDrawing = true;
      this.hasMovedSinceMouseDown = false;
    } else {
      this.startX = x;
      this.startY = y;
      this.isDrawing = true;
      this.hasMovedSinceMouseDown = false;
      const existingTextArea = document.querySelector(".canvas-text");
      if (existingTextArea) {
        this.handleBlur(existingTextArea as HTMLTextAreaElement);
        return;
      }
      if (this.selectedTool === "highlighter") {
        this.highlightPoints = [];
        this.highlightPoints.push({ x: this.startX, y: this.startY, timestamp: Date.now() });
      }
      if (this.selectedTool === "pen") {
        this.strokePoints.push({ x: this.startX, y: this.startY });
        this.currentShape = { type: "pen", path: `M ${this.startX} ${this.startY}`, strokeColour: this.strokeColour, strokeWidth: this.strokeWidth };
      } else if (this.selectedTool === "text") {
        e.preventDefault();
        e.stopPropagation();
        const textAreaElem = createTextArea(e, this.startX, this.startY, this.fontSize, this.fontFamily, this.textColour, this.textStyle);
        const textAreaContainer = document.getElementById('textarea-container');
        if (textAreaContainer) textAreaContainer.appendChild(textAreaElem);
        textAreaElem.focus();
        textAreaElem.addEventListener("blur", () => this.handleBlur(textAreaElem), { once: true, });
        textAreaElem.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            textAreaElem.blur();
          }
        });
        textAreaElem.addEventListener("mousedown", (e) => e.stopPropagation());
      }
    }
  };

  private handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (e instanceof TouchEvent) {
      if (this.mouseMoveThrottle) return;

      this.mouseMoveThrottle = true;
      const touch = e.touches[0];
      if (!touch) return;

      const touchData = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        timestamp: Date.now()
      };

      requestAnimationFrame(() => {
        this.processMouseMove(touchData);
        this.mouseMoveThrottle = false;
      });
    } else {
      this.processMouseMove(e);
    }
  };

  private processMouseMove = (e: MouseEvent | TouchEvent | { clientX: number, clientY: number, timestamp?: number }) => {

    const clientX = 'touches' in e ? (e.touches[0]?.clientX as number) : e.clientX;
    const clientY = 'touches' in e ? (e.touches[0]?.clientY as number) : e.clientY;

    const { x, y } = this.getCanvasPoint(clientX, clientY);

    const now = Date.now();
    if (now - this.lastPositionUpdate > 100) {
      this.socket.send(JSON.stringify({ type: 'user_pos', posX: x, posY: y }));
      this.lastPositionUpdate = now;
    }

    if (this.isPanning) {
      const deltaX = clientX - this.lastMouseX;
      const deltaY = clientY - this.lastMouseY;
      this.panOffsetX += deltaX;
      this.panOffsetY += deltaY;
      this.lastMouseX = clientX;
      this.lastMouseY = clientY;
      this.render();
      return;
    }

    const currentX = x;
    const currentY = y;

    if (!this.isDrawing && !this.isDragging) return;

    const width = currentX - this.startX;
    const height = currentY - this.startY;

    if (!this.hasMovedSinceMouseDown && (Math.abs(currentX - this.startX) > 2 || Math.abs(currentY - this.startY) > 2)) {
      this.hasMovedSinceMouseDown = true;
    }

    if (!this.hasMovedSinceMouseDown) return;

    if (this.isDragging) {
      const deltaX = x - this.startX;
      const deltaY = y - this.startY;
      this.processDragShape(deltaX, deltaY);
    } else if (this.isDrawing) this.processDrawShape(currentX, currentY, width, height);

    if (this.isDrawing || this.isDragging) {
      if (this.isMobileDevice()) this.debouncedRender();
      else this.render();
    }
  };

  private processDragShape(deltaX: number, deltaY: number) {
    if (!this.currentShape) return;

    switch (this.currentShape.type) {
      case "rectangle":
        this.currentShape = {
          ...this.currentShape,
          startX: this.shapeStartX + deltaX,
          startY: this.shapeStartY + deltaY
        };
        break;
      case "circle":
        this.currentShape = {
          ...this.currentShape,
          centerX: this.shapeStartX + deltaX,
          centerY: this.shapeStartY + deltaY
        };
        break;
      case "triangle":
        this.currentShape = {
          ...this.currentShape,
          startX: this.shapeStartX + deltaX,
          startY: this.shapeStartY + deltaY
        };
        break;
      case "line":
        this.currentShape = {
          type: "line",
          startX: this.shapeStartX + deltaX,
          startY: this.shapeStartY + deltaY,
          endX: this.shapeEndX + deltaX,
          endY: this.shapeEndY + deltaY,
          strokeColour: this.strokeColour,
          strokeWidth: this.strokeWidth
        };
        break;
      case "arrow":
        this.currentShape = {
          type: "arrow",
          startX: this.shapeStartX + deltaX,
          startY: this.shapeStartY + deltaY,
          endX: this.shapeEndX + deltaX,
          endY: this.shapeEndY + deltaY,
          strokeColour: this.strokeColour,
          strokeWidth: this.strokeWidth
        };
        break;
      case "text":
        this.currentShape = {
          ...this.currentShape,
          startX: this.shapeStartX + deltaX,
          startY: this.shapeStartY + deltaY
        };
        break;
      case "pen":
        this.currentShape = {
          ...this.currentShape,
          path: translateSVGPath(this.originalShapePath as string, deltaX, deltaY)
        };
        break;
      case "genAI":
        this.currentShape = {
          ...this.currentShape,
          startX: this.shapeStartX + deltaX,
          startY: this.shapeStartY + deltaY,
          svgPath: translateSVGPath(this.originalShapePath as string, deltaX, deltaY)
        };
        break;
    }
  }

  private processDrawShape(currentX: number, currentY: number, width: number, height: number) {
    switch (this.selectedTool) {
      case "pen":
        this.processPenDrawing(currentX, currentY);
        break;
      case "highlighter":
        this.highlightPoints.push({ x: currentX, y: currentY, timestamp: Date.now() });
        break;
      case "line":
        this.currentShape = {
          type: "line",
          startX: this.startX,
          startY: this.startY,
          endX: currentX,
          endY: currentY,
          strokeColour: this.strokeColour,
          strokeWidth: this.strokeWidth
        };
        break;
      case "arrow":
        this.currentShape = {
          type: "arrow",
          startX: this.startX,
          startY: this.startY,
          endX: currentX,
          endY: currentY,
          strokeColour: this.strokeColour,
          strokeWidth: this.strokeWidth
        };
        break;
      case "rectangle":
        this.currentShape = {
          type: "rectangle",
          startX: this.startX,
          startY: this.startY,
          width,
          height,
          strokeColour: this.strokeColour,
          fillColour: this.fillColour,
          strokeWidth: this.strokeWidth
        };
        break;
      case "triangle":
        this.currentShape = {
          type: "triangle",
          startX: this.startX,
          startY: this.startY,
          width,
          height,
          strokeColour: this.strokeColour,
          fillColour: this.fillColour,
          strokeWidth: this.strokeWidth
        };
        break;
      case "circle": {
        const centerX = this.startX + width / 2;
        const centerY = this.startY + height / 2;
        const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
        this.currentShape = {
          type: "circle",
          centerX,
          centerY,
          radius,
          strokeColour: this.strokeColour,
          fillColour: this.fillColour,
          strokeWidth: this.strokeWidth
        };
        break;
      }
      case "genAI":
        this.currentShape = {
          type: "genAI",
          startX: this.startX,
          startY: this.startY,
          width,
          height,
          svgPath: '',
          strokeColour: this.strokeColour,
          strokeWidth: this.strokeWidth
        };
        break;
    }
  }

  private processPenDrawing(currentX: number, currentY: number) {
    if (this.strokePoints.length === 0) {
      this.strokePoints.push({ x: currentX, y: currentY });
      return;
    }

    const lastPoint = this.strokePoints[this.strokePoints.length - 1];
    if (!lastPoint) return;

    const distanceSquared = (currentX - lastPoint.x) ** 2 + (currentY - lastPoint.y) ** 2;
    if (distanceSquared > 9) {
      this.strokePoints.push({ x: currentX, y: currentY });

      if (this.strokePoints.length > 500) {
        this.strokePoints = this.strokePoints.filter((_, i) =>
          i % 3 === 0 || i === this.strokePoints.length - 1
        );
      }
      this.currentShape = {
        type: "pen",
        path: strokeToSVG(this.strokePoints),
        strokeColour: this.strokeColour,
        strokeWidth: this.strokeWidth
      };
    }
  }

  private handleMouseUp = (e: MouseEvent | TouchEvent) => {
    const clientX = (e instanceof TouchEvent) ? e.touches[0]?.clientX as number : e.clientX;
    const clientY = (e instanceof TouchEvent) ? e.touches[0]?.clientY as number : e.clientY;
    
    if (this.isPanning) {
      this.isPanning = false;
      this.canvas.style.cursor = "grab";
      return;
    }
    
    if (this.isDragging && this.currentShape && this.movedShape) {
      const newRoomShape = { userId: this.movedShape.userId, shape: this.currentShape };
      this.roomShapes.push(newRoomShape);
      // to make prevShape null if shape was not dragged
      if (JSON.stringify(this.currentShape) === JSON.stringify(this.selectedRoomShape?.shape)) this.movedShape = null;
      else {
        this.undoStack.push({ type: "move", roomShape: newRoomShape, prevShape: this.movedShape });
        this.socket.send(JSON.stringify({
          type: "move_shape", userId: this.movedShape.userId, message: {
            prevShape: JSON.stringify(this.movedShape.shape),
            newShape: JSON.stringify(newRoomShape.shape),
          }
        }));
      }
      this.isDragging = false;
      this.originalShapePath = null;
      this.renderPersistentShapes();
      this.render();
      return;
    } else if (this.isDrawing) {
      if (!this.hasMovedSinceMouseDown && this.selectedTool === "pen") {
        const rect = this.canvas.getBoundingClientRect();
        const { x, y } = this.getCanvasPoint(clientX, clientY);
        const currentX = x - rect.left; const currentY = y - rect.top;

        this.strokePoints = [{ x: currentX, y: currentY }, { x: currentX + 1, y: currentY + 1 },];
        this.currentShape = { type: "pen", path: strokeToSVG(this.strokePoints), strokeColour: this.strokeColour, strokeWidth: this.strokeWidth };
        const shapeWithUser = { userId: this.userId, shape: this.currentShape };
        this.roomShapes.push(shapeWithUser);
        this.undoStack.push({ type: "add", roomShape: shapeWithUser });
        this.socket.send(JSON.stringify({ type: "chat", userId: this.userId, message: JSON.stringify(this.currentShape) }));
      } else if (this.selectedTool === "genAI") {
        if (this.currentShape) {
          window.dispatchEvent(new CustomEvent("openPrompt", { detail: this.currentShape }));
          this.currentAiGeneratedShape = this.currentShape;
          const shapeWithUser = { userId: this.userId, shape: this.currentAiGeneratedShape };
          this.roomShapes.push(shapeWithUser);
        }
      } else {
        if (this.currentShape) {
          const shapeWithUser = { userId: this.userId, shape: this.currentShape };
          this.roomShapes.push(shapeWithUser);
          this.undoStack.push({ type: "add", roomShape: shapeWithUser });
          this.socket.send(JSON.stringify({ type: "chat", userId: this.userId, message: JSON.stringify(this.currentShape), }));
        }
      }
    }
    this.isDrawing = false;
    this.hasMovedSinceMouseDown = false;
    this.currentShape = null;
    this.selectedRoomShape = null;
    this.strokePoints = [];
    this.renderPersistentShapes();
    this.render();
  };

  private handleMouseLeave = () => {
    if (this.isDrawing) {
      this.currentShape = null;
      this.strokePoints = [];
      this.renderPersistentShapes();
      this.render();
    }
    this.isDrawing = false;
    this.isPanning = false;
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "+") {
      e.preventDefault();
      this.handleZoomIn();
      this.render();
    } else if ((e.ctrlKey || e.metaKey) && e.key === "-") {
      e.preventDefault();
      this.handleZoomOut();
      this.render();
    } else if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      e.preventDefault();
      this.handleUndo();
    } else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
      e.preventDefault();
      this.handleRedo();
    } else {
      switch (e.key) {
        case "Delete": {
          if (this.selectedRoomShape == null) return;
          const shapeToDelete = this.selectedRoomShape;
          this.selectedRoomShape = null;
          this.currentShape = null;
          const index = this.roomShapes.findIndex((roomShape: RoomShape) => JSON.stringify(roomShape) === JSON.stringify(shapeToDelete));
          if (index !== -1) {
            this.roomShapes.splice(index, 1);
            this.undoStack.push({ type: "delete", roomShape: { userId: shapeToDelete.userId, shape: shapeToDelete.shape } });
          }
          this.renderPersistentShapes();
          this.render();
          this.socket.send(JSON.stringify({ type: "delete_shape", message: JSON.stringify(shapeToDelete.shape), }));
          break;
        }
        case "h": {
          this.selectedTool = "pan";
          this.selectedRoomShape = null;
          window.dispatchEvent(new CustomEvent("toolChangeFromKeyboard", { detail: "pan" }));
          break;
        }
        case "s": {
          this.selectedTool = "selection";
          window.dispatchEvent(new CustomEvent("toolChangeFromKeyboard", { detail: "selection" }));
          break;
        }
        case "r": {
          this.selectedTool = "rectangle";
          this.selectedRoomShape = null;
          window.dispatchEvent(new CustomEvent("toolChangeFromKeyboard", { detail: "rectangle" }));
          break;
        }
        case "c": {
          this.selectedTool = "circle";
          this.selectedRoomShape = null;
          window.dispatchEvent(new CustomEvent("toolChangeFromKeyboard", { detail: "circle" }));
          break;
        }
        case "t": {
          this.selectedTool = "triangle";
          this.selectedRoomShape = null;
          window.dispatchEvent(new CustomEvent("toolChangeFromKeyboard", { detail: "triangle" }));
          break;
        }
        case "p": {
          this.selectedTool = "pen";
          this.selectedRoomShape = null;
          window.dispatchEvent(new CustomEvent("toolChangeFromKeyboard", { detail: "pen" }));
          break;
        }
        case "l": {
          this.selectedTool = "line";
          this.selectedRoomShape = null;
          window.dispatchEvent(new CustomEvent("toolChangeFromKeyboard", { detail: "line" }));
          break;
        }
        case "a": {
          this.selectedTool = "arrow";
          this.selectedRoomShape = null;
          window.dispatchEvent(new CustomEvent("toolChangeFromKeyboard", { detail: "arrow" }));
          break;
        }
        case "w": {
          this.selectedTool = "text";
          this.selectedRoomShape = null;
          window.dispatchEvent(new CustomEvent("toolChangeFromKeyboard", { detail: "text" }));
          break;
        }
        case "m": {
          this.selectedTool = "highlighter";
          this.selectedRoomShape = null;
          window.dispatchEvent(new CustomEvent("toolChangeFromKeyboard", { detail: "highlighter" }));
          break;
        }
        case "d": {
          this.selectedTool = "genAI";
          this.selectedRoomShape = null;
          window.dispatchEvent(new CustomEvent("toolChangeFromKeyboard", { detail: "ai" }));
          break;
        }
      }
    }

    this.canvas.style.cursor = this.selectedTool === "pan" ? "grab" : this.selectedTool === "genAI" ? "crosshair" : "default";
  };

  private handleCanvasScroll = (e: WheelEvent) => {
    e.preventDefault();
    const isTrackpadPinch = e.ctrlKey || e.metaKey;
    if (isTrackpadPinch) {
      e.preventDefault();
      const zoomDirection = e.deltaY < 0 ? -1 : 1;
      const dampingFactor = 0.009;
      this.zoomScale *= 1 - dampingFactor * zoomDirection;
      this.zoomScale = Math.max(0.1, Math.min(this.zoomScale, 10));
      if (!this.isPanning) requestAnimationFrame(() => this.render());
      if (this.zoomChangeTimeout) clearTimeout(this.zoomChangeTimeout);
      this.zoomChangeTimeout = window.setTimeout(() => this.notifyZoomComplete(), 10);
    }
    else {
      this.panOffsetX -= e.deltaX;
      this.panOffsetY -= e.deltaY;
      this.render();
    }
  };

  private handleBlur = (textAreaElem: HTMLTextAreaElement) => {
    const text = textAreaElem.value.trim();
    if (text) {
      const canvasX = parseFloat(textAreaElem.dataset.canvasX || "0");
      const canvasY = parseFloat(textAreaElem.dataset.canvasY || "0");

      const newShape: Shape = { type: "text", startX: canvasX, startY: canvasY, text, textColour: this.textColour, fontSize: this.fontSize, textStyle: this.textStyle, fontFamily: this.fontFamily };
      const shapeWithUser: RoomShape = { userId: this.userId, shape: newShape };
      this.roomShapes.push(shapeWithUser);
      this.undoStack.push({ type: "add", roomShape: shapeWithUser });
      this.socket.send(JSON.stringify({ type: "chat", userId: this.userId, message: JSON.stringify(newShape) }));

      this.renderPersistentShapes();
      this.render();
    }
    const textAreaContainer = document.getElementById('textarea-container');
    if (textAreaContainer) textAreaContainer.removeChild(textAreaElem);
  };

  private handleRenderSvg = (e: Event) => {
    if (this.currentAiGeneratedShape?.type == "genAI") {
      const svgPathRecieved = (e as CustomEvent).detail;
      const shapeIndex = this.roomShapes.findIndex((roomShape) => {
        return (roomShape.shape.type === "genAI") && roomShape.shape.svgPath == "";
      });
      const roomShape = this.roomShapes[shapeIndex];
      if (roomShape && roomShape.shape.type === "genAI") {
        roomShape.shape.svgPath = svgPathRecieved;
        this.socket.send(JSON.stringify({ type: "chat", userId: roomShape.userId, message: JSON.stringify(roomShape.shape), }));
        this.undoStack.push({ type: "add", roomShape });
      }
      this.roomShapes = this.roomShapes.filter(roomShape => roomShape.shape.type !== "genAI" || roomShape.shape.svgPath !== "");
      this.currentAiGeneratedShape = null;
      this.renderPersistentShapes();
      this.render();
    }
  }

  private notifyZoomComplete = () => {
    window.dispatchEvent(new CustomEvent("zoomLevelChange", { detail: { zoomLevel: Math.round(this.zoomScale * 100) }, }));
  };

  private handleTouchStart = (e: TouchEvent) => {
    this.handleMouseDown(e);
  };

  private handleTouchMove = (e: TouchEvent) => {
    if (this.mouseMoveThrottle) return;

    this.mouseMoveThrottle = true;

    const touch = e.touches[0];
    if (!touch) return;

    const touchData = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      timestamp: Date.now()
    };

    requestAnimationFrame(() => {
      this.processMouseMove(touchData);
      this.mouseMoveThrottle = false;
    });
  };

  private handleTouchEnd = (e: TouchEvent) => {
    this.handleMouseUp(e);
  };

  private handleTouchCancel = (e: TouchEvent) => {
    this.handleMouseLeave();
  };


  private initHandlers() {
    this.canvas.addEventListener("mousedown", this.handleMouseDown);
    this.canvas.addEventListener("mousemove", this.handleMouseMove);
    this.canvas.addEventListener("mouseup", this.handleMouseUp);
    this.canvas.addEventListener("mouseleave", this.handleMouseLeave);
    this.canvas.addEventListener("wheel", this.handleCanvasScroll);

    this.socket.addEventListener("message", this.handleMessage);

    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("redo", this.handleRedo);
    window.addEventListener("undo", this.handleUndo);
    window.addEventListener("zoomIn", this.handleZoomIn);
    window.addEventListener("zoomOut", this.handleZoomOut);
    window.addEventListener("zoomReset", this.handleZoomReset);
    window.addEventListener("renderSvg", this.handleRenderSvg);

    // events for mobile
    this.canvas.addEventListener('touchstart', this.handleTouchStart);
    this.canvas.addEventListener('touchmove', this.handleTouchMove);
    this.canvas.addEventListener('touchend', this.handleTouchEnd);
    this.canvas.addEventListener('touchcancel', this.handleTouchCancel);
  }

  // Public Handlers

  public onToolSelect = (tool: SelectedToolType) => {
    this.selectedTool = tool;
    this.selectedRoomShape = null;
    this.canvas.style.cursor = this.selectedTool === "pan" ? "grab" : this.selectedTool === "genAI" ? "crosshair" : "default";
  }

  public handleUndo = () => {
    if (this.undoStack.length === 0) return;
    try {
      const lastAction = this.undoStack.pop();
      if (!lastAction) return;
      if (lastAction.type === "add") {
        const index = this.roomShapes.findIndex((roomShape: RoomShape) => JSON.stringify(roomShape) === JSON.stringify(lastAction.roomShape));
        if (index !== -1) this.roomShapes.splice(index, 1);
        this.redoStack.push({ type: "delete", roomShape: lastAction.roomShape });
        this.socket.send(JSON.stringify({ type: "delete_shape", message: JSON.stringify(lastAction.roomShape.shape), }));
      } else if (lastAction.type === "delete") {
        const { roomShape } = lastAction;
        this.roomShapes.push(roomShape);
        this.redoStack.push({ type: "add", roomShape });
        this.socket.send(JSON.stringify({ type: "chat", userId: roomShape.userId, message: JSON.stringify(roomShape.shape), }));
      } else if (lastAction.type === "move" && lastAction.prevShape) {
        this.selectedRoomShape = null;
        this.currentShape = null;
        const { prevShape, roomShape } = lastAction;
        const newShape = prevShape;
        const index = this.roomShapes.findIndex((roomShape: RoomShape) => JSON.stringify(roomShape) === JSON.stringify(lastAction.roomShape));
        if (index !== -1) this.roomShapes.splice(index, 1);
        this.roomShapes.push(newShape);

        this.redoStack.push({ type: "move", roomShape: newShape, prevShape: roomShape });
        this.socket.send(JSON.stringify({
          type: "move_shape", userId: prevShape.userId, message: {
            prevShape: JSON.stringify(newShape.shape),
            newShape: JSON.stringify(prevShape.shape),
          }
        }));
      }
      this.renderPersistentShapes();
      this.render();
    } catch (e) {
      console.error("Some error occurred : " + e);
    }
  };

  public handleRedo = () => {
    if (this.redoStack.length === 0) return;
    try {
      const lastAction = this.redoStack.pop();
      if (!lastAction) return;
      const { roomShape } = lastAction;
      if (lastAction.type === "delete") {
        this.roomShapes.push(roomShape);
        this.undoStack.push({ type: "add", roomShape });
        this.socket.send(JSON.stringify({ type: "chat", userId: roomShape.userId, message: JSON.stringify(roomShape.shape), }));
      } else if (lastAction.type === "add") {
        const index = this.roomShapes.findIndex((roomShape: RoomShape) => JSON.stringify(roomShape) === JSON.stringify(lastAction.roomShape));
        if (index !== -1) this.roomShapes.splice(index, 1);
        this.undoStack.push({ type: "add", roomShape: lastAction.roomShape });
        this.socket.send(JSON.stringify({ type: "delete_shape", message: JSON.stringify(lastAction.roomShape.shape), }));
      } else if (lastAction.type === "move" && lastAction.prevShape) {
        this.selectedRoomShape = null;
        this.currentShape = null;
        const { prevShape, roomShape } = lastAction;
        const newShape = prevShape;
        const index = this.roomShapes.findIndex((roomShape: RoomShape) => JSON.stringify(roomShape) === JSON.stringify(lastAction.roomShape));
        if (index !== -1) this.roomShapes.splice(index, 1);
        this.roomShapes.push(newShape);

        this.undoStack.push({ type: "move", roomShape: newShape, prevShape: roomShape });
        this.socket.send(JSON.stringify({
          type: "move_shape", userId: prevShape.userId, message: {
            prevShape: JSON.stringify(newShape.shape),
            newShape: JSON.stringify(prevShape.shape),
          }
        }));
      }

      this.renderPersistentShapes();
      this.render();
    } catch (e) {
      console.error("Some error occurred : " + e);
    }
  };

  public handleZoomIn = () => {
    this.zoomScale = Math.min(this.zoomScale * (this.zoomFactor + 0.02), 10);
    this.notifyZoomComplete();
    this.render();
  };

  public handleZoomOut = () => {
    this.zoomScale = Math.max(this.zoomScale / (this.zoomFactor + 0.02), 0.1);
    this.notifyZoomComplete();
    this.render();
  };

  public handleZoomReset = () => {
    this.zoomScale = 1;
    this.notifyZoomComplete();
    this.render();
  }

  public selectStrokeColour = (strokeColor: string) => this.strokeColour = strokeColor

  public selectFillColour = (fillColor: string) => this.fillColour = fillColor

  public selectFontFamily = (fontFamily: string) => this.fontFamily = fontFamily

  public selectFontSize = (fontSize: number) => this.fontSize = fontSize

  public selectTextColor = (textColor: string) => this.textColour = textColor

  public selectTextStyle = (textStyle: { bold: boolean, italic: boolean }) => this.textStyle = textStyle

  public selectPenWidth = (penWidth: number) => this.strokeWidth = penWidth

  destroy() {
    this.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    this.canvas.removeEventListener("mouseup", this.handleMouseUp);
    this.canvas.removeEventListener("mouseleave", this.handleMouseLeave);
    this.canvas.removeEventListener("wheel", this.handleCanvasScroll);
    this.socket.removeEventListener("message", this.handleMessage);
    window.removeEventListener("redo", this.handleRedo);
    window.removeEventListener("undo", this.handleUndo);
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("zoomIn", this.handleZoomIn);
    window.removeEventListener("zoomOut", this.handleZoomOut);
    window.removeEventListener("zoomReset", this.handleZoomReset);
    window.removeEventListener("renderSvg", this.handleRenderSvg);

    // events for mobile
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);
    this.canvas.removeEventListener('touchcancel', this.handleTouchCancel);
  }
}

export default DrawingEngine;
