import { verify } from "jsonwebtoken";
import { WebSocketServer, WebSocket } from "ws";
import { JWT_SECRET } from "@workspace/backend-common/config";
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

const checkUser = (token: string | null) => {
  if (!token) return null;
  const payload = verify(token, JWT_SECRET as string);
  if (!payload || typeof payload === "string") return;
  return payload.user.id;
};

const users: IUser[] = [];

wss.on("connection", (ws: WebSocket, req) => {
  const reqURL = req.url;
  if (!reqURL) return;
  const params = new URLSearchParams(reqURL.split("?")[1]);
  const token = params.get("token");
  const userId = checkUser(token);
  if (!userId) return;
  ws.on("message", async (data) => {
    let parsedData;
    if (typeof data !== "string") {
      parsedData = JSON.parse(data.toString());
    } else {
      parsedData = JSON.parse(data);
    }

    if (parsedData.type === "join_room") {
      const roomId = parsedData.roomId;
      const user = users.find((x) => x.ws == ws);
      if (!user) return;
      user?.rooms.push(roomId);
    } else if (parsedData.type === "leave_room") {
      const roomId = parsedData.roomId;
      const user = users.find((x) => x.ws == ws);
      if (!user) return;
      user?.rooms.filter((x) => x != roomId);
    } else if (parsedData.type === "chat") {
      const roomId = parsedData.roomId;
      const message = parsedData.message;
      await prisma.chat.create({
        data: {
          message,
          roomId,
          userId,
        },
      });
      users.forEach((user) => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(
            JSON.stringify({
              type: "chat",
              message,
              roomId,
            })
          );
        }
      });
    }
    ws.send("hello");
  });
});
