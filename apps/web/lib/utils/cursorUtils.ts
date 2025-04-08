import { IRoomUserPos } from "../draw-engine";

export const drawUserCursor = (user: IRoomUserPos, userId: string, ctx: CanvasRenderingContext2D) => {
  if (!ctx || !user) return;

  const colour = getUserColour(userId);

  ctx.save();
  const cursorPath = new Path2D("M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z");
  ctx.translate(user.posX, user.posY);
  ctx.fillStyle = colour;
  ctx.fill(cursorPath);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 1;
  ctx.stroke(cursorPath);

  ctx.font = "12px sans-serif";
  const textMetrics = ctx.measureText(user.displayName!);
  const textWidth = textMetrics.width;

  const tagWidth = textWidth + 24;
  const tagHeight = 24;
  const tagX = 10;
  const tagY = tagHeight - 5;

  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.roundRect(tagX, tagY, tagWidth, tagHeight, 8);
  ctx.fill();
  ctx.fillStyle = "white";
  ctx.fillText(user.displayName!, tagX + 12, tagY + tagHeight / 2 + 4);
  ctx.closePath();
  ctx.restore();
};

const getUserColour = (userId: string) => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0x7f;
    value = Math.max(32, value);
    color += ("00" + value.toString(16)).slice(-2);
  }
  return color;
};

export const getUserDisplayName = (userId: string) => {
  const names = ["Vector Vulture", "Glitchy Gecko", "Cyber Corgi", "Neon Newt", "Pixel Pigeon", "Sketchy Lynx", "Binary Bunny", "Gradient Giraffe", "Code Chameleon", "Render Raccoon",];

  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  const nameIndex = Math.abs(hash) % names.length;
  return names[nameIndex];
};
