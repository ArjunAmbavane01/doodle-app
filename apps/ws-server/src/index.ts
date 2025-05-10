import { WebSocketServer, WebSocket } from "ws";
import { verify } from "jsonwebtoken";
import { WS_JWT_SECRET } from "@workspace/backend-common/config";
import prisma from "@workspace/db/client";
import { messageSchema } from "@workspace/common/messages";
import { shapeSchema } from "@workspace/common/shapes";

interface IUser { userId: string; rooms: number[]; ws: WebSocket; }

const users: IUser[] = [];

const wss = new WebSocketServer({ port: 8080 });

const checkToken = (token: string | null) => {
  try {
    if (!token) return { type: "error", msg: "Token not present" };
    const payload = verify(token, WS_JWT_SECRET as string);
    if (!payload || typeof payload === "string") return { type: "error", msg: "Token payload not present" };
    return { type: "success", userId: payload.userId, roomId: payload.roomId };
  } catch (e) {
    return { type: "error", msg: "JWT token expired" }
  }
};

wss.on("connection", (ws: WebSocket, req) => {
  const reqURL = req.url;
  if (!reqURL) return;
  const params = new URLSearchParams(reqURL.split("?")[1]);
  const token = params.get("token");
  const res = checkToken(token);
  if (res.type === "error") {
    if (res.msg === "JWT token expired") ws.send(JSON.stringify({ type: "error", message: "Your session has expired. Please log in again." }));
    ws.close();
    console.error(res.msg);
  }
  if (!res || !res.userId || !res.roomId) return;
  const { userId, roomId } = res;
  users.push({ userId, rooms: [], ws } as IUser);

  ws.on("message", async (data) => {
    let parsedData;
    if (typeof data !== "string") parsedData = JSON.parse(data.toString());
    else parsedData = JSON.parse(data);
    const result = messageSchema.safeParse(parsedData);
    if (result.error) {
      ws.send(`Invalid message format : ${result.error}`);
      return;
    }
    const msg = result.data;

    if (msg.type === "join_room") {
      const user = users.find((x) => x.ws == ws);
      if (!user) return;
      user.rooms.push(roomId);
      try {
        const userData = await prisma.user.findFirst({ where: { id: userId } });
        users.forEach((user) => {
          if (user.userId != userId && user.rooms.includes(roomId)) user.ws.send(JSON.stringify({ type: "collaborator_joined", userId, username: userData!.name }));
        });
      } catch (e) {
        console.error("Database error:", e);
        ws.send(JSON.stringify({ type: "error", message: "Error joining room, please try again later.", }));
      }
    } else if (msg.type === "leave_room") {
      try {
        const user = users.find((x) => x.ws == ws);
        if (!user) return;
        user.rooms.filter((x) => x != roomId);
        users.forEach((user) => {
          if (user.userId != userId && user.rooms.includes(roomId)) user.ws.send(JSON.stringify({ type: "collaborator_left", userId }));
        });
      } catch (e) {
        console.error("Database error:", e);
        ws.send(JSON.stringify({ type: "error", message: "Error leaving room, please try again later.", }));
      }
    } else if (msg.type === "user_pos") {
      try {
        const { posX, posY } = msg;
        users.forEach((user) => {
          if (user.userId != userId && user.rooms.includes(roomId)) user.ws.send(JSON.stringify({ type: "collaborator_pos", userId, posX, posY }));
        });
      } catch (e) {
        console.error("Error:", e);
        ws.send(JSON.stringify({ type: "error", message: "Error sending user position", }));
      }
    } else if (msg.type === "chat") {
      const { message } = msg;
      try {
        const shapeReceived = JSON.parse(message);
        const shapeResult = shapeSchema.safeParse(shapeReceived);
        if (shapeResult.error) {
          console.error(`Invalid shape format : ${shapeResult.error}`);
          ws.send('Invalid shape format');
          return;
        }
        if (shapeReceived.type !== "highlighter") await prisma.chat.create({ data: { message, roomId, userId: msg.userId } });
        users.forEach((user) => {
          if (user.userId != userId && user.rooms.includes(roomId)) user.ws.send(JSON.stringify({ type: "chat", message, userId: msg.userId }));
        });
      } catch (e) {
        console.error("Database error:", e);
        ws.send(JSON.stringify({ type: "error", message: "Error creating shape, please try again later.", }));
      }
    } else if (msg.type === "delete_shape") {
      try {
        const shapeToDelete = await prisma.chat.findFirst({ where: { roomId, message: msg.message }, orderBy: { id: "desc", }, });
        if (shapeToDelete) {
          await prisma.chat.delete({ where: { id: shapeToDelete.id } })
          users.forEach((user) => {
            if (user.userId != userId && user.rooms.includes(roomId)) user.ws.send(JSON.stringify({ type: "remove_shape", userId: shapeToDelete.userId, message: shapeToDelete.message }));
          });
        }
        else ws.send(JSON.stringify({ type: "error", message: "Shape not found, please try again later.", }));
      } catch (e) {
        console.error("Database error:", e);
        ws.send(JSON.stringify({ type: "error", message: "Error deleting shape, please try again later.", }));
      }
    } else if (msg.type === "move_shape") {
      try {
        const { prevShape, newShape } = msg.message;
        const shapeToMove = await prisma.chat.findFirst({ where: { roomId, message: prevShape }, orderBy: { id: "desc", }, });
        if (shapeToMove) {
          await prisma.chat.update({ where: { id: shapeToMove.id }, data: { message: newShape } });
          users.forEach((user) => {
            if (user.userId != userId && user.rooms.includes(roomId)) user.ws.send(JSON.stringify({ type: "move_shape", userId: msg.userId, message: msg.message }));
          });
        }
        else ws.send(JSON.stringify({ type: "error", message: "Shape not found, please try again later.", }));
      } catch (e) {
        console.error("Database error:", e);
        ws.send(JSON.stringify({ type: "error", message: "Error moving shape, please try again later.", }));
      }
    } else {
        ws.send(JSON.stringify({ type: "error", message: "Invalid message type", }));

    }
  });
});
