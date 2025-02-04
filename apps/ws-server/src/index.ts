import { verify } from "jsonwebtoken";
import { WebSocketServer } from "ws";
import { JWT_SECRET } from "@workspace/backend-common/config";
import prisma from "@workspace/db/client";


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

wss.on("connection", (ws, req) => {
  const reqURL = req.url;
  // if(!reqURL) return;
  // const params = new URLSearchParams(reqURL.split('?')[1]);
  // const token = params.get('token');
  // const userId = checkUser(token);
  // if(!userId) return;
  ws.on("message", (data) => {
    let parsedData;
    if (typeof data !== "string") {
    parsedData = JSON.parse(data.toString());
    } else {
    parsedData = JSON.parse(data);
    }

    if(parsedData.type === 'join_room'){
        const roomSlug = parsedData.slug;
        // const roomId = prisma.room.findFirst({
        //     where:{
        //         slug:roomSlug
        //     }
        // })
        // if(!roomId){
        //     ws.send()
        // }
    }
    ws.send("hello");
  });
});
