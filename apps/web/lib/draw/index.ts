import { SelectedToolType } from "@/app/canvas/[slug]/_components/Canvas";
import { IRoomChat, messageSchema } from "@workspace/common/messages";
import { Shape, HighlightPoint, Point, RoomShape } from "@workspace/common/shapes";
import { clearCanvas, getShapesFromMessages, setupContext } from "./canvasUtils";
import { drawHighlightPoints, drawShape, getBoundingShape, strokeToSVG, translateSVGPath } from "./shapeUtils";
import { cleanupTextArea, createTextArea } from "./textUtils";
import { drawUserCursor } from "./cursorUtils";

export interface IRoomUserPos { posX: number, posY: number, displayName?: string };

export interface IUserAction { type: "add" | "delete" | "move", roomShape: RoomShape, prevShape?: RoomShape }

export const initDraw = (canvas: HTMLCanvasElement, socket: WebSocket, initialMessages: IRoomChat[], userId: string) => {
  const roomShapes: RoomShape[] = getShapesFromMessages(initialMessages);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return () => { };

  let selectedTool = "pen";
  let strokeColour = "#ffffff";
  let strokeWidth = 2;
  let fillColour = "transparent";
  let fontSize = 24;
  let fontFamily = "Caveat";
  let textColour = "#ffffff";
  let textStyle = { bold: false, italic: false };

  let currentShape: Shape | null = null;
  let movedShape: RoomShape | null = null;
  let selectedRoomShape: RoomShape | null = null;
  let zoomChangeTimeout: number | null = null;
  let originalShapePath: string | null = null;

  let isDrawing = false;
  let isPanning = false;
  let isDragging = false;
  let hasMovedSinceMouseDown = false;

  let startX = 0;
  let startY = 0;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let panOffsetX = -2500;
  let panOffsetY = -2500;
  let zoomScale = 1;
  let zoomFactor = 1.01;
  let zoomOffsetX = 0;
  let zoomOffsetY = 0;
  let shapeStartX = 0;
  let shapeStartY = 0;
  let shapeEndX = 0;
  let shapeEndY = 0;

  let strokePoints: Point[] = [];
  let highlightPoints: HighlightPoint[] = [];
  const undoStack: IUserAction[] = [];
  const redoStack: IUserAction[] = [];

  const roomUsers = new Map<string, { posX: number, posY: number }>();

  setupContext(ctx);

  // this creates background canvas for existing shapes
  const offscreenCanvas = document.createElement("canvas");
  offscreenCanvas.width = canvas.width;
  offscreenCanvas.height = canvas.height;
  const offscreenCtx = offscreenCanvas.getContext("2d");
  if (!offscreenCtx) return () => { };
  setupContext(offscreenCtx);


  const renderPersistentShapes = () => clearCanvas(roomShapes, offscreenCanvas, offscreenCtx);

  // this will render both existing and current shape
  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0C0C0C";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scaledWidth = canvas.width * zoomScale;
    const scaledHeight = canvas.height * zoomScale;
    zoomOffsetX = (scaledWidth - canvas.width) / 2;
    zoomOffsetY = (scaledHeight - canvas.height) / 2;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(zoomScale, zoomScale);
    ctx.translate(-centerX, -centerY);
    ctx.translate(panOffsetX + zoomOffsetX, panOffsetY + zoomOffsetY);

    // copy all shapes from bg canvas to main canvas
    ctx.drawImage(offscreenCanvas, 0, 0);
    roomUsers.forEach((roomUser, roomUserId) => drawUserCursor(roomUser, roomUserId, ctx))
    if (selectedRoomShape && !hasMovedSinceMouseDown) drawShape(currentShape as Shape, ctx, true);
    else if (currentShape && hasMovedSinceMouseDown) drawShape(currentShape, ctx, selectedRoomShape != null);
    if (highlightPoints.length !== 0) drawHighlightPoints(highlightPoints, ctx, socket);
    ctx.restore();
  };

  const getCanvasPoint = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasX = (clientX - rect.left) * scaleX;
    const canvasY = (clientY - rect.top) * scaleY;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const x = (canvasX - centerX) / zoomScale + centerX - panOffsetX - zoomOffsetX;
    const y = (canvasY - centerY) / zoomScale + centerY - panOffsetY - zoomOffsetY;

    return { x, y };
  };

  const handleCanvasScroll = (e: WheelEvent) => {
    e.preventDefault();
    const isTrackpadPinch = e.ctrlKey || Math.abs(e.deltaY) < 10 && (!Number.isInteger(e.deltaX) || !Number.isInteger(e.deltaY));
    if (isTrackpadPinch) {
      e.preventDefault();
      const zoomDirection = e.deltaY < 0 ? -1 : 1;
      const dampingFactor = 0.009;
      zoomScale *= 1 - dampingFactor * zoomDirection;
      zoomScale = Math.max(0.1, Math.min(zoomScale, 10));
      if (!isPanning) requestAnimationFrame(() => render())
      if (zoomChangeTimeout) clearTimeout(zoomChangeTimeout);
      zoomChangeTimeout = window.setTimeout(() => notifyZoomComplete(zoomScale), 10);
    }
    else {
      panOffsetX -= e.deltaX;
      panOffsetY -= e.deltaY;
      render();
    }
  };

  const handleToolChange = (event: Event) => {
    const customEvent = event as CustomEvent<SelectedToolType>;
    if (customEvent.detail) {
      selectedTool = customEvent.detail;
      cleanupTextArea();
      selectedRoomShape = null;
      canvas.style.cursor = selectedTool === "pan" ? "grab" : "default";
    }
  };

  const handleMessage = (event: MessageEvent) => {
    try {
      const receivedData = JSON.parse(event.data);
      const result = messageSchema.safeParse(receivedData);
      if (result.error) {
        console.error(`Invalid message format : ${result.error}`);
        return;
      }
      const msg = result.data;

      if (msg.type === "room_user_pos") {
        const { userId, posX, posY } = msg;
        roomUsers.set(userId, { posX, posY });
        render();
        return;
      } else if (msg.type === "chat") {
        const newShape: Shape = JSON.parse(msg.message);
        if (newShape.type === "highlighter") {
          const path = new Path2D(newShape.svgPath);
          newShape.path = path;
          drawShape(newShape, ctx);
        } else {
          const shapeWithUser = { userId: msg.userId, shape: newShape };
          roomShapes.push(shapeWithUser);
          // if ( msg.userId === userId && !undoStack.some(action => JSON.stringify(action.shape) === JSON.stringify(newShape))){
          //   undoStack.push({type:"add",shape:shapeWithUser});
          // } 
          renderPersistentShapes();
        }
        render();
      } else if (msg.type === "remove_shape") {
        const shapeWithUser = { userId: msg.userId, shape: JSON.parse(msg.message) };
        const index = roomShapes.findIndex((roomShape: RoomShape) => JSON.stringify(roomShape) === JSON.stringify(shapeWithUser));
        if (index !== -1) {
          roomShapes.splice(index, 1);
          renderPersistentShapes();
          render();
        }
      } else if (msg.type === "move_shape") {
        const { prevShape, newShape } = msg.message
        const shapeWithUser = { userId: msg.userId, shape: JSON.parse(prevShape) };
        const index = roomShapes.findIndex((roomShape: RoomShape) => JSON.stringify(roomShape) === JSON.stringify(shapeWithUser));
        if (index !== -1) {
          roomShapes[index] = { userId: msg.userId, shape: JSON.parse(newShape) };
          renderPersistentShapes();
          render();
        }
      }
    } catch (error) { console.error("Error parsing message:", error); }
  };

  const handleMouseDown = (e: MouseEvent) => {
    const { x, y } = getCanvasPoint(e.clientX, e.clientY);
    if (selectedTool === "pan") {
      isPanning = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      canvas.style.cursor = "grabbing";
      return;
    } else if (selectedTool === "selection") {
      const { roomShape: boundingShape, index } = getBoundingShape(x, y, roomShapes, ctx);
      if (boundingShape) {
        selectedRoomShape = boundingShape;
        currentShape = boundingShape.shape as Shape;
        if (currentShape.type === "rectangle") {
          shapeStartX = currentShape.startX;
          shapeStartY = currentShape.startY;
        } else if (currentShape.type === "triangle") {
          shapeStartX = currentShape.startX;
          shapeStartY = currentShape.startY;
        } else if (currentShape.type === "circle") {
          shapeStartX = currentShape.centerX;
          shapeStartY = currentShape.centerY;
        } else if (currentShape.type === "line") {
          shapeStartX = currentShape.startX;
          shapeStartY = currentShape.startY;
          shapeEndX = currentShape.endX;
          shapeEndY = currentShape.endY;
        } else if (currentShape.type === "arrow") {
          shapeStartX = currentShape.startX;
          shapeStartY = currentShape.startY;
          shapeEndX = currentShape.endX;
          shapeEndY = currentShape.endY;
        } else if (currentShape.type === "text") {
          shapeStartX = currentShape.startX;
          shapeStartY = currentShape.startY;
        } else if (currentShape.type === "pen") {
          originalShapePath = currentShape.path;
          const match = originalShapePath.match(/M\s+(\d+\.?\d*)\s+(\d+\.?\d*)/);
          if (match) {
            shapeStartX = parseFloat(match[1] as string);
            shapeStartY = parseFloat(match[2] as string);
          }
        }
        if (index !== -1) roomShapes.splice(index, 1);
        movedShape = boundingShape;
        startX = x;
        startY = y;
        isDragging = true;
      } else {
        selectedRoomShape = null;
      }
      renderPersistentShapes();
      render();
    } else {
      startX = x;
      startY = y;
      isDrawing = true;
      hasMovedSinceMouseDown = false;
      const existingTextArea = document.querySelector(".canvas-text");
      if (existingTextArea) {
        handleBlur(existingTextArea as HTMLTextAreaElement);
        return;
      }
      if (selectedTool === "highlighter") {
        highlightPoints = [];
        highlightPoints.push({ x: startX, y: startY, timestamp: Date.now() });
      }
      if (selectedTool === "pen") {
        strokePoints.push({ x: startX, y: startY });
        currentShape = { type: "pen", path: `M ${startX} ${startY}`, strokeColour, strokeWidth };
      } else if (selectedTool === "text") {
        e.preventDefault();
        e.stopPropagation();
        const textAreaElem = createTextArea(e, startX, startY, fontSize, fontFamily, textColour, textStyle);
        const textAreaContainer = document.getElementById('textarea-container');
        if (textAreaContainer) textAreaContainer.appendChild(textAreaElem);
        textAreaElem.focus();
        textAreaElem.addEventListener("blur", () => handleBlur(textAreaElem), { once: true, });
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

  const handleMouseMove = (e: MouseEvent) => {
    const { x, y } = getCanvasPoint(e.clientX, e.clientY);
    // sends user's position to other users
    socket.send(JSON.stringify({ type: 'user_pos', posX: x, posY: y }));

    if (isPanning) {
      const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;
      panOffsetX += deltaX;
      panOffsetY += deltaY;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      render();
      return;
    }

    const currentX = x;
    const currentY = y;

    const width = currentX - startX;
    const height = currentY - startY;

    if (!hasMovedSinceMouseDown && (Math.abs(currentX - startX) > 2 || Math.abs(currentY - startY) > 2)) hasMovedSinceMouseDown = true;
    if (!hasMovedSinceMouseDown) return;

    if (isDragging) {
      const deltaX = x - startX;
      const deltaY = y - startY;
      if (currentShape && currentShape.type === "rectangle") {
        currentShape = { ...currentShape, startX: shapeStartX + deltaX, startY: shapeStartY + deltaY };
      } else if (currentShape && currentShape.type === "circle") {
        currentShape = { ...currentShape, centerX: shapeStartX + deltaX, centerY: shapeStartY + deltaY };
      } else if (currentShape && currentShape.type === "triangle") {
        currentShape = { ...currentShape, startX: shapeStartX + deltaX, startY: shapeStartY + deltaY };
      }
      else if (currentShape && currentShape.type === "line") {
        currentShape = { type: "line", startX: shapeStartX + deltaX, startY: shapeStartY + deltaY, endX: shapeEndX + deltaX, endY: shapeEndY + deltaY, strokeColour, strokeWidth };
      }
      else if (currentShape && currentShape.type === "arrow") {
        currentShape = { type: "arrow", startX: shapeStartX + deltaX, startY: shapeStartY + deltaY, endX: shapeEndX + deltaX, endY: shapeEndY + deltaY, strokeColour, strokeWidth };
      }
      else if (currentShape && currentShape.type === "text") {
        currentShape = { ...currentShape, startX: shapeStartX + deltaX, startY: shapeStartY + deltaY };
      }
      else if (currentShape && currentShape.type === "pen") {
        currentShape = { ...currentShape, path: translateSVGPath(originalShapePath as string, deltaX, deltaY) };
      }
    } else if (isDrawing) {
      switch (selectedTool) {
        case "pen":
          if (strokePoints.length > 0) {
            const lastPoint = strokePoints[strokePoints.length - 1];
            if (lastPoint && (Math.abs(currentX - lastPoint.x) > 2 || Math.abs(currentY - lastPoint.y) > 2)) {
              strokePoints.push({ x: currentX, y: currentY });
              currentShape = { type: "pen", path: strokeToSVG(strokePoints), strokeColour, strokeWidth };
            }
          }
          break;
        case "highlighter":
          highlightPoints.push({ x: currentX, y: currentY, timestamp: Date.now() });
          break;
        case "line":
          currentShape = { type: "line", startX, startY, endX: currentX, endY: currentY, strokeColour, strokeWidth };
          break;
        case "arrow":
          currentShape = { type: "arrow", startX, startY, endX: currentX, endY: currentY, strokeColour, strokeWidth };
          break;
        case "rectangle":
          currentShape = { type: "rectangle", startX, startY, width, height, strokeColour, fillColour, strokeWidth };
          break;
        case "triangle":
          currentShape = { type: "triangle", startX, startY, width, height, strokeColour, fillColour, strokeWidth };
          break;
        case "circle":
          const centerX = startX + width / 2;
          const centerY = startY + height / 2;
          const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
          currentShape = { type: "circle", centerX, centerY, radius, strokeColour, fillColour, strokeWidth };
          break;
      }
    }
    render();
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (isPanning) {
      isPanning = false;
      canvas.style.cursor = "grab";
      return;
    }
    if (isDragging && currentShape && movedShape) {
      const newRoomShape = { userId: movedShape.userId, shape: currentShape };
      roomShapes.push(newRoomShape);
      // to make prevShape null if shape was not dragged
      if (JSON.stringify(currentShape) === JSON.stringify(selectedRoomShape?.shape)) movedShape = null;
      else {
        undoStack.push({ type: "move", roomShape: newRoomShape, prevShape: movedShape });
        socket.send(JSON.stringify({
          type: "move_shape", userId: movedShape.userId, message: {
            prevShape: JSON.stringify(movedShape.shape),
            newShape: JSON.stringify(newRoomShape.shape),
          }
        }));
      }
      isDragging = false;
      originalShapePath = null;
      renderPersistentShapes();
      render();
      return;
    } else if (isDrawing) {
      if (!hasMovedSinceMouseDown && selectedTool === "pen") {
        const rect = canvas.getBoundingClientRect();
        const { x, y } = getCanvasPoint(e.clientX, e.clientY);
        const currentX = x - rect.left;
        const currentY = y - rect.top;

        strokePoints = [{ x: currentX, y: currentY }, { x: currentX + 1, y: currentY + 1 },];
        currentShape = { type: "pen", path: strokeToSVG(strokePoints), strokeColour, strokeWidth };
        const shapeWithUser = { userId, shape: currentShape };
        roomShapes.push(shapeWithUser);
        undoStack.push({ type: "add", roomShape: shapeWithUser });
        socket.send(JSON.stringify({ type: "chat", userId, message: JSON.stringify(currentShape) }));
      } else {
        if (currentShape) {
          const shapeWithUser = { userId, shape: currentShape };
          roomShapes.push(shapeWithUser);
          undoStack.push({ type: "add", roomShape: shapeWithUser });
          socket.send(JSON.stringify({ type: "chat", userId, message: JSON.stringify(currentShape), }));
        }
      }
    }
    isDrawing = false;
    hasMovedSinceMouseDown = false;
    currentShape = null;
    selectedRoomShape = null;
    strokePoints = [];
    renderPersistentShapes();
    render();
  };

  const handleMouseLeave = () => {
    if (isDrawing) {
      currentShape = null;
      strokePoints = [];
      renderPersistentShapes();
      render();
    }
    isDrawing = false;
    isPanning = false;
  };

  const handleBlur = (textAreaElem: HTMLTextAreaElement) => {
    const text = textAreaElem.value.trim();
    if (text) {
      const canvasX = parseFloat(textAreaElem.dataset.canvasX || "0");
      const canvasY = parseFloat(textAreaElem.dataset.canvasY || "0");

      const newShape: Shape = { type: "text", startX: canvasX, startY: canvasY, text, textColour, fontSize, textStyle, fontFamily };
      const shapeWithUser: RoomShape = { userId, shape: newShape };
      roomShapes.push(shapeWithUser);
      undoStack.push({ type: "add", roomShape: shapeWithUser });
      socket.send(JSON.stringify({ type: "chat", userId, message: JSON.stringify(newShape) }));

      renderPersistentShapes();
      render();
    }
    const textAreaContainer = document.getElementById('textarea-container');
    if (textAreaContainer) textAreaContainer.removeChild(textAreaElem);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    try {
      const lastAction = undoStack.pop();
      if (!lastAction) return;
      if (lastAction.type === "add") {
        const index = roomShapes.findIndex((roomShape: RoomShape) => JSON.stringify(roomShape) === JSON.stringify(lastAction.roomShape));
        if (index !== -1) roomShapes.splice(index, 1);
        redoStack.push({ type: "delete", roomShape: lastAction.roomShape });
        socket.send(JSON.stringify({ type: "delete_shape", message: JSON.stringify(lastAction.roomShape.shape), }));
      } else if (lastAction.type === "delete") {
        const { roomShape } = lastAction
        roomShapes.push(roomShape);
        redoStack.push({ type: "add", roomShape });
        socket.send(JSON.stringify({ type: "chat", userId: roomShape.userId, message: JSON.stringify(roomShape.shape), }));
      } else if (lastAction.type === "move" && lastAction.prevShape) {
        selectedRoomShape = null;
        currentShape = null;
        const { prevShape, roomShape } = lastAction;
        const newShape = prevShape;
        const index = roomShapes.findIndex((roomShape: RoomShape) => JSON.stringify(roomShape) === JSON.stringify(lastAction.roomShape));
        if (index !== -1) roomShapes.splice(index, 1);
        roomShapes.push(newShape);

        redoStack.push({ type: "move", roomShape: newShape, prevShape: roomShape });
        socket.send(JSON.stringify({
          type: "move_shape", userId: prevShape.userId, message: {
            prevShape: JSON.stringify(newShape.shape),
            newShape: JSON.stringify(prevShape.shape),
          }
        }));
      }
      renderPersistentShapes();
      render();
    } catch (e) {
      console.error("Some error occurred : " + e);
    }
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    try {
      const lastAction = redoStack.pop();
      if (!lastAction) return;
      const { roomShape } = lastAction;
      if (lastAction.type === "delete") {
        roomShapes.push(roomShape);
        undoStack.push({ type: "add", roomShape })
        socket.send(JSON.stringify({ type: "chat", userId: roomShape.userId, message: JSON.stringify(roomShape.shape), }));
      } else if (lastAction.type === "add") {
        const index = roomShapes.findIndex((roomShape: RoomShape) => JSON.stringify(roomShape) === JSON.stringify(lastAction.roomShape));
        if (index !== -1) roomShapes.splice(index, 1);
        undoStack.push({ type: "add", roomShape: lastAction.roomShape });
        socket.send(JSON.stringify({ type: "delete_shape", message: JSON.stringify(lastAction.roomShape.shape), }));
      } else if (lastAction.type === "move" && lastAction.prevShape) {
        selectedRoomShape = null;
        currentShape = null;
        const { prevShape, roomShape } = lastAction;
        const newShape = prevShape;
        const index = roomShapes.findIndex((roomShape: RoomShape) => JSON.stringify(roomShape) === JSON.stringify(lastAction.roomShape));
        if (index !== -1) roomShapes.splice(index, 1);
        roomShapes.push(newShape);

        undoStack.push({ type: "move", roomShape: newShape, prevShape: roomShape });
        socket.send(JSON.stringify({
          type: "move_shape", userId: prevShape.userId, message: {
            prevShape: JSON.stringify(newShape.shape),
            newShape: JSON.stringify(prevShape.shape),
          }
        }));
      }

      renderPersistentShapes();
      render();
    } catch (e) {
      console.error("Some error occurred : " + e);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "+") {
      e.preventDefault();
      handleZoomIn();
      render();
    } else if ((e.ctrlKey || e.metaKey) && e.key === "-") {
      e.preventDefault();
      handleZoomOut();
      render();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      e.preventDefault();
      handleUndo();
    } else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
      e.preventDefault();
      handleRedo();
    } else if (e.key === "Delete") {
      if (selectedRoomShape == null) return;
      const shapeToDelete = selectedRoomShape;
      selectedRoomShape = null;
      currentShape = null;
      const index = roomShapes.findIndex((roomShape: RoomShape) => JSON.stringify(roomShape) === JSON.stringify(shapeToDelete));
      if (index !== -1) {
        roomShapes.splice(index, 1);
        undoStack.push({ type: "delete", roomShape: { userId: shapeToDelete.userId, shape: shapeToDelete.shape } });
      }
      renderPersistentShapes();
      render();
      socket.send(JSON.stringify({ type: "delete_shape", message: JSON.stringify(shapeToDelete.shape), }));
    } else if (e.key === "h") {
      selectedTool = "pan";
      selectedRoomShape = null;
      window.dispatchEvent(new CustomEvent("toolChangeFromKeyboard", { detail: "pan" }));
    } else if (e.key === "s") {
      selectedTool = "selection";
      window.dispatchEvent(new CustomEvent("toolChangeFromKeyboard", { detail: "selection" }));
    } else if (e.key === "r") {
      selectedTool = "rectangle";
      selectedRoomShape = null;
      window.dispatchEvent(new CustomEvent("toolChangeFromKeyboard", { detail: "rectangle" }));
    } else if (e.key === "c") {
      selectedTool = "circle";
      selectedRoomShape = null;
      window.dispatchEvent(new CustomEvent("toolChangeFromKeyboard", { detail: "circle" }));
    } else if (e.key === "t") {
      selectedTool = "triangle";
      selectedRoomShape = null;
      window.dispatchEvent(new CustomEvent("toolChangeFromKeyboard", { detail: "triangle" }));
    } else if (e.key === "p") {
      selectedTool = "pen";
      selectedRoomShape = null;
      window.dispatchEvent(new CustomEvent("toolChangeFromKeyboard", { detail: "pen" }));
    } else if (e.key === "l") {
      selectedTool = "line";
      selectedRoomShape = null;
      window.dispatchEvent(new CustomEvent("toolChangeFromKeyboard", { detail: "line" }));
    } else if (e.key === "a") {
      selectedTool = "arrow";
      selectedRoomShape = null;
      window.dispatchEvent(new CustomEvent("toolChangeFromKeyboard", { detail: "arrow" }));
    } else if (e.key === "w") {
      selectedTool = "text";
      selectedRoomShape = null;
      window.dispatchEvent(new CustomEvent("toolChangeFromKeyboard", { detail: "text" }));
    } else if (e.key === "m") {
      selectedTool = "highlighter";
      selectedRoomShape = null;
      window.dispatchEvent(new CustomEvent("toolChangeFromKeyboard", { detail: "highlighter" }));
    }
    canvas.style.cursor = selectedTool === "pan" ? "grab" : "default";
  };

  const handleZoomIn = () => {
    zoomScale = Math.min(zoomScale * (zoomFactor + 0.02), 10);
    notifyZoomComplete(zoomScale);
    render();
  };

  const handleZoomOut = () => {
    zoomScale = Math.max(zoomScale / (zoomFactor + 0.02), 0.1);
    notifyZoomComplete(zoomScale);
    render();
  };

  const handleZoomReset = () => {
    zoomScale = 1;
    notifyZoomComplete(zoomScale);
    render();
  }

  const handleStrokeColourChange = (e: Event) => { strokeColour = (e as CustomEvent).detail }

  const handleBGColourChange = (e: Event) => { fillColour = (e as CustomEvent).detail }

  const handleFontFamilyChange = (e: Event) => { fontFamily = (e as CustomEvent).detail }

  const handleFontSizeChange = (e: Event) => { fontSize = (e as CustomEvent).detail }

  const handleTextColorChange = (e: Event) => { textColour = (e as CustomEvent).detail }

  const handleTextStyleChange = (e: Event) => { textStyle = (e as CustomEvent).detail }

  const handlePenWidthChange = (e: Event) => { strokeWidth = (e as CustomEvent).detail }

  renderPersistentShapes();
  render();

  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseup", handleMouseUp);
  canvas.addEventListener("mouseleave", handleMouseLeave);
  canvas.addEventListener("wheel", handleCanvasScroll);
  socket.addEventListener("message", handleMessage);
  window.addEventListener("toolChange", handleToolChange);
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

  return () => {
    canvas.removeEventListener("mousedown", handleMouseDown);
    canvas.removeEventListener("mousemove", handleMouseMove);
    canvas.removeEventListener("mouseup", handleMouseUp);
    canvas.removeEventListener("mouseleave", handleMouseLeave);
    canvas.removeEventListener("wheel", handleCanvasScroll);
    socket.removeEventListener("message", handleMessage);
    window.removeEventListener("toolChange", handleToolChange);
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
  };
};

const notifyZoomComplete = (zoomScale: number) => {
  window.dispatchEvent(new CustomEvent("zoomLevelChange", { detail: { zoomLevel: Math.round(zoomScale * 100) }, }));
};