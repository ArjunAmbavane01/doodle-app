import { HighlightPoint, Point, RoomShape, Shape, } from "@workspace/common/shapes";

export const drawShape = ( shape: Shape, ctx: CanvasRenderingContext2D, drawBoundary: boolean = false,) => {
  if (shape.type === "pen" && shape.path) {
    ctx.save();
    if (drawBoundary) {
      ctx.strokeStyle = "#A2D2FF";
      const path = new Path2D(shape.path);
      const boundingRect = getBoundingBoxFromPath(shape.path);
      ctx.setLineDash([5, 5]);
      if (boundingRect) ctx.strokeRect(boundingRect?.minX,boundingRect?.minY,boundingRect?.width,boundingRect?.height);
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
    const lines = shape.text.split("\n");
    const fontSize = (shape.fontSize || 24);
    const fontFamily = shape.fontFamily || "Caveat";
    const fontWeight = shape.textStyle.bold ? "bold" : "";
    const fontStyle = shape.textStyle.italic ? "italic" : "";
    const lineHeight = fontSize * 1.2;
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.letterSpacing = "1px";
    ctx.textBaseline = "top";
    ctx.fillStyle = shape.textColour;
    ctx.textAlign = "left";
    lines.forEach((line, index) => { ctx.fillText(line, shape.startX, shape.startY + index * lineHeight);});
    if (drawBoundary) {
      const longestLineIdx = lines.reduce((maxIdx, line, idx, arr) => line.length > arr[maxIdx]!.length ? idx : maxIdx, 0);
      ctx.strokeStyle = "#A2D2FF";
      const padding = 5;
      const textWidth = ctx.measureText(lines[longestLineIdx] as string).width;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect( shape.startX - 3, shape.startY - 3, textWidth + padding, lineHeight * lines.length + padding);
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
      ctx.strokeRect(shape.startX - 6,shape.startY - 6,shape.width + 12,shape.height + 12);
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
    if (shape.fillColour && shape.fillColour !== "transparent") {
      ctx.fillStyle = shape.fillColour;
      ctx.fill();
    }
    ctx.stroke();
    ctx.closePath();
    if (drawBoundary) {
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = "#A2D2FF";
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
    if (shape.svgPath) pathObj = new Path2D(shape.svgPath);
    else if (shape.path instanceof Path2D) pathObj = shape.path;
    else if (typeof shape.path === "string") pathObj = new Path2D(shape.path);
    if (!pathObj) {
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

export const translateSVGPath = (pathString: string,deltaX: number,deltaY: number): string => {
  const validCommands: Array<{ cmd: string; points: number[] }> = [];

  const segments = pathString.match(/[MLQ]\s+[-\d.]+\s+[-\d.]+(?:\s*,\s*[-\d.]+\s+[-\d.]+)?/g) || [];

  for (const segment of segments) {
    const parts = segment.trim().split(/[\s,]+/);
    const command = parts[0];
    const points: number[] = [];

    for (let i = 1; i < parts.length; i++) {
      const num = parseFloat(parts[i] as string);
      if (!isNaN(num)) points.push(num);
    }

    if ((command === "M" || command === "L") && points.length >= 2) {
      validCommands.push({
        cmd: command,
        points: [(points[0] as number) + deltaX,(points[1] as number) + deltaY,],
      });
    } else if (command === "Q" && points.length >= 4) {
      validCommands.push({
        cmd: command,
        points: [(points[0] as number) + deltaX,(points[1] as number) + deltaY,(points[2] as number) + deltaX,(points[3] as number) + deltaY,],
      });
    }
  }

  let newPath = "";
  for (const cmd of validCommands) {
    if (cmd.cmd === "M" || cmd.cmd === "L") newPath += `${cmd.cmd} ${cmd.points[0]} ${cmd.points[1]} `;
    else if (cmd.cmd === "Q") newPath += `${cmd.cmd} ${cmd.points[0]} ${cmd.points[1]}, ${cmd.points[2]} ${cmd.points[3]} `;
  }

  return newPath.trim();
};

// Returns roomShapes[i] 
export const getBoundingShape = (clickedX: number, clickedY: number, roomShapes: RoomShape[], ctx: CanvasRenderingContext2D) => {
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
      if (value) return {roomShape:roomShapes[i],index:i};
    } else if (roomShape.type === "text") {
      ctx.save();
      const lines = roomShape.text.split("\n");
      const fontSize = (roomShape.fontSize || 24);
      const fontFamily = roomShape.fontFamily || "Caveat";
      const lineHeight = fontSize * 1.2;
      const longestLineIdx = lines.reduce((maxIdx, line, idx, arr) => line.length > arr[maxIdx]!.length ? idx : maxIdx, 0);
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.letterSpacing = "1px";
      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      const textWidth = ctx.measureText(lines[longestLineIdx] as string).width;
      const textHeight = lineHeight * lines.length;
      const padding = 5;
      const value =
        clickedX >= roomShape.startX - padding &&
        clickedX <= roomShape.startX + textWidth + padding &&
        clickedY >= roomShape.startY - padding &&
        clickedY <= roomShape.startY + textHeight + padding;
      ctx.restore();
      if (value) return {roomShape:roomShapes[i],index:i};
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
      if (value) return {roomShape:roomShapes[i],index:i};
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
      ctx.lineTo(roomShape.endX - headlen * Math.cos(angle - Math.PI / 6),roomShape.endY - headlen * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(roomShape.endX, roomShape.endY);
      ctx.lineTo(roomShape.endX - headlen * Math.cos(angle + Math.PI / 6),roomShape.endY - headlen * Math.sin(angle + Math.PI / 6));
      const value = ctx.isPointInStroke(clickedX, clickedY);
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
      if (value) return {roomShape:roomShapes[i],index:i};
    } else if (roomShape.type === "rectangle") {
      ctx.beginPath();
      ctx.rect(roomShape.startX,roomShape.startY,roomShape.width,roomShape.height);
      ctx.fill();
      const value = ctx.isPointInPath(clickedX, clickedY);
      ctx.closePath();
      if (value) return {roomShape:roomShapes[i],index:i};
    } else if (roomShape.type === "triangle") {
      ctx.beginPath();
      ctx.moveTo(roomShape.startX + roomShape.width / 2, roomShape.startY);
      ctx.lineTo(roomShape.startX, roomShape.startY + roomShape.height);
      ctx.lineTo(roomShape.startX + roomShape.width,roomShape.startY + roomShape.height);
      ctx.lineTo(roomShape.startX + roomShape.width / 2, roomShape.startY);
      ctx.fill();
      const value = ctx.isPointInPath(clickedX, clickedY);
      ctx.closePath();
      if (value) return {roomShape:roomShapes[i],index:i};
    } else if (roomShape.type === "circle") {
      ctx.beginPath();
      ctx.arc(roomShape.centerX,roomShape.centerY,roomShape.radius,0,Math.PI * 2);
      ctx.fill();
      const value = ctx.isPointInPath(clickedX, clickedY);
      ctx.closePath();
      if (value) return {roomShape:roomShapes[i],index:i};
    }
  }
  return {roomShape:undefined,index:-1};
};

export const getBoundingBoxFromPath = (path: string): { width: number; height: number; minX: number; minY: number } | null => {
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

  if ( minX === Infinity || minY === Infinity || maxX === -Infinity || maxY === -Infinity) return null;
  return { width: maxX - minX, height: maxY - minY, minX, minY };
};

export const strokeToSVG = (points: Point[]): string => {
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

    if (lastPoint && secondLastPoint) path += ` Q ${secondLastPoint.x} ${secondLastPoint.y}, ${lastPoint.x} ${lastPoint.y}`;
  } else if (strokeLength === 2) {
    const firstPoint = points[0];
    const secondPoint = points[1];
    if (firstPoint && secondPoint) path += ` L ${secondPoint.x} ${secondPoint.y}`;
  }
  return path;
};

export const drawHighlightPoints = (highlightPoints: HighlightPoint[],ctx: CanvasRenderingContext2D,socket: WebSocket) => {
  const currentTime = Date.now();
  const maxAge = 2000;
  const fadeDuration = 1000;

  if (highlightPoints.length < 2) return;

  ctx.save();

  const path = new Path2D();
  let startIndex = -1;
  const highlightLength = highlightPoints.length;

  for (let i = 0; i < highlightLength; i++) {
    const age = currentTime - (highlightPoints[i] as HighlightPoint).timestamp;
    if (age <= maxAge + fadeDuration) {
      startIndex = i;
      break;
    }
  }

  if (startIndex === -1) {
    ctx.restore();
    return;
  }

  path.moveTo((highlightPoints[startIndex] as HighlightPoint).x,(highlightPoints[startIndex] as HighlightPoint).y);

  for (let i = startIndex + 1; i < highlightPoints.length; i++) {
    const currPoint = highlightPoints[i];
    if (!currPoint) continue;
    const age = currentTime - (currPoint as HighlightPoint).timestamp;

    if (age > maxAge + fadeDuration) continue;

    if (i > startIndex + 1) {
      const prevPoint = highlightPoints[i - 1];
      if (!prevPoint) continue;
      const midX = (prevPoint.x + currPoint.x) / 2;
      const midY = (prevPoint.y + currPoint.y) / 2;
      path.quadraticCurveTo(prevPoint.x, prevPoint.y, midX, midY);
      path.lineTo(currPoint.x, currPoint.y);
    } else path.lineTo(currPoint.x, currPoint.y);
  }

  drawShape({ type: "highlighter", path } as Shape, ctx);

  // to send highlight stroke
  const svgPath = strokeToSVG(highlightPoints);
  // drawShape({type: "highlighter", svgPath} as Shape,ctx);
  const highlighterShape = { type: "highlighter", svgPath };
  socket.send(JSON.stringify({ type: "chat", message: JSON.stringify(highlighterShape) }));
  ctx.restore();
};
