import { verify } from "jsonwebtoken";
import { WebSocketServer, WebSocket } from "ws";
import { WS_JWT_SECRET } from "@workspace/backend-common/config";
import prisma from "@workspace/db/client";
import { messageSchema } from "@workspace/common/messages";
import { shapeSchema } from "@workspace/common/shapes";

// Auto-delete empty rooms
// If all users leave a room, remove it from the WebSocket state.
// Optionally, delete it from the DB after a timeout.


interface IUser { userId: string; rooms: number[]; ws: WebSocket; }

const users: IUser[] = [];

const wss = new WebSocketServer({ port: 8080 });

const checkToken = (token: string | null) => {
  if (!token) return null;
  const payload = verify(token, WS_JWT_SECRET as string);
  if (!payload || typeof payload === "string") return;
  return { userId: payload.userId, roomId: payload.roomId };
};


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
    const result = messageSchema.safeParse(parsedData);
    if(result.error){
      ws.send(`Invalid message format : ${result.error}`);
      return;
    }
    const msg = result.data;

    if (msg.type === "join_room") {
      const user = users.find((x) => x.ws == ws);
      if (!user) return;
      user.rooms.push(roomId);
      const userData = await prisma.user.findFirst({where:{id:userId}});
      users.forEach((user) => {
        if (user.userId != userId && user.rooms.includes(roomId)) user.ws.send(JSON.stringify({ type: "collaborator_joined", userId, username:userData!.name }));
      });
    } else if (msg.type === "leave_room") {
      const user = users.find((x) => x.ws == ws);
      if (!user) return;
      user.rooms.filter((x) => x != roomId);
      users.forEach((user) => {
        if (user.userId != userId && user.rooms.includes(roomId)) user.ws.send(JSON.stringify({ type: "collaborator_left", userId }));
      });
    } else if (msg.type === "user_pos") {
      try {
        const { posX, posY } = msg;
        users.forEach((user) => {
          if (user.userId != userId && user.rooms.includes(roomId)) user.ws.send(JSON.stringify({ type: "collaborator_pos", userId , posX, posY }));
        });
      } catch (e) {
        console.error("Error:", e);
        ws.send(JSON.stringify({ type: "error", message: "Error sending user position",}));
      }
    } else if (msg.type === "chat") {
      const { message } = msg;
      try {
        const shapeReceived = JSON.parse(message);
        const shapeResult = shapeSchema.safeParse(shapeReceived);
        if(shapeResult.error){
          console.error(`Invalid shape format : ${shapeResult.error}`);
          ws.send('Invalid shape format');
          return;
        }
        if(shapeReceived.type !== "highlighter") await prisma.chat.create({ data: { message, roomId, userId:msg.userId } });
        users.forEach((user) => {
          if (user.userId != userId && user.rooms.includes(roomId)) user.ws.send(JSON.stringify({ type: "chat", message, userId:msg.userId }));
        });
      } catch (e) {
        console.error("Database error:", e);
        ws.send(JSON.stringify({ type: "error", message: "Error creating shape, please try again later.",}));
      }
    } else if (msg.type === "delete_shape") {
      try {
        const shapeToDelete = await prisma.chat.findFirst({ where: {roomId, message:msg.message }, orderBy: { id: "desc",},});
        if(shapeToDelete){
          await prisma.chat.delete({ where: {id: shapeToDelete.id}})
          users.forEach((user) => {
            if (user.userId != userId && user.rooms.includes(roomId)) user.ws.send(JSON.stringify({ type: "remove_shape",userId:shapeToDelete.userId, message: shapeToDelete.message }));
          });
        }
        else ws.send(JSON.stringify({ type: "error", message: "Shape not found, please try again later.",}));
      } catch (e) {
        console.error("Database error:", e);
        ws.send(JSON.stringify({ type: "error", message: "Error deleting shape, please try again later.",}));
      }
    } else if (msg.type === "move_shape") {
      try {
        const {prevShape,newShape} = msg.message;
        const shapeToMove = await prisma.chat.findFirst({ where: {roomId, message:prevShape }, orderBy: { id: "desc",},});
        if(shapeToMove){
          await prisma.chat.update({where: {id: shapeToMove.id}, data:{message:newShape}});
          users.forEach((user) => {
            if (user.userId != userId && user.rooms.includes(roomId)) user.ws.send(JSON.stringify({ type: "move_shape", userId:msg.userId, message:msg.message}));
          });
        }
        else ws.send(JSON.stringify({ type: "error", message: "Shape not found, please try again later.",}));
      } catch (e) {
        console.error("Database error:", e);
        ws.send(JSON.stringify({ type: "error", message: "Error moving shape, please try again later.",}));
      }
    }
  });
});
