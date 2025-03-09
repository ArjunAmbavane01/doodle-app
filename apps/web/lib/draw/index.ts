import { SelectedToolType } from "@/app/canvas/[slug]/_components/Canvas";
import { IChatMessage } from "@workspace/common/interfaces";

// THERE IS ISSUE WHILE SELECTING, THE TEXT IS STILL SMALL IN MEASURE TEXT FUNCTION

export type Shape =
  | { type: "pen"; path: string; strokeColour:string; strokeWidth:number  }
  | { type: "highlighter"; path?: Path2D, svgPath?:string; points?: IHighlightPoint[] }
  | { type: "text"; startX: number; startY: number; text: string; textColour:string; fontSize:number; textStyle:{ bold: boolean, italic: boolean }, fontFamily:string }
  | { type: "line"; startX: number; startY: number; endX: number; endY: number; strokeColour:string; strokeWidth:number }
  | { type: "arrow"; startX: number; startY: number; endX: number; endY: number; strokeColour:string; strokeWidth:number }
  | { type: "rectangle"; startX: number; startY: number; width: number; height: number; strokeColour:string; fillColour:string; strokeWidth:number }
  | { type: "triangle"; startX: number; startY: number; width: number; height: number; strokeColour:string; fillColour:string; strokeWidth:number }
  | { type: "circle"; centerX: number; centerY: number; radius: number; strokeColour:string; fillColour:string; strokeWidth:number };

export interface IRoomShape { userId: string, shape: Shape};

export interface IRoomUserPos { posX:number, posY:number, displayName?: string};

export interface IPoint { x: number, y: number};

export interface IHighlightPoint { x: number, y: number, timestamp:number};

export interface IUserAction { type: "add" | "delete" | "move", shape : IRoomShape, prevShape ?: Shape}

export const initDraw = ( canvas: HTMLCanvasElement, socket: WebSocket, initialMessages: IChatMessage[], userId: string) => {
  const roomShapes: IRoomShape[] = getShapesFromMessages(initialMessages);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return () => {};
  
  let selectedTool = "pen";
  let strokeColour = "#ffffff";
  let strokeWidth = 2;
  let fillColour = "transparent";
  let fontSize = 24;
  let fontFamily = "Caveat";
  let textColour = "#ffffff";
  let textStyle = { bold: false, italic: false };

  let currentShape: Shape | null = null;
  let prevMovedShape: Shape | null = null;
  let selectedShape: IRoomShape | null = null;
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

  let strokePoints: IPoint[] = [];
  let highlightPoints: IHighlightPoint[] = [];
  const undoStack: IUserAction[] = [];
  const redoStack: IUserAction[] = [];

  const roomUsers = new Map<string,{ posX:number, posY:number}>();

  setupContext(ctx);

  // this creates background canvas for existing shapes
  const offscreenCanvas = document.createElement("canvas");
  offscreenCanvas.width = canvas.width;
  offscreenCanvas.height = canvas.height;
  const offscreenCtx = offscreenCanvas.getContext("2d");
  if (!offscreenCtx) return () => {};
  setupContext(offscreenCtx);


  const renderPersistentShapes = () => clearCanvas(roomShapes, selectedShape, offscreenCanvas, offscreenCtx);

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
    roomUsers.forEach((roomUser,roomUserId)=> drawUserCursor(roomUser,roomUserId,ctx))
    if (selectedShape && !hasMovedSinceMouseDown) drawShape(currentShape as Shape, ctx, true);
    else if (currentShape && hasMovedSinceMouseDown) drawShape(currentShape, ctx, selectedShape!=null);
    if (highlightPoints.length !== 0) drawHighlightPoints(highlightPoints);
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
    if(isTrackpadPinch){
      e.preventDefault();
      const zoomDirection = e.deltaY < 0 ? -1 : 1;
      const dampingFactor = 0.005;
      zoomScale *= 1 - dampingFactor * zoomDirection;
      zoomScale = Math.max(0.1, Math.min(zoomScale, 10));
      if(!isPanning) requestAnimationFrame(()=> render())
      if(zoomChangeTimeout) clearTimeout(zoomChangeTimeout);
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
      selectedShape = null;
      canvas.style.cursor = selectedTool === "pan" ? "grab" : "default";
    }
  };

  const handleMessage = (event: MessageEvent) => {
    try {
      const receivedData = JSON.parse(event.data);
      if (receivedData.type === "room_user_pos") {
        const userId = receivedData.userId;
        const posX = receivedData.posX;
        const posY = receivedData.posY;
        roomUsers.set(userId,{posX,posY});
        render();
        return;
      } else if (receivedData.type === "chat") {
        const newShape: Shape = JSON.parse(receivedData.message);
        if(newShape.type === "highlighter"){
          const path = new Path2D(newShape.svgPath);
          newShape.path = path;
          drawShape(newShape, ctx);
        } else {
          const shapeWithUser = { userId: receivedData.userId, shape: newShape };
          roomShapes.push(shapeWithUser);
          if ( receivedData.userId === userId && !undoStack.some(action => JSON.stringify(action.shape) === JSON.stringify(newShape))){
            undoStack.push({type:"add",shape:shapeWithUser});
          } 
          renderPersistentShapes();
        }
        render();
      } else if (receivedData.type === "remove_shape") {
        const shape: Shape = JSON.parse(receivedData.message);
        const shapeWithUser = { userId: receivedData.userId, shape };
        const index = roomShapes.findIndex((roomShape: IRoomShape) => JSON.stringify(roomShape) === JSON.stringify(shapeWithUser));
        if (index !== -1) {
          roomShapes.splice(index, 1);
          renderPersistentShapes();
          render();
        }
      } else if (receivedData.type === "move_shape") {
        const prevShape = JSON.parse(receivedData.message.prevShape);
        const newShape = JSON.parse(receivedData.message.newShape);
        if (!prevShape || !newShape) return;
        const shapeWithUser = { userId: receivedData.userId, shape:prevShape };
        const index = roomShapes.findIndex((roomShape: IRoomShape) => JSON.stringify(roomShape) === JSON.stringify(shapeWithUser));
        if (index !== -1) {
          roomShapes[index] = { userId: receivedData.userId, shape:newShape };
          renderPersistentShapes();
          render();
        }
      }
    } catch (error) { console.error("Error parsing message:", error);}
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
      const boundingShape = getBoundingShape(x, y, roomShapes, ctx);
      if (boundingShape){
        selectedShape = boundingShape;
        currentShape = boundingShape.shape;
        if (currentShape.type === "rectangle"){
          shapeStartX = currentShape.startX;
          shapeStartY = currentShape.startY;
        } else if (currentShape.type === "triangle"){
          shapeStartX = currentShape.startX;
          shapeStartY = currentShape.startY;
        } else if (currentShape.type === "circle"){
          shapeStartX = currentShape.centerX;
          shapeStartY = currentShape.centerY;
        } else if (currentShape.type === "line"){
          shapeStartX = currentShape.startX;
          shapeStartY = currentShape.startY;
          shapeEndX = currentShape.endX;
          shapeEndY = currentShape.endY;
        } else if (currentShape.type === "arrow"){
          shapeStartX = currentShape.startX;
          shapeStartY = currentShape.startY;
          shapeEndX = currentShape.endX;
          shapeEndY = currentShape.endY;
        } else if (currentShape.type === "text"){
          shapeStartX = currentShape.startX;
          shapeStartY = currentShape.startY;
        } else if (currentShape.type === "pen"){
          originalShapePath = currentShape.path;
          const match = originalShapePath.match(/M\s+(\d+\.?\d*)\s+(\d+\.?\d*)/);
          if (match) {
            shapeStartX = parseFloat(match[1] as string);
            shapeStartY = parseFloat(match[2] as string);
          }
        }
        const index = roomShapes.findIndex((roomShape: IRoomShape) => JSON.stringify(roomShape) === JSON.stringify(selectedShape));
        if (index !== -1) roomShapes.splice(index, 1);
        prevMovedShape = boundingShape.shape;
        startX = x;
        startY = y;
        isDragging = true;
      } else {
        selectedShape = null;
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
        highlightPoints.push({x:startX,y:startY,timestamp:Date.now()});
      }
      if (selectedTool === "pen") {
        strokePoints.push({ x: startX, y: startY });
        currentShape = { type: "pen", path: `M ${startX} ${startY}`, strokeColour, strokeWidth };
      } else if (selectedTool === "text") {
        e.preventDefault();
        e.stopPropagation();
        const textAreaElem = createTextArea(e, startX, startY, fontSize, fontFamily, textColour, textStyle);
        document.body.appendChild(textAreaElem);
        textAreaElem.focus();
        textAreaElem.addEventListener("blur", () => handleBlur(textAreaElem), {once: true,});
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
    socket.send(JSON.stringify({type:'user_pos',clientX:x,clientY:y}));

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
      if (currentShape && currentShape.type === "rectangle"){
        currentShape = {...currentShape, startX : shapeStartX + deltaX, startY : shapeStartY + deltaY};
      } else if (currentShape && currentShape.type === "circle"){
        currentShape = {...currentShape, centerX : shapeStartX + deltaX, centerY : shapeStartY + deltaY};
      } else if (currentShape && currentShape.type === "triangle"){
        currentShape = {...currentShape, startX : shapeStartX + deltaX, startY : shapeStartY + deltaY};
      } 
      else if (currentShape && currentShape.type === "line"){
        currentShape = {type:"line" , startX : shapeStartX + deltaX, startY : shapeStartY + deltaY, endX : shapeEndX + deltaX, endY : shapeEndY + deltaY, strokeColour, strokeWidth};
      } 
      else if (currentShape && currentShape.type === "arrow"){
        currentShape = {type:"arrow" , startX : shapeStartX + deltaX, startY : shapeStartY + deltaY, endX : shapeEndX + deltaX, endY : shapeEndY + deltaY, strokeColour, strokeWidth};
      } 
      else if (currentShape && currentShape.type === "text"){
        currentShape = {...currentShape, startX : shapeStartX + deltaX, startY : shapeStartY + deltaY};
      } 
      else if (currentShape && currentShape.type === "pen"){
        currentShape = {...currentShape, path: translateSVGPath(originalShapePath as string, deltaX, deltaY)};
      } 
    } else if (isDrawing) {
      switch (selectedTool) {
        case "pen":
         if (strokePoints.length > 0) {
            const lastPoint = strokePoints[strokePoints.length - 1];
           if ( lastPoint && (Math.abs(currentX - lastPoint.x) > 2 || Math.abs(currentY - lastPoint.y) > 2)) {
              strokePoints.push({ x: currentX, y: currentY });
              currentShape = { type: "pen", path: strokeToSVG(strokePoints), strokeColour, strokeWidth };
            }
          }
          break;
        case "highlighter":
          highlightPoints.push({ x: currentX, y: currentY, timestamp:Date.now()});
          break;
        case "line":
          currentShape = { type: "line", startX, startY, endX: currentX, endY: currentY, strokeColour, strokeWidth};
          break;
        case "arrow":
          currentShape = { type: "arrow", startX, startY, endX: currentX, endY: currentY, strokeColour, strokeWidth};
          break;
        case "rectangle":
          currentShape = { type: "rectangle", startX, startY, width, height, strokeColour, fillColour, strokeWidth};
          break;
        case "triangle":
          currentShape = { type: "triangle", startX, startY, width, height, strokeColour, fillColour, strokeWidth};
          break;
        case "circle":
          const centerX = startX + width / 2;
          const centerY = startY + height / 2;
          const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
          currentShape = { type: "circle", centerX, centerY, radius, strokeColour, fillColour, strokeWidth};
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
    if (isDragging && currentShape && prevMovedShape) {
      const shapeWithUser = { userId, shape: currentShape };
      if (JSON.stringify(currentShape)===JSON.stringify(selectedShape?.shape)) {
        roomShapes.push(selectedShape as IRoomShape);
        prevMovedShape = null;
      }
      else {
          roomShapes.push(shapeWithUser);
          undoStack.push({type:"move",shape:shapeWithUser,prevShape:prevMovedShape});
  
          socket.send(JSON.stringify({type: "move_shape", message: {
            prevShape:JSON.stringify(prevMovedShape),
            newShape:JSON.stringify(currentShape),
          }}));
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
      
      strokePoints = [{ x: currentX, y: currentY },{ x: currentX + 1, y: currentY + 1 },];
      currentShape = { type: "pen", path: strokeToSVG(strokePoints), strokeColour, strokeWidth };
      const shapeWithUser = { userId, shape: currentShape };
      roomShapes.push(shapeWithUser);
      undoStack.push({type:"add",shape:shapeWithUser});
      socket.send(JSON.stringify({ type: "chat", message: JSON.stringify(currentShape) }));
    } else {
      if (currentShape) {
        const shapeWithUser = { userId, shape: currentShape };
        roomShapes.push(shapeWithUser);
        undoStack.push({type:"add",shape:shapeWithUser});
        socket.send(JSON.stringify({type: "chat", message: JSON.stringify(currentShape),}));
      }
    }
   }
    isDrawing = false;
    hasMovedSinceMouseDown = false;
    currentShape = null;
    selectedShape = null;
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
      const shapeWithUser: IRoomShape = { userId, shape: newShape };
      roomShapes.push(shapeWithUser);
      undoStack.push({type:"add",shape:shapeWithUser});
      socket.send(JSON.stringify({ type: "chat", message: JSON.stringify(newShape) }));

      renderPersistentShapes();
      render();
    }
    document.body.removeChild(textAreaElem);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    try {
      const lastAction = undoStack.pop();
      if(!lastAction) return;
      if(lastAction.type === "add"){
        const index = roomShapes.findIndex((roomShape: IRoomShape) => JSON.stringify(roomShape) === JSON.stringify(lastAction.shape));
        if (index !== -1) roomShapes.splice(index, 1);
        redoStack.push({type:"add",shape:lastAction.shape});
        socket.send(JSON.stringify({ type: "delete_shape", message: JSON.stringify(lastAction.shape.shape),}));

      } else if (lastAction.type === "delete") {
        roomShapes.push(lastAction.shape);
        redoStack.push({type:"delete",shape:lastAction.shape});
        socket.send(JSON.stringify({ type: "chat", message: JSON.stringify(lastAction.shape.shape),}));
      } else if (lastAction.type === "move" && lastAction.prevShape) {
        selectedShape = null;
        currentShape = null;
        const newShape = {userId,shape:lastAction.prevShape};
        const index = roomShapes.findIndex((roomShape: IRoomShape) => JSON.stringify(roomShape) === JSON.stringify(lastAction.shape));
        if (index !== -1) roomShapes.splice(index, 1);
        roomShapes.push(newShape);

        redoStack.push({type:"move",shape:newShape,prevShape:lastAction.shape.shape});
        socket.send(JSON.stringify({type: "move_shape", message: {
          prevShape:JSON.stringify(lastAction.shape.shape),
          newShape:JSON.stringify(newShape.shape),
        }}));
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
      if(!lastAction) return;
      if(lastAction.type === "add"){
        roomShapes.push(lastAction.shape);
        undoStack.push({type:"add",shape:lastAction.shape})
        socket.send(JSON.stringify({ type: "chat", message: JSON.stringify(lastAction.shape.shape),})); 
      } else if (lastAction.type === "delete"){
        const index = roomShapes.findIndex((roomShape: IRoomShape) => JSON.stringify(roomShape) === JSON.stringify(lastAction.shape));
        if (index !== -1) roomShapes.splice(index, 1);
        undoStack.push({type:"add",shape:lastAction.shape});
        socket.send(JSON.stringify({type: "delete_shape", message: JSON.stringify(lastAction.shape.shape),}));
      } else if (lastAction.type === "move" && lastAction.prevShape){
        selectedShape = null;
        currentShape = null;

        const newShape = {userId,shape:lastAction.prevShape};
        const index = roomShapes.findIndex((roomShape: IRoomShape) => JSON.stringify(roomShape) === JSON.stringify(lastAction.shape));
        if (index !== -1) roomShapes.splice(index, 1);
        roomShapes.push(newShape);

        undoStack.push({type:"move",shape:newShape, prevShape:lastAction.shape.shape});
        socket.send(JSON.stringify({type: "move_shape", message: {
          prevShape:JSON.stringify(lastAction.shape.shape),
          newShape:JSON.stringify(newShape.shape),
        }}));
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
    } else if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      e.preventDefault();
      handleUndo();
    } else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
      e.preventDefault();
      handleRedo();
    } else if (e.key === "Delete") {
      if (selectedShape == null) return;
      const shapeToDelete = selectedShape;
      selectedShape = null;
      currentShape = null;
      const index = roomShapes.findIndex((roomShape: IRoomShape) => JSON.stringify(roomShape) === JSON.stringify(shapeToDelete));
      if (index !== -1) {
        roomShapes.splice(index, 1);
        undoStack.push({type:"delete",shape:{ userId:shapeToDelete.userId, shape:shapeToDelete.shape }});
      }
      renderPersistentShapes();
      render();
      socket.send(JSON.stringify({type: "delete_shape", message: JSON.stringify(shapeToDelete.shape),}));
    } else if (e.key === "h") {
      selectedTool = "pan";
      selectedShape = null;
      window.dispatchEvent(new CustomEvent("toolChangeFromKeyboard", { detail: "pan" }));
    } else if (e.key === "s") {
      selectedTool = "selection";
      window.dispatchEvent(new CustomEvent("toolChangeFromKeyboard", { detail: "selection" }));
    } else if (e.key === "r") {
      selectedTool = "rectangle";
      selectedShape = null;
      window.dispatchEvent(new CustomEvent("toolChangeFromKeyboard", { detail: "rectangle" }));
    } else if (e.key === "c") {
      selectedTool = "circle";
      selectedShape = null;
      window.dispatchEvent(new CustomEvent("toolChangeFromKeyboard", { detail: "circle" }));
    } else if (e.key === "t") {
      selectedTool = "triangle";
      selectedShape = null;
      window.dispatchEvent(new CustomEvent("toolChangeFromKeyboard", { detail: "triangle" }));
    } else if (e.key === "p") {
      selectedTool = "pen";
      selectedShape = null;
      window.dispatchEvent(new CustomEvent("toolChangeFromKeyboard", { detail: "pen" }));
    } else if (e.key === "l") {
      selectedTool = "line";
      selectedShape = null;
      window.dispatchEvent(new CustomEvent("toolChangeFromKeyboard", { detail: "line" }));
    } else if (e.key === "a") {
      selectedTool = "arrow";
      selectedShape = null;
      window.dispatchEvent(new CustomEvent("toolChangeFromKeyboard", { detail: "arrow" }));
    } else if (e.key === "w") {
      selectedTool = "text";
      selectedShape = null;
      window.dispatchEvent(new CustomEvent("toolChangeFromKeyboard", { detail: "text" }));
    } else if (e.key === "m") {
      selectedTool = "highlighter";
      selectedShape = null;
      window.dispatchEvent( new CustomEvent("toolChangeFromKeyboard", { detail: "highlighter" }));
    }
    canvas.style.cursor = selectedTool === "pan" ? "grab" : "default";
  };

  const handleZoomIn = () => {
    zoomScale = Math.min(zoomScale * (zoomFactor+0.02), 10);
    notifyZoomComplete(zoomScale);
    render();
  };
  
  const handleZoomOut = () => {
    zoomScale = Math.max(zoomScale / (zoomFactor+0.02), 0.1);
    notifyZoomComplete(zoomScale);
    render();
  };

  const handleZoomReset = () => {
    zoomScale = 1;
    notifyZoomComplete(zoomScale);
    render();
  }

  const drawHighlightPoints = (highlightPoints: IHighlightPoint[], toSend:boolean = true) => {
    const currentTime = Date.now();
    const maxAge = 2000;
    const fadeDuration = 1000;
  
    if (highlightPoints.length < 2) return;
  
    ctx.save();
    
    const path = new Path2D();
    let startIndex = -1;
    const highlightLength = highlightPoints.length;

    for (let i = 0; i < highlightLength; i++) {
      const age =  currentTime - (highlightPoints[i] as IHighlightPoint).timestamp;
      if (age <= maxAge + fadeDuration) {
        startIndex = i;
        break;
      }
    }
    
    if (startIndex === -1) {
      ctx.restore();
      return; 
    }
    
    path.moveTo((highlightPoints[startIndex] as IHighlightPoint).x, (highlightPoints[startIndex] as IHighlightPoint).y);
    
    for (let i = startIndex + 1; i < highlightPoints.length; i++) {
      const currPoint = highlightPoints[i];
      if(!currPoint) continue
      const age = currentTime - (currPoint as IHighlightPoint).timestamp;
      
      if (age > maxAge + fadeDuration) continue;
      
      if (i > startIndex + 1) {
        const prevPoint = highlightPoints[i-1];
        if( !prevPoint ) continue;
        const midX = (prevPoint.x + currPoint.x) / 2;
        const midY = (prevPoint.y + currPoint.y) / 2;
        path.quadraticCurveTo(prevPoint.x, prevPoint.y, midX, midY);
        path.lineTo(currPoint.x, currPoint.y);
      } else {
        path.lineTo(currPoint.x, currPoint.y);
      }
    }

    drawShape({type: "highlighter", path} as Shape,ctx);
    
    // to send highlight stroke
    const svgPath = strokeToSVG(highlightPoints);
    // drawShape({type: "highlighter", svgPath} as Shape,ctx);
    const highlighterShape = {type:"highlighter", svgPath}
    toSend && socket.send(JSON.stringify({ type: "chat", message: JSON.stringify(highlighterShape) }));

    ctx.restore();
  };

  const handleStrokeColourChange = (e:Event) => { strokeColour = (e as CustomEvent).detail }

  const handleBGColourChange = (e:Event) => { fillColour = (e as CustomEvent).detail}

  const handleFontFamilyChange = (e:Event) => { fontFamily = (e as CustomEvent).detail }

  const handleFontSizeChange = (e:Event) => { fontSize = (e as CustomEvent).detail }

  const handleTextColorChange = (e:Event) => { textColour = (e as CustomEvent).detail }

  const handleTextStyleChange = (e:Event) => { textStyle = (e as CustomEvent).detail }

  const handlePenWidthChange = (e:Event) => { strokeWidth = (e as CustomEvent).detail }

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

const drawShape = ( shape: Shape, ctx: CanvasRenderingContext2D, drawBoundary: boolean = false, fontSize?:number) => {
  if (shape.type === "pen" && shape.path) {
    ctx.save();
    if (drawBoundary) {
      ctx.strokeStyle = "#A2D2FF";
      const path = new Path2D(shape.path);
      const boundingRect = getBoundingBoxFromPath(shape.path);
      ctx.setLineDash([5, 5]);
      if(boundingRect) ctx.strokeRect(boundingRect?.minX,boundingRect?.minY,boundingRect?.width,boundingRect?.height);
      ctx.setLineDash([]);
      ctx.stroke(path);
    } else {
      ctx.strokeStyle = shape.strokeColour;
      ctx.lineWidth = shape.strokeWidth;
      const path = new Path2D(shape.path);
      ctx.stroke(path);
    }
    ctx.restore();
  } else if (shape.type === "text") {
    ctx.save();
    const fontSize = (shape.fontSize || 24) * window.devicePixelRatio;
    const fontFamily = (shape.fontFamily || "Caveat");
    const fontWeight = shape.textStyle.bold ? "bold" : "";
    const fontStyle = shape.textStyle.italic ? "italic" : "";
    const lineHeight = fontSize * 1.2;
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.letterSpacing = "1px";
    ctx.textBaseline = "top";
    ctx.fillStyle = shape.textColour;
    ctx.textAlign = "left";
    ctx.imageSmoothingEnabled = false;
    const lines = shape.text.split('\n');
    lines.forEach((line, index) => {
      ctx.fillText(line, shape.startX, shape.startY + index * lineHeight);
    });
    if (drawBoundary) {
      ctx.strokeStyle = "#A2D2FF";
      const padding = 10;
      const metrics = ctx.measureText(shape.text);
      const textWidth = metrics.width;
      const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(shape.startX - 3,shape.startY - 3,textWidth + padding,textHeight + padding);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  } else if (shape.type === "line") {
    ctx.save();
    if (drawBoundary) {
      ctx.strokeStyle = "#A2D2FF";
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(shape.startX, shape.startY);
      ctx.lineTo(shape.endX, shape.endY);
      ctx.stroke();
      ctx.closePath();
      ctx.setLineDash([]);
    } else {
      ctx.strokeStyle = shape.strokeColour;
      ctx.lineWidth = shape.strokeWidth;
      ctx.beginPath();
      ctx.moveTo(shape.startX, shape.startY);
      ctx.lineTo(shape.endX, shape.endY);
      ctx.stroke();
      ctx.closePath();
    }
    ctx.restore();
  } else if (shape.type === "arrow") {
    ctx.save();
    if (drawBoundary) {
      ctx.strokeStyle = "#A2D2FF";
      ctx.setLineDash([5, 5]);
      const headlen = 12; // headlen in  pixels
      const dx = shape.endX - shape.startX;
      const dy = shape.endY - shape.startY;
      const angle = Math.atan2(dy, dx);
      ctx.beginPath();
      ctx.moveTo(shape.startX, shape.startY);
      ctx.lineTo(shape.endX, shape.endY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.closePath();
      ctx.beginPath();
      ctx.moveTo(shape.endX, shape.endY);
      ctx.lineTo(shape.endX - headlen * Math.cos(angle - Math.PI / 6),shape.endY - headlen * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(shape.endX, shape.endY);
      ctx.lineTo(shape.endX - headlen * Math.cos(angle + Math.PI / 6),shape.endY - headlen * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
      ctx.closePath();
    } else {
      const headlen = 12; // headlen in  pixels
      const dx = shape.endX - shape.startX;
      const dy = shape.endY - shape.startY;
      const angle = Math.atan2(dy, dx);
      ctx.strokeStyle = shape.strokeColour;
      ctx.lineWidth = shape.strokeWidth;
      ctx.beginPath();
      ctx.moveTo(shape.startX, shape.startY);
      ctx.lineTo(shape.endX, shape.endY);
      ctx.lineTo(shape.endX - headlen * Math.cos(angle - Math.PI / 6),shape.endY - headlen * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(shape.endX, shape.endY);
      ctx.lineTo(shape.endX - headlen * Math.cos(angle + Math.PI / 6),shape.endY - headlen * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
      ctx.closePath();
    }
    ctx.restore();
  } else if (shape.type === "rectangle") {
    ctx.save();
    if (drawBoundary) {
      ctx.strokeStyle = "#A2D2FF";
      ctx.setLineDash([5, 5]);
      ctx.strokeRect( shape.startX - 6, shape.startY - 6, shape.width + 12, shape.height + 12);
      ctx.setLineDash([]);
    } else {
      ctx.strokeStyle = shape.strokeColour;
      ctx.lineWidth = shape.strokeWidth;
      if (shape.fillColour && shape.fillColour !== "transparent") {
        ctx.fillStyle = shape.fillColour;
        ctx.fillRect(shape.startX, shape.startY, shape.width, shape.height);
      }
      ctx.strokeRect(shape.startX, shape.startY, shape.width, shape.height);
    }
    ctx.restore();
  } else if (shape.type === "triangle") {
    ctx.save();
    if (drawBoundary) {
      ctx.strokeStyle = "#A2D2FF";
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(shape.startX + shape.width / 2, shape.startY);
      ctx.lineTo(shape.startX, shape.startY + shape.height);
      ctx.lineTo(shape.startX + shape.width, shape.startY + shape.height);
      ctx.lineTo(shape.startX + shape.width / 2, shape.startY);
      ctx.stroke();
      ctx.closePath();
      ctx.setLineDash([]);
    } else {
      ctx.strokeStyle = shape.strokeColour;
      ctx.lineWidth = shape.strokeWidth;
      ctx.beginPath();
      ctx.moveTo(shape.startX + shape.width / 2, shape.startY);
      ctx.lineTo(shape.startX, shape.startY + shape.height);
      ctx.lineTo(shape.startX + shape.width, shape.startY + shape.height);
      ctx.lineTo(shape.startX + shape.width / 2, shape.startY);
      if (shape.fillColour && shape.fillColour !== "transparent") {
        ctx.fillStyle = shape.fillColour;
        ctx.fill();
      }
      ctx.stroke();
      ctx.closePath();
    }
    ctx.restore();
  } else if (shape.type === "circle") {
    ctx.save();
    ctx.strokeStyle = shape.strokeColour;
    ctx.lineWidth = shape.strokeWidth;
    ctx.beginPath();
    ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
    if (shape.fillColour && shape.fillColour !== "transparent"){
      ctx.fillStyle = shape.fillColour;
      ctx.fill();
    }
    ctx.stroke();
    ctx.closePath();
    if (drawBoundary) {
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = '#A2D2FF';
      ctx.beginPath();
      ctx.arc(shape.centerX, shape.centerY, shape.radius + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();
      ctx.setLineDash([]);
    }
    ctx.restore();
  } else if (shape.type === "highlighter") {
    ctx.save();
    let pathObj;
    if(shape.svgPath) {
      pathObj = new Path2D(shape.svgPath);
    } else if(shape.path instanceof Path2D) {
     pathObj = shape.path;
    } else if(typeof shape.path === 'string') {
     pathObj = new Path2D(shape.path);
    }
    if(!pathObj) {
      console.error("No valid path found for highlighter", shape);
      ctx.restore();
      return;
    }
  
    // draw highlighter 
    ctx.shadowColor = "rgba(255, 50, 50, 0.6)";
    ctx.shadowBlur = 8;
    ctx.lineWidth = 6;
    ctx.strokeStyle = "rgba(255, 0, 0, 0.6)";
    ctx.stroke(pathObj);
  
    // Core highlight
    ctx.shadowBlur = 3;
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "rgba(255, 80, 80, 0.9)";
    ctx.stroke(pathObj);
  
    // Bright center
    ctx.shadowBlur = 0;
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255, 220, 220, 0.6)";
    ctx.stroke(pathObj);
    ctx.restore();
}
};

const drawUserCursor = (roomUser:IRoomUserPos,roomUserId:string, ctx: CanvasRenderingContext2D) => {
  if(!ctx || !roomUser) return;
  
  const colour = getUserColour(roomUserId);
  const displayName = getUserDisplayName(roomUserId) || "user";

  ctx.save();

  const cursorPath = new Path2D("M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z");
  ctx.translate(roomUser.posX,roomUser.posY);
  ctx.fillStyle = colour;
  ctx.fill(cursorPath);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 1;
  ctx.stroke(cursorPath);

  ctx.font = '12px sans-serif';
  const textMetrics = ctx.measureText(displayName);
  const textWidth = textMetrics.width;

  const tagWidth = textWidth + 24;
  const tagHeight = 24;
  const tagX = 10;
  const tagY = tagHeight - 5;

  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.roundRect(tagX, tagY, tagWidth, tagHeight, 8);
  ctx.fill();
  ctx.fillStyle = 'white';
  ctx.fillText(displayName, tagX + 12, tagY + tagHeight/2 + 4);
  ctx.closePath();

  ctx.restore();
}

const getUserColour = (userId: string) => {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        let value = (hash >> (i * 8)) & 0x7F; 
        value = Math.max(32, value); 
        color += ('00' + value.toString(16)).slice(-2);
    }
    return color;
}

const getUserDisplayName = (userId:string) => {
  const names = [ 'Vector Vulture',  'Glitchy Gecko',  'Cyber Corgi',  'Neon Newt',  'Pixel Pigeon',  'Sketchy Lynx',  'Binary Bunny',  'Gradient Giraffe',  'Code Chameleon',  'Render Raccoon'];
  
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const nameIndex = Math.abs(hash) % names.length;
  return names[nameIndex];
}

const clearCanvas = ( roomShapes: IRoomShape[], selectedShape: IRoomShape | null, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#0C0C0C";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  roomShapes.forEach((roomShape: IRoomShape) => {
    if (!roomShape.shape) return;
    drawShape(roomShape.shape, ctx);
  });
};

const getShapesFromMessages = (messages: IChatMessage[]) => messages.map((msg: { userId: string; message: string }) => {
    return { userId: msg.userId, shape: JSON.parse(msg.message) };
});

const strokeToSVG = (points: IPoint[]): string => {
  const strokeLength = points.length;
  if (!strokeLength) return "";

  let path = points[0] ? `M ${points[0].x} ${points[0].y}` : "";

  if (strokeLength > 2) {
    for (let i = 1; i < strokeLength - 1; i++) {
      const p1 = points[i];
      if (!p1) continue;
      const xc = (p1.x + (points[i + 1]?.x ?? 0)) / 2;
      const yc = (p1.y + (points[i + 1]?.y ?? 0)) / 2;
      path += ` Q ${p1.x} ${p1.y}, ${xc} ${yc}`;
    }

    const last = strokeLength - 1;
    const lastPoint = points[last];
    const secondLastPoint = points[last - 1];

    if (lastPoint && secondLastPoint)
      path += ` Q ${secondLastPoint.x} ${secondLastPoint.y}, ${lastPoint.x} ${lastPoint.y}`;
  } else if (strokeLength === 2) {
    const firstPoint = points[0];
    const secondPoint = points[1];
    if (firstPoint && secondPoint)
      path += ` L ${secondPoint.x} ${secondPoint.y}`;
  }
  return path;
};

const setupContext = (ctx: CanvasRenderingContext2D) => {
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.font = `${24 * window.devicePixelRatio}px Caveat`;
  ctx.strokeStyle = "#ffffff";
};

const cleanupTextArea = () => {
  const existingTextarea = document.querySelector(".canvas-text-input");
  if (existingTextarea) {
    existingTextarea.remove();
  }
};

const createTextArea = (e: MouseEvent, canvasX: Number, canvasY: Number, fontSize: Number, fontFamily:string, textColor:string, textStyle:{ bold: boolean, italic: boolean }) => {
  const textAreaElem = document.createElement("textarea");
  const fontStyle = textStyle.italic ? "italic" : "normal";
  const fontWeight = textStyle.bold ? "bold" : "normal";

  textAreaElem.className = "canvas-text-input";
  textAreaElem.style.position = "absolute";
  textAreaElem.style.top = `${e.clientY}px`;
  textAreaElem.style.left = `${e.clientX}px`;
  textAreaElem.style.fontSize = `${fontSize}px`;
  textAreaElem.style.fontWeight = fontWeight;
  textAreaElem.style.fontStyle = fontStyle; 
  textAreaElem.style.fontFamily = fontFamily;
  textAreaElem.style.color = textColor;
  textAreaElem.style.minWidth = "100px";
  textAreaElem.style.minHeight = "30px";
  textAreaElem.style.letterSpacing = "1px";
  textAreaElem.style.background = "transparent";
  textAreaElem.style.border = "none";
  textAreaElem.style.outline = "none";
  textAreaElem.style.resize = "none";
  textAreaElem.style.overflow = "hidden";
  textAreaElem.style.zIndex = "1000";
  textAreaElem.style.whiteSpace = "pre-wrap";

  textAreaElem.dataset.canvasX = canvasX.toString();
  textAreaElem.dataset.canvasY = canvasY.toString();

  const adjustSize = () => {
    textAreaElem.style.height = "auto";
    textAreaElem.style.width = "auto";
    textAreaElem.style.height = `${textAreaElem.scrollHeight}px`;
    textAreaElem.style.width = `${textAreaElem.scrollWidth}px`;
  };

  textAreaElem.addEventListener("input", adjustSize);
  adjustSize();
  return textAreaElem;
};

const getBoundingShape = ( clickedX: number, clickedY: number, roomShapes: IRoomShape[], ctx: CanvasRenderingContext2D) => {
  for (let i = 0; i < roomShapes.length; i++) {
    const roomShape = roomShapes[i]?.shape;
    if (!roomShape) continue;
    if (roomShape.type === "pen" && roomShape.path) {
      ctx.save();
      const path = new Path2D(roomShape.path);
      ctx.lineWidth = 10;
      ctx.stroke(path);
      const value = ctx.isPointInStroke(path, clickedX, clickedY);
      ctx.restore();
      if (value) return roomShapes[i];
    } else if (roomShape.type === "text") {
      ctx.save();
      ctx.font = `${24 * window.devicePixelRatio}px Caveat`;
      ctx.letterSpacing = "1px";
      const metrics = ctx.measureText(roomShape.text);
      const textWidth = metrics.width;
      const textHeight =
        metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
      const padding = 5;
      const value =
        clickedX >= roomShape.startX - padding &&
        clickedX <= roomShape.startX + textWidth + padding &&
        clickedY >= roomShape.startY - padding &&
        clickedY <= roomShape.startY + textHeight + padding;
      ctx.restore();
      if (value) return roomShapes[i];
    } else if (roomShape.type === "line") {
      ctx.save();
      ctx.beginPath();
      ctx.lineWidth = 14;
      ctx.moveTo(roomShape.startX, roomShape.startY);
      ctx.lineTo(roomShape.endX, roomShape.endY);
      const value = ctx.isPointInStroke(clickedX, clickedY);
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
      if (value) return roomShapes[i];
    } else if (roomShape.type === "arrow") {
      ctx.save();
      const headlen = 12; // headlen in  pixels
      ctx.lineWidth = 14;
      const dx = roomShape.endX - roomShape.startX;
      const dy = roomShape.endY - roomShape.startY;
      const angle = Math.atan2(dy, dx);
      ctx.beginPath();
      ctx.moveTo(roomShape.startX, roomShape.startY);
      ctx.lineTo(roomShape.endX, roomShape.endY);
      ctx.lineTo(
        roomShape.endX - headlen * Math.cos(angle - Math.PI / 6),
        roomShape.endY - headlen * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(roomShape.endX, roomShape.endY);
      ctx.lineTo(
        roomShape.endX - headlen * Math.cos(angle + Math.PI / 6),
        roomShape.endY - headlen * Math.sin(angle + Math.PI / 6)
      );
      const value = ctx.isPointInStroke(clickedX, clickedY);
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
      if (value) return roomShapes[i];
    } else if (roomShape.type === "rectangle") {
      ctx.beginPath();
      ctx.rect(
        roomShape.startX,
        roomShape.startY,
        roomShape.width,
        roomShape.height
      );
      ctx.fill();
      const value = ctx.isPointInPath(clickedX, clickedY);
      ctx.closePath();
      if (value) return roomShapes[i];
    } else if (roomShape.type === "triangle") {
      ctx.beginPath();
      ctx.moveTo(roomShape.startX + roomShape.width / 2, roomShape.startY);
      ctx.lineTo(roomShape.startX, roomShape.startY + roomShape.height);
      ctx.lineTo(
        roomShape.startX + roomShape.width,
        roomShape.startY + roomShape.height
      );
      ctx.lineTo(roomShape.startX + roomShape.width / 2, roomShape.startY);
      ctx.fill();
      const value = ctx.isPointInPath(clickedX, clickedY);
      ctx.closePath();
      if (value) return roomShapes[i];
    } else if (roomShape.type === "circle") {
      ctx.beginPath();
      ctx.arc(
        roomShape.centerX,
        roomShape.centerY,
        roomShape.radius,
        0,
        Math.PI * 2
      );
      ctx.fill();
      const value = ctx.isPointInPath(clickedX, clickedY);
      ctx.closePath();
      if (value) return roomShapes[i];
    }
  }
  return null;
};

const notifyZoomComplete = (zoomScale:number) => {
  window.dispatchEvent(
    new CustomEvent("zoomLevelChange", { detail: { zoomLevel: Math.round(zoomScale * 100)} })
  );
};

const getBoundingBoxFromPath = (path: string): { width: number, height: number, minX: number, minY: number } | null => {
  const regex = /[MQ]\s*([\d.-]+)\s*([\d.-]+)/g; 
  let match;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  while ((match = regex.exec(path)) !== null) {
      const x = parseFloat(match[1] as string);
      const y = parseFloat(match[2] as string);

      if (!isNaN(x) && !isNaN(y)) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
      }
  }

  if (minX === Infinity || minY === Infinity || maxX === -Infinity || maxY === -Infinity) {
      return null; 
  }

  return {
      width: maxX - minX,
      height: maxY - minY,
      minX,
      minY
  };
};

const translateSVGPath = (pathString: string, deltaX: number, deltaY: number): string => {
  const validCommands: Array<{cmd: string, points: number[]}> = [];
  
  const segments = pathString.match(/[MLQ]\s+[-\d.]+\s+[-\d.]+(?:\s*,\s*[-\d.]+\s+[-\d.]+)?/g) || [];
  
  for (const segment of segments) {
    const parts = segment.trim().split(/[\s,]+/);
    const command = parts[0];
    const points: number[] = [];
    
    for (let i = 1; i < parts.length; i++) {
      const num = parseFloat(parts[i] as string);
      if (!isNaN(num)) {
        points.push(num);
      }
    }
    
    if ((command === 'M' || command === 'L') && points.length >= 2) {
      validCommands.push({
        cmd: command,
        points: [points[0] as number + deltaX, points[1] as number + deltaY]
      });
    } else if (command === 'Q' && points.length >= 4) {
      validCommands.push({
        cmd: command,
        points: [
          points[0] as number + deltaX, points[1] as number + deltaY,
          points[2] as number + deltaX, points[3] as number + deltaY
        ]
      });
    }
  }
  
  let newPath = '';
  for (const cmd of validCommands) {
    if (cmd.cmd === 'M' || cmd.cmd === 'L') {
      newPath += `${cmd.cmd} ${cmd.points[0]} ${cmd.points[1]} `;
    } else if (cmd.cmd === 'Q') {
      newPath += `${cmd.cmd} ${cmd.points[0]} ${cmd.points[1]}, ${cmd.points[2]} ${cmd.points[3]} `;
    }
  }
  
  return newPath.trim();
};