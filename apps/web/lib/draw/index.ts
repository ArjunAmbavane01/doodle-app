import { SelectedToolType } from "@/app/canvas/[slug]/_components/Canvas";
import { IChatMessage } from "@workspace/common/interfaces";

export type Shape =
  | { type: "pen"; path: string }
  | { type: "highlighter"; path?: Path2D, svgPath?:string , points?: IHighlightPoint[] }
  | { type: "text"; startX: number; startY: number; text: string }
  | { type: "line"; startX: number; startY: number; endX: number; endY: number }
  | { type: "arrow"; startX: number; startY: number; endX: number; endY: number;}
  | { type: "rectangle"; startX: number; startY: number; width: number; height: number;}
  | { type: "triangle"; startX: number; startY: number; width: number; height: number;}
  | { type: "circle"; centerX: number; centerY: number; radius: number };

export interface IRoomShape { userId: string, shape: Shape, wasDeleted?:boolean};

export interface IRoomUserPos { posX:number, posY:number, displayName?: string};

export interface IPoint { x: number, y: number};

export interface IHighlightPoint { x: number, y: number, timestamp:number};

export const initDraw = ( canvas: HTMLCanvasElement, socket: WebSocket, initialMessages: IChatMessage[], userId: string) => {
  const roomShapes: IRoomShape[] = getShapesFromMessages(initialMessages);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return () => {};

  setupContext(ctx);

  let currentShape: Shape | null = null;
  let selectedTool = "pen";

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
  let zoomChangeTimeout: number | null = null;
  let dragStartX = 0;
  let dragStartY = 0;

  let strokePoints: IPoint[] = [];
  let highlightPoints: IHighlightPoint[] = [];
  let selectedShape: IRoomShape | null = null;
  const undoStack: IRoomShape[] = [];
  const redoStack: IRoomShape[] = [];
  const roomUsers = new Map<string,{ posX:number, posY:number}>();

  // Create background canvas for existing shapes
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
    if (currentShape && hasMovedSinceMouseDown) drawShape(currentShape, ctx);
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
    const isTrackpadPinch = e.ctrlKey || Math.abs(e.deltaY) < 10 && (!Number.isInteger(e.deltaX) || !Number.isInteger(e.deltaY));
    if(isTrackpadPinch){
      e.preventDefault();
      const zoomDirection = e.deltaY < 0 ? 1 : -1;
      if(zoomDirection > 0){
        zoomScale = (Math.min(zoomScale * zoomFactor, 10));
      } else {
        zoomScale = (Math.max(zoomScale / zoomFactor, 0.1));
      }
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
      } else if (receivedData.type === "chat") {
        const newShape: Shape = JSON.parse(receivedData.message);
        if(newShape.type === "highlighter"){
          // ADD FUNCTIONALITY OF RECIEVEING A HIGLIGHT STROKE
          const highlightPath = new Path2D(newShape.svgPath);
          ctx.save();
          ctx.shadowColor = "rgba(255, 50, 50, 0.6)";
          ctx.shadowBlur = 8;
          ctx.lineWidth = 6;
          ctx.strokeStyle = "rgba(255, 0, 0, 0.6)";
          ctx.stroke(highlightPath);
          
          // Core highlight
          ctx.shadowBlur = 3;
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = "rgba(255, 80, 80, 0.9)";
          ctx.stroke(highlightPath);
          
          // Bright center
          ctx.shadowBlur = 0;
          ctx.lineWidth = 1;
          ctx.strokeStyle = "rgba(255, 220, 220, 0.6)";
          ctx.stroke(highlightPath);
          ctx.restore();
          return;
        } else {
          const shapeWithUser = { userId: receivedData.userId, shape: newShape };
          roomShapes.push(shapeWithUser);
          if ( receivedData.userId === userId && !undoStack.some(s => JSON.stringify(s.shape) === JSON.stringify(newShape))) undoStack.push(shapeWithUser);
          renderPersistentShapes();
        }
        render();
      } else if (receivedData.type === "remove_shape") {
        const shape: Shape = JSON.parse(receivedData.message);
        const shapeWithUser = { userId: receivedData.userId, shape };
        console.log(roomShapes)
        const index = roomShapes.findIndex((roomShape: IRoomShape) => JSON.stringify(roomShape) === JSON.stringify(shapeWithUser));
        console.log(shapeWithUser)
        console.log(index)
        if (index !== -1) {
          roomShapes.splice(index, 1);
          renderPersistentShapes();
          render();
        }
      }
    } catch (error) { console.error("Error parsing message:", error);}
  };

  const handleMouseDown = (e: MouseEvent) => {
    const { x, y } = getCanvasPoint(e.clientX, e.clientY);
    console.log(`zoomX : ${zoomOffsetX}`);
    console.log(`zoomY : ${zoomOffsetY}`);
    console.log(`x ${x} y ${y}`);
    console.log(`panx ${panOffsetX} pany ${panOffsetY}`);
    if (selectedShape != null) selectedShape = null;
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
        currentShape = { type: "pen", path: `M ${startX} ${startY}` };
      } else if (selectedTool === "text") {
        e.preventDefault();
        e.stopPropagation();

        const textAreaElem = createTextArea(e, startX, startY);
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
    socket.send(JSON.stringify({type:'user_pos',clientX:x,clientY:y}));
    if (isDragging) {
    }
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
    if (!isDrawing) return;
    const currentX = x;
    const currentY = y;

    const width = currentX - startX;
    const height = currentY - startY;

    if (!hasMovedSinceMouseDown && (Math.abs(currentX - startX) > 2 || Math.abs(currentY - startY) > 2)) hasMovedSinceMouseDown = true;
    if (!hasMovedSinceMouseDown) return;
    switch (selectedTool) {
      case "pen":
        if (strokePoints.length > 0) {
          const lastPoint = strokePoints[strokePoints.length - 1];
          if ( lastPoint && (Math.abs(currentX - lastPoint.x) > 2 || Math.abs(currentY - lastPoint.y) > 2)) {
            strokePoints.push({ x: currentX, y: currentY });
            currentShape = { type: "pen", path: strokeToSVG(strokePoints) };
          }
        }
        break;
      case "highlighter":
        highlightPoints.push({ x: currentX, y: currentY, timestamp:Date.now()});
        break;
      case "line":
        currentShape = { type: "line", startX, startY, endX: currentX, endY: currentY,};
        break;
      case "arrow":
        currentShape = { type: "arrow", startX, startY, endX: currentX, endY: currentY,};
        break;
      case "rectangle":
        currentShape = { type: "rectangle", startX, startY, width, height };
        break;
      case "triangle":
        currentShape = { type: "triangle", startX, startY, width, height };
        break;
      case "circle":
        const centerX = startX + width / 2;
        const centerY = startY + height / 2;
        const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
        currentShape = { type: "circle", centerX, centerY, radius };
        break;
    }
    render();
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (isPanning) {
      isPanning = false;
      canvas.style.cursor = "grab";
      return;
    }
    if (!isDrawing) return;
    if (!hasMovedSinceMouseDown && selectedTool === "pen") {
      const rect = canvas.getBoundingClientRect();
      const { x, y } = getCanvasPoint(e.clientX, e.clientY);
      const currentX = x - rect.left;
      const currentY = y - rect.top;

      strokePoints = [{ x: currentX, y: currentY },{ x: currentX + 1, y: currentY + 1 },];
      currentShape = { type: "pen", path: strokeToSVG(strokePoints) };
      const shapeWithUser = { userId, shape: currentShape };
      roomShapes.push(shapeWithUser);
      undoStack.push(shapeWithUser);
      socket.send(JSON.stringify({ type: "chat", message: JSON.stringify(currentShape) }));
    } else {
      if (currentShape) {
        const shapeWithUser = { userId, shape: currentShape };
        roomShapes.push(shapeWithUser);
        undoStack.push(shapeWithUser);
        socket.send(JSON.stringify({type: "chat", message: JSON.stringify(currentShape),}));
      }
    }
    isDrawing = false;
    hasMovedSinceMouseDown = false;
    currentShape = null;
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

      const newShape: Shape = {
        type: "text",
        startX: canvasX,
        startY: canvasY,
        text,
      };
      const shapeWithUser: IRoomShape = { userId, shape: newShape };
      roomShapes.push(shapeWithUser);
      undoStack.push(shapeWithUser);
      socket.send(JSON.stringify({ type: "chat", message: JSON.stringify(newShape) }));

      renderPersistentShapes();
      render();
    }
    document.body.removeChild(textAreaElem);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    try {
      const lastRoomShape = undoStack.pop();
      if (!lastRoomShape) return;
      const restoredShape = {
        userId: lastRoomShape.userId,
        shape: lastRoomShape.shape
      };
      if(lastRoomShape?.wasDeleted){
        roomShapes.push(restoredShape);
        socket.send(JSON.stringify({ type: "chat", message: JSON.stringify(restoredShape.shape),}));
        redoStack.push(lastRoomShape);
      }
      else {
        const index = roomShapes.findIndex((roomShape: IRoomShape) => JSON.stringify(roomShape) === JSON.stringify(lastRoomShape));
        if (index !== -1) roomShapes.splice(index, 1);
        socket.send(JSON.stringify({type: "delete_shape", message: JSON.stringify(lastRoomShape.shape),}));
        redoStack.push(restoredShape);
      }
      renderPersistentShapes();
      render();
    } catch (e) {
      console.log("Some error occurred : " + e);
    }
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    try {
      const newRoomShape = redoStack.pop();
      if (!newRoomShape) return;
      const restoredShape = {
        userId: newRoomShape.userId,
        shape: newRoomShape.shape
      };
      if(newRoomShape?.wasDeleted){
        const index = roomShapes.findIndex((roomShape: IRoomShape) => JSON.stringify(roomShape) === JSON.stringify(newRoomShape));
        if (index !== -1) roomShapes.splice(index, 1);
        socket.send(JSON.stringify({type: "delete_shape", message: JSON.stringify(newRoomShape.shape),}));
        undoStack.push(restoredShape)
      } else{
       roomShapes.push(restoredShape);
       undoStack.push(restoredShape)
       socket.send(JSON.stringify({ type: "chat", message: JSON.stringify(newRoomShape.shape),})); 
      }
      renderPersistentShapes();
      render();
    } catch (e) {
      console.log("Some error occurred : " + e);
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
      const index = roomShapes.findIndex((roomShape: IRoomShape) => JSON.stringify(roomShape) === JSON.stringify(shapeToDelete));
      if (index !== -1) {
        roomShapes.splice(index, 1);
        undoStack.push({
          userId:shapeToDelete.userId,
          shape:shapeToDelete.shape,
          wasDeleted : true
        });
      }
      renderPersistentShapes();
      render();
      socket.send(JSON.stringify({type: "delete_shape", message: JSON.stringify(shapeToDelete.shape),}));
    } else if (e.key === "h") {
      selectedTool = "pan";
      window.dispatchEvent(
        new CustomEvent("toolChangeFromKeyboard", { detail: "pan" })
      );
    } else if (e.key === "s") {
      selectedTool = "selection";
      window.dispatchEvent(
        new CustomEvent("toolChangeFromKeyboard", { detail: "selection" })
      );
    } else if (e.key === "r") {
      selectedTool = "rectangle";
      window.dispatchEvent(
        new CustomEvent("toolChangeFromKeyboard", { detail: "rectangle" })
      );
    } else if (e.key === "c") {
      selectedTool = "circle";
      window.dispatchEvent(
        new CustomEvent("toolChangeFromKeyboard", { detail: "circle" })
      );
    } else if (e.key === "t") {
      selectedTool = "triangle";
      window.dispatchEvent(
        new CustomEvent("toolChangeFromKeyboard", { detail: "triangle" })
      );
    } else if (e.key === "p") {
      selectedTool = "pen";
      window.dispatchEvent(
        new CustomEvent("toolChangeFromKeyboard", { detail: "pen" })
      );
    } else if (e.key === "l") {
      selectedTool = "line";
      window.dispatchEvent(
        new CustomEvent("toolChangeFromKeyboard", { detail: "line" })
      );
    } else if (e.key === "a") {
      selectedTool = "arrow";
      window.dispatchEvent(
        new CustomEvent("toolChangeFromKeyboard", { detail: "arrow" })
      );
    } else if (e.key === "w") {
      selectedTool = "text";
      window.dispatchEvent(
        new CustomEvent("toolChangeFromKeyboard", { detail: "text" })
      );
    } else if (e.key === "m") {
      selectedTool = "highlighter";
      window.dispatchEvent(
        new CustomEvent("toolChangeFromKeyboard", { detail: "highlighter" })
      );
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
    const highlighterShape = {type:"highlighter", svgPath}
    toSend && socket.send(JSON.stringify({ type: "chat", message: JSON.stringify(highlighterShape) }));

    ctx.restore();
  };

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
  window.addEventListener("zoomIn", () => { handleZoomIn() });
  window.addEventListener("zoomOut", () => { handleZoomOut() });
  // window.addEventListener("resize", handleResize);

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
    window.removeEventListener("zoomIn", () => { handleZoomIn() });
    window.removeEventListener("zoomOut", () => { handleZoomOut() });
    // window.removeEventListener("resize", handleResize);
  };
};

// here isDragging shuld come as param
const drawShape = ( shape: Shape, ctx: CanvasRenderingContext2D, drawBoundary: boolean = false) => {
  if (shape.type === "pen" && shape.path) {
    if (drawBoundary) {
      ctx.setLineDash([5, 5]);
      const path = new Path2D(shape.path);
      ctx.stroke(path);
      ctx.setLineDash([]);
    } else {
      const path = new Path2D(shape.path);
      ctx.stroke(path);
    }
  } else if (shape.type === "text") {
    ctx.save();
    ctx.font = `${24 * window.devicePixelRatio}px Caveat`;
    ctx.letterSpacing = "1px";
    ctx.fillStyle = "white";
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.imageSmoothingEnabled = false;
    ctx.fillText(shape.text, shape.startX, shape.startY);
    ctx.restore();
    if (drawBoundary) {
      ctx.save();
      ctx.font = `${24 * window.devicePixelRatio}px Caveat`;
      ctx.letterSpacing = "1px";
      const padding = 10;
      const metrics = ctx.measureText(shape.text);
      const textWidth = metrics.width;
      const textHeight =
        metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        shape.startX - 3,
        shape.startY - 3,
        textWidth + padding,
        textHeight + padding
      );
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
  } else if (shape.type === "line") {
    if (drawBoundary) {
      ctx.setLineDash([5, 5]);
      ctx.moveTo(shape.startX, shape.startY);
      ctx.lineTo(shape.endX, shape.endY);
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      ctx.beginPath();
      ctx.moveTo(shape.startX, shape.startY);
      ctx.lineTo(shape.endX, shape.endY);
      ctx.stroke();
      ctx.closePath();
    }
  } else if (shape.type === "arrow") {
    if (drawBoundary) {
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
      ctx.lineTo(
        shape.endX - headlen * Math.cos(angle - Math.PI / 6),
        shape.endY - headlen * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(shape.endX, shape.endY);
      ctx.lineTo(
        shape.endX - headlen * Math.cos(angle + Math.PI / 6),
        shape.endY - headlen * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
      ctx.closePath();
    } else {
      const headlen = 12; // headlen in  pixels
      const dx = shape.endX - shape.startX;
      const dy = shape.endY - shape.startY;
      const angle = Math.atan2(dy, dx);
      ctx.beginPath();
      ctx.moveTo(shape.startX, shape.startY);
      ctx.lineTo(shape.endX, shape.endY);
      ctx.lineTo(
        shape.endX - headlen * Math.cos(angle - Math.PI / 6),
        shape.endY - headlen * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(shape.endX, shape.endY);
      ctx.lineTo(
        shape.endX - headlen * Math.cos(angle + Math.PI / 6),
        shape.endY - headlen * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
      ctx.closePath();
    }
  } else if (shape.type === "rectangle") {
    if (drawBoundary) {
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        shape.startX - 6,
        shape.startY - 6,
        shape.width + 12,
        shape.height + 12
      );
      ctx.setLineDash([]);
    } else {
      ctx.strokeRect(shape.startX, shape.startY, shape.width, shape.height);
    }
    
  } else if (shape.type === "triangle") {
    if (drawBoundary) {
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
      ctx.beginPath();
      ctx.moveTo(shape.startX + shape.width / 2, shape.startY);
      ctx.lineTo(shape.startX, shape.startY + shape.height);
      ctx.lineTo(shape.startX + shape.width, shape.startY + shape.height);
      ctx.lineTo(shape.startX + shape.width / 2, shape.startY);
      ctx.stroke();
      ctx.closePath();
    }
  } else if (shape.type === "circle") {
    ctx.beginPath();
    ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();
    if (drawBoundary) {
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(shape.centerX, shape.centerY, shape.radius + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();
      ctx.setLineDash([]);
    }
  } else if (shape.type === "highlighter") {
    ctx.save();
    ctx.shadowColor = "rgba(255, 50, 50, 0.6)";
    ctx.shadowBlur = 8;
    ctx.lineWidth = 6;
    ctx.strokeStyle = "rgba(255, 0, 0, 0.6)";
    ctx.stroke(shape.path as Path2D);
    
    // Core highlight
    ctx.shadowBlur = 3;
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "rgba(255, 80, 80, 0.9)";
    ctx.stroke(shape.path as Path2D);
    
    // Bright center
    ctx.shadowBlur = 0;
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255, 220, 220, 0.6)";
    ctx.stroke(shape.path as Path2D);
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
    drawShape(roomShape.shape, ctx, JSON.stringify(roomShape) === JSON.stringify(selectedShape));
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
  ctx.strokeStyle = "rgba(255,255,255)";
};

const cleanupTextArea = () => {
  const existingTextarea = document.querySelector(".canvas-text-input");
  if (existingTextarea) {
    existingTextarea.remove();
  }
};

const createTextArea = (e: MouseEvent, canvasX: Number, canvasY: Number) => {
  const textAreaElem = document.createElement("textarea");
  textAreaElem.className = "canvas-text-input";
  textAreaElem.style.position = "absolute";
  textAreaElem.style.left = `${e.clientX}px`;
  textAreaElem.style.top = `${e.clientY}px`;
  textAreaElem.style.minWidth = "100px";
  textAreaElem.style.minHeight = "30px";
  textAreaElem.style.fontSize = "24px";
  textAreaElem.style.fontFamily = "Caveat";
  textAreaElem.style.letterSpacing = "1px";
  textAreaElem.style.background = "transparent";
  textAreaElem.style.color = "white";
  textAreaElem.style.border = "none";
  textAreaElem.style.outline = "none";
  textAreaElem.style.resize = "none";
  textAreaElem.style.overflowY = "hidden";
  textAreaElem.style.zIndex = "1000";
  textAreaElem.dataset.canvasX = canvasX.toString();
  textAreaElem.dataset.canvasY = canvasY.toString();

  const adjustHeight = () => {
    textAreaElem.style.height = "auto";
    textAreaElem.style.height = `${textAreaElem.scrollHeight}px`;
  };

  textAreaElem.addEventListener("input", adjustHeight);
  adjustHeight();
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