import { selectedTool } from '@/app/canvas/[slug]/_components/Canvas';
import { IChatMessage } from '@workspace/common/interfaces';

export type Shape =
  | { type: 'pen'; path: string }
  | { type: 'text'; startX: number; startY: number; text: string }
  | { type: 'line'; startX: number; startY: number; endX: number; endY: number }
  | { type: 'arrow'; startX: number; startY: number; endX: number; endY: number }
  | { type: 'rectangle'; startX: number; startY: number; width: number; height: number }
  | { type: 'triangle'; startX: number; startY: number; width: number; height: number }
  | { type: 'circle'; centerX: number; centerY: number; radius: number };

export interface IRoomShape {
  userId:string,
  shape:Shape
};

export interface IPoint { x: number; y: number;}

export const initDraw = ( canvas: HTMLCanvasElement, socket: WebSocket, initialMessages: IChatMessage[], userId:string) => {
  const roomShapes:IRoomShape[] = getShapesFromMessages(initialMessages);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return () => {};

  setupContext(ctx);

  let isDrawing = false;
  let startX = 0;
  let startY = 0;
  let currentShape: Shape | null = null;
  let strokePoints: IPoint[] = [];
  let selectedTool = 'pen';
  let hasMovedSinceMouseDown = false;

  const undoStack:IRoomShape[] = [];
  const redoStack:IRoomShape[] = [];

  // Create background canvas for existing shapes
  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = canvas.width;
  offscreenCanvas.height = canvas.height;
  const offscreenCtx = offscreenCanvas.getContext('2d');
  if (!offscreenCtx) return () => {};
  setupContext(offscreenCtx);

  const renderPersistentShapes = () => clearCanvas(roomShapes, offscreenCanvas, offscreenCtx);

  // this will render both existing and current shape
  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0,0,0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // copy all shapes from bg canvas to main canvas
    ctx.drawImage(offscreenCanvas, 0, 0);
    if (currentShape && hasMovedSinceMouseDown) drawShape(currentShape, ctx);
  };

  const handleToolChange = (event: Event) => {
    const customEvent = event as CustomEvent<selectedTool>;
    if (customEvent.detail) selectedTool = customEvent.detail;
  };

  const handleMessage = (event: MessageEvent) => {
    try {
      const receivedData = JSON.parse(event.data);
      if (receivedData.type === 'chat') {
        const newShape: Shape = JSON.parse(receivedData.message);
        const shapeWithUser = {userId:receivedData.userId,shape:newShape};
        roomShapes.push(shapeWithUser);
        if(receivedData.userId === userId && !undoStack.some(s => JSON.stringify(s.shape) === JSON.stringify(newShape))) undoStack.push(shapeWithUser);
        renderPersistentShapes();
        render();
      }
      else if (receivedData.type === 'remove_shape') {
        const shape: Shape = JSON.parse(receivedData.message);
        const shapeWithUser = {userId:receivedData.userId,shape}
        const index = roomShapes.findIndex((roomShape:IRoomShape)=> JSON.stringify(roomShape) === JSON.stringify(shapeWithUser));
        if (index !== -1) {
          roomShapes.splice(index, 1);
          renderPersistentShapes();
          render();
        }
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    isDrawing = true;
    hasMovedSinceMouseDown = false;
    if (selectedTool === 'pen') {
      strokePoints.push({ x: startX, y: startY });
      currentShape = { type: 'pen', path: `M ${startX} ${startY}` };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    const width = currentX - startX;
    const height = currentY - startY;

    if (Math.abs(currentX - startX) > 2 || Math.abs(currentY - startY) > 2)
      hasMovedSinceMouseDown = true;
    if (!hasMovedSinceMouseDown) return;
    if (selectedTool === 'pen') {
      const currentPoint: IPoint = { x: currentX, y: currentY };
      // add points only if there is enough distance
      const lastPoint = strokePoints[strokePoints.length - 1];
      if ( lastPoint && (Math.abs(currentX - lastPoint.x) > 2 || Math.abs(currentY - lastPoint.y) > 2)) {
        strokePoints.push(currentPoint);
        currentShape = { type: 'pen', path: strokeToSVG(strokePoints) };
      }
    } 
    else if (selectedTool === 'line')
      currentShape = { type: 'line', startX, startY, endX: currentX, endY: currentY,};
    else if (selectedTool === 'arrow')
      currentShape = { type: 'arrow', startX, startY, endX: currentX, endY: currentY,};
    else if (selectedTool === 'rectangle')
      currentShape = { type: 'rectangle', startX, startY, width, height };
    else if (selectedTool === 'triangle')
      currentShape = { type: 'triangle', startX, startY, width, height };
    else if (selectedTool === 'circle') {
      const centerX = startX + width / 2;
      const centerY = startY + height / 2;
      const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
      currentShape = { type: 'circle', centerX, centerY, radius };
    }
    render();
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!isDrawing) return;

    if (!hasMovedSinceMouseDown && selectedTool === 'pen') {
      const rect = canvas.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      strokePoints = [{ x: currentX, y: currentY },{ x: currentX + 1, y: currentY + 1 },];
      currentShape = { type: 'pen', path: strokeToSVG(strokePoints) };
      const shapeWithUser = {userId,shape:currentShape}
      roomShapes.push(shapeWithUser);
      undoStack.push(shapeWithUser);
      socket.send(JSON.stringify({ type: 'chat', message: JSON.stringify(currentShape) }));
    } else {
      if (currentShape) {
        const shapeWithUser = {userId,shape:currentShape}
        roomShapes.push(shapeWithUser);
        undoStack.push(shapeWithUser);
        socket.send(JSON.stringify({type: 'chat',message: JSON.stringify(currentShape),}),);
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
      isDrawing = false;
      currentShape = null;
      strokePoints = [];
      render();
    }
  };

  const handleUndo = () => {
    if(undoStack.length === 0) return;
    try{
      const lastRoomShape = undoStack.pop();
      if(!lastRoomShape) return;
      redoStack.push(lastRoomShape);

      const index = roomShapes.findIndex((roomShape:IRoomShape)=> JSON.stringify(roomShape) === JSON.stringify(lastRoomShape));
      if (index !== -1) roomShapes.splice(index, 1);
      socket.send(JSON.stringify({type:'undo',}))
      renderPersistentShapes();
      render();
    } catch(e){
      console.log('Some error occurred : ' + e);
    }
  }

  const handleRedo = () => {
    if(redoStack.length === 0) return;
    try{
      const newRoomShape = redoStack.pop();
      if(!newRoomShape) return;

      roomShapes.push(newRoomShape);
      undoStack.push(newRoomShape);
      
      socket.send(JSON.stringify({type:'chat',message: JSON.stringify(newRoomShape.shape)}))

      renderPersistentShapes();
      render();
      isDrawing = false;
      hasMovedSinceMouseDown = false;
      currentShape = null;
      strokePoints = [];
    } catch(e){
      console.log('Some error occurred : ' + e);
    }
  }

  renderPersistentShapes();
  render();

  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseup', handleMouseUp);
  canvas.addEventListener('mouseleave', handleMouseLeave);
  socket.addEventListener('message', handleMessage);
  window.addEventListener('toolChange', handleToolChange);
  window.addEventListener('redo', handleRedo);
  window.addEventListener('undo', handleUndo);

  return () => {
    canvas.removeEventListener('mousedown', handleMouseDown);
    canvas.removeEventListener('mousemove', handleMouseMove);
    canvas.removeEventListener('mouseup', handleMouseUp);
    canvas.removeEventListener('mouseleave', handleMouseLeave);
    socket.removeEventListener('message', handleMessage);
    window.removeEventListener('toolChange', handleToolChange);
    window.removeEventListener('redo', handleRedo);
    window.removeEventListener('undo', handleUndo);
  };
};

const drawShape = (shape: Shape, ctx: CanvasRenderingContext2D) => {
  if (shape.type === 'pen' && shape.path) {
    const path = new Path2D(shape.path);
    ctx.stroke(path);
  } else if (shape.type === 'line') {
    ctx.beginPath();
    ctx.moveTo(shape.startX, shape.startY);
    ctx.lineTo(shape.endX, shape.endY);
    ctx.stroke();
    ctx.closePath();
  } 
  else if (shape.type === 'arrow') {
    const headlen = 12; // headlen in  pixels
    const dx = shape.endX - shape.startX;
    const dy = shape.endY - shape.startY;
    const angle = Math.atan2(dy, dx);
    ctx.beginPath();
    ctx.moveTo(shape.startX, shape.startY);
    ctx.lineTo(shape.endX, shape.endY);
    ctx.lineTo( shape.endX - headlen * Math.cos(angle - Math.PI / 6), shape.endY - headlen * Math.sin(angle - Math.PI / 6),);
    ctx.moveTo(shape.endX, shape.endY);
    ctx.lineTo( shape.endX - headlen * Math.cos(angle + Math.PI / 6), shape.endY - headlen * Math.sin(angle + Math.PI / 6),);
    ctx.stroke();
    ctx.closePath();
  } 
  else if (shape.type === 'rectangle') ctx.strokeRect(shape.startX, shape.startY, shape.width, shape.height);
  else if (shape.type === 'triangle') {
    ctx.beginPath();
    ctx.moveTo(shape.startX + shape.width/2,shape.startY);
    ctx.lineTo(shape.startX,shape.startY + shape.height);
    ctx.lineTo(shape.startX + shape.width,shape.startY + shape.height);
    ctx.lineTo(shape.startX + shape.width/2,shape.startY);
    ctx.stroke();
    ctx.closePath();
  }
  else if (shape.type === 'circle') {
    ctx.beginPath();
    ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();
  }
};

export const clearCanvas = ( roomShapes: IRoomShape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(0,0,0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  setupContext(ctx);

  roomShapes.forEach((roomShape: IRoomShape) => {
    if (!roomShape.shape) return;
    drawShape(roomShape.shape,ctx);
  });
};

export const getShapesFromMessages = (messages: IChatMessage[]) => (
  messages.map((msg: { userId:string, message: string }) => { return {userId:msg.userId, shape:JSON.parse(msg.message)}})
);

export const strokeToSVG = (points: IPoint[]): string => {
  const strokeLength = points.length;
  if (!strokeLength) return '';

  let path = points[0] ? `M ${points[0].x} ${points[0].y}` : '';

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

    if (lastPoint && secondLastPoint) path += ` Q ${secondLastPoint.x} ${secondLastPoint.y}, ${lastPoint.x} ${lastPoint.y}`;
  } else if (strokeLength === 2) {
    const firstPoint = points[0];
    const secondPoint = points[1];
    if (firstPoint && secondPoint) path += ` L ${secondPoint.x} ${secondPoint.y}`;
  }
  return path;
};

export const setupContext = (ctx: CanvasRenderingContext2D) => {
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.font = "20px serif";
  ctx.strokeStyle = 'rgba(255,255,255)';
};
