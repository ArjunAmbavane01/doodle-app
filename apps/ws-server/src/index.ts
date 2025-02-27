import { verify } from "jsonwebtoken";
import { WebSocketServer, WebSocket } from "ws";
import { WS_JWT_SECRET } from "@workspace/backend-common/config";
import prisma from "@workspace/db/client";

interface IUser {
  userId: string;
  rooms: number[];
  ws: WebSocket;
}
// Auto-delete empty rooms

// If all users leave a room, remove it from the WebSocket state.
// Optionally, delete it from the DB after a timeout.

const wss = new WebSocketServer({ port: 8080 });

const checkToken = (token: string | null) => {
  if (!token) return null;
  const payload = verify(token, WS_JWT_SECRET as string);
  if (!payload || typeof payload === "string") return;
  return { userId: payload.userId, roomId: payload.roomId };
};

const users: IUser[] = [];

wss.on("connection", (ws: WebSocket, req) => {
  const reqURL = req.url;
  if (!reqURL) return;
  const params = new URLSearchParams(reqURL.split("?")[1]);
  const token = params.get("token");
  const payload = checkToken(token);
  if (!payload || !payload.userId || !payload.roomId) return;
  const { userId, roomId } = payload;
  users.push({ userId, rooms: [], ws } as IUser);

  ws.on("message", async (data) => {
    let parsedData;
    if (typeof data !== "string") parsedData = JSON.parse(data.toString());
    else parsedData = JSON.parse(data);

    if (parsedData.type === "join_room") {
      const user = users.find((x) => x.ws == ws);
      if (!user) return;
      user?.rooms.push(roomId);
    } else if (parsedData.type === "leave_room") {
      const user = users.find((x) => x.ws == ws);
      if (!user) return;
      user?.rooms.filter((x) => x != roomId);
    } else if (parsedData.type === "user_pos") {
      try {
        const posX = parsedData.clientX;
        const posY = parsedData.clientY;
        users.forEach((user) => {
          if (user.userId != userId && user.rooms.includes(roomId)) user.ws.send(JSON.stringify({ type: "room_user_pos", userId , posX, posY }));
        });
      } catch (e) {
        console.error("Database error:", e);
        ws.send(JSON.stringify({ type: "error", message: "Database error, please try again later.",}));
      }
    } 
    else if (parsedData.type === "chat") {
      const message = parsedData.message;
      try {
        const shapeReceived = JSON.parse(message);
        if(shapeReceived.type !== "highlighter") await prisma.chat.create({ data: { message, roomId, userId } });
        users.forEach((user) => {
          if (user.userId != userId && user.rooms.includes(roomId)) user.ws.send(JSON.stringify({ type: "chat", message, roomId, userId }));
        });
      } catch (e) {
        console.error("Database error:", e);
        ws.send(JSON.stringify({ type: "error", message: "Database error, please try again later.",}));
      }
    } else if (parsedData.type === "delete_shape") {
      try {
        const shapeToDelete = await prisma.chat.findFirst({ where: {roomId, message:parsedData.message }, orderBy: { id: "desc",},});
        if(shapeToDelete){
          await prisma.chat.delete({ where: {id: shapeToDelete.id}})
          users.forEach((user) => {
            if (user.userId != userId && user.rooms.includes(roomId)) user.ws.send(JSON.stringify({ type: "remove_shape", message: shapeToDelete.message, userId:shapeToDelete.userId }));
          });
        }
        else{
          ws.send(JSON.stringify({ type: "error", message: "Shape not found, please try again later.",}));
        }
      } catch (e) {
        console.error("Database error:", e);
        ws.send(JSON.stringify({ type: "error", message: "Database error, please try again later.",}));
      }
    }
  });
});
