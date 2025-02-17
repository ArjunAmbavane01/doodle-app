import { selectedTool } from "@/app/canvas/[slug]/_components/Canvas";
import { IChatMessage } from "@workspace/common/interfaces";

export type Shape =
  | { type: "rectangle"; startX: number; startY: number; width: number; height: number;}
  | { type: "circle"; centerX: number; centerY: number; radius: number }
  | { type: 'pen'; path:string};

export interface IPoint {
  x:number,
  y:number,
}

export const initDraw = (canvas: HTMLCanvasElement,socket: WebSocket,initialMessages: IChatMessage[],selectedTool: selectedTool) => {
  const roomShapes = getShapesFromMessages(initialMessages);
  const ctx = canvas.getContext("2d", { willReadFrequently:true});
  if (!ctx) return () => {};

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = "high"
  ctx.lineWidth = 2
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  ctx.strokeStyle = "rgba(255,255,255)";

  let isDrawing = false;
  let startX = 0;
  let startY = 0;
  let strokePoints:IPoint[] = [];
  let lastPoint: IPoint | null = null

  // Debounced render to remove unnecessary redraws
  const render = () => clearCanvas(roomShapes, canvas, ctx);

  const handleToolChange = (event: Event) => {
    const customEvent = event as CustomEvent<selectedTool>;
    if (customEvent.detail) selectedTool = customEvent.detail;
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
    strokePoints = [];
    lastPoint = { x: startX, y: startY }
    if(selectedTool === 'pen') strokePoints.push({x:startX,y:startY});
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    const currentPoint = { x: currentX, y: currentY }

    const width = currentX - startX;
    const height = currentY - startY;

    // Clear and redraw all shapes
    clearCanvas(roomShapes, canvas, ctx);
    if (selectedTool === "pen") {
      // Add point filtering for smoother lines
      if (!lastPoint || Math.abs(currentX - lastPoint.x) > 2 || Math.abs(currentY - lastPoint.y) > 2) {
        strokePoints.push(currentPoint)
        lastPoint = currentPoint

        // Draw smooth curve through points
        ctx.beginPath()
        ctx.moveTo(strokePoints[0].x, strokePoints[0].y)

        if (strokePoints.length > 2) {
          for (let i = 1; i < strokePoints.length - 2; i++) {
            const xc = (strokePoints[i].x + strokePoints[i + 1].x) / 2
            const yc = (strokePoints[i].y + strokePoints[i + 1].y) / 2
            ctx.quadraticCurveTo(strokePoints[i].x, strokePoints[i].y, xc, yc)
          }

          // Curve through the last two points
          if (strokePoints.length > 2) {
            const last = strokePoints.length - 1
            ctx.quadraticCurveTo(
              strokePoints[last - 1].x,
              strokePoints[last - 1].y,
              strokePoints[last].x,
              strokePoints[last].y,
            )
          }
        } else {
          // If we only have 2 points, draw a line
          ctx.lineTo(currentPoint.x, currentPoint.y)
        }

        ctx.stroke()
      }
    }
    else if (selectedTool === "rectangle") ctx.strokeRect(startX, startY, currentX - startX, currentY - startY);
    else if (selectedTool === "circle") {
      const centerX = startX + width / 2;
      const centerY = startY + height / 2;
      const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    const width = endX - startX;
    const height = endY - startY;

    let newShape: Shape | null = null;

    if (selectedTool==='pen'){
      const svgPath = strokeToSVG(strokePoints);
      newShape = { type: "pen",path:svgPath };
    }
    else if (selectedTool === "rectangle") newShape = { type: "rectangle", startX, startY, width, height };
    else if (selectedTool === "circle") {
      const centerX = startX + width / 2;
      const centerY = startY + height / 2;
      const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
      newShape = { type: "circle", centerX, centerY, radius };
    }

    if (newShape) {
      roomShapes.push(newShape)
      socket.send(JSON.stringify({ type: "chat", message: JSON.stringify(newShape) }))
    }

    isDrawing = false
    lastPoint = null
    render()
  };

  const handleMouseLeave = () => {
    if (isDrawing) {
      isDrawing = false;
      lastPoint = null
      render();
    }
  };

  render();

  canvas.removeEventListener("mousedown", handleMouseDown);
  canvas.removeEventListener("mousemove", handleMouseMove);
  canvas.removeEventListener("mouseup", handleMouseUp);
  canvas.removeEventListener("mouseleave", handleMouseLeave);
  socket.removeEventListener("message", handleMessage);
  window.removeEventListener("toolChange", handleToolChange);

  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseup", handleMouseUp);
  canvas.addEventListener("mouseleave", handleMouseLeave);
  socket.addEventListener("message", handleMessage);
  window.addEventListener("toolChange", handleToolChange);

  // Return cleanup function
  return () => {
    canvas.removeEventListener("mousedown", handleMouseDown);
    canvas.removeEventListener("mousemove", handleMouseMove);
    canvas.removeEventListener("mouseup", handleMouseUp);
    canvas.removeEventListener("mouseleave", handleMouseLeave);
    socket.removeEventListener("message", handleMessage);
    window.removeEventListener("toolChange", handleToolChange);
  };
};

export const clearCanvas = (roomShapes: Shape[],canvas: HTMLCanvasElement,ctx: CanvasRenderingContext2D) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0,0,0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255,255,255)"
  ctx.lineWidth = 2
  ctx.lineCap = "round"
  ctx.lineJoin = "round"

  roomShapes.forEach((shape: Shape) => {
    if (!shape) return;
    if (shape.type === 'pen'){
      const path = new Path2D(shape.path);
      ctx.stroke(path);
    }
    else if (shape.type === "rectangle") {
      ctx.strokeRect(shape.startX, shape.startY, shape.width, shape.height);
    }
    else if (shape.type === "circle") {
      ctx.beginPath();
      ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
};

export const getShapesFromMessages = (messages: IChatMessage[]) => messages.map((msg: { message: string }) => JSON.parse(msg.message));
export const strokeToSVG = (points:IPoint[]):string => {
  const strokeLength = points.length;
  if (strokeLength === 0) return '';

  let path = points[0] ? `M ${points[0].x} ${points[0].y}` : '';

  // Loop to handle points for Bezier curves, ensuring points exist at the indices
  if (strokeLength > 2) {
    for (let i = 1; i < strokeLength - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      if (p1 && p2) {
        const xc = (p1.x + p2.x) / 2;
        const yc = (p1.y + p2.y) / 2;
        path += ` Q ${p1.x} ${p1.y}, ${xc} ${yc}`;
      }
    }

    // Handle the last two points
    const last = points[strokeLength - 1];
    const secondLast = points[strokeLength - 2];
    if (secondLast && last) {
      path += ` Q ${secondLast.x} ${secondLast.y}, ${last.x} ${last.y}`;
    }
  } else if (strokeLength === 2) {
    path += points[1] ? ` L ${points[1].x} ${points[1].y}` : '';
  }
  return path;
}
