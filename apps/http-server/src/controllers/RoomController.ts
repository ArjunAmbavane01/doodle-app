import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { sign } from "jsonwebtoken";
import { ICustomRequest } from "../auth";
import prisma from "@workspace/db/client";
import { WS_JWT_SECRET } from "@workspace/backend-common/config";
import { roomJoinSchema } from "@workspace/backend-common/schemas";

export const createRoom = async (req: ICustomRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const newRoom = await prisma.room.create({ data: { slug: uuidv4(), adminId: userId } });
    res.status(200).json({ type: "success", message: "New Room created successfully", data: { slug: newRoom.slug } });
  } catch (e) {
    res.status(500).json({ type: "error", message: "Internal Server Error", error: e });
  }
};

export const joinRoom = async (req: ICustomRequest, res: Response) => {
  try {
    const result = roomJoinSchema.safeParse(req.body);
    if (result.error) {
      console.error(`Invalid request body`, result.error.format());
      res.status(400).json({ type: "error", message: "Invalid body format", error: result.error.flatten() });
      return;
    }
    const { slug: roomSlug } = result.data;
    const userId = req.userId;
    const room = await prisma.room.findFirst({ where: { slug: roomSlug } });
    if (!room) {
      res.status(400).json({ type: "error", message: "Room Does Not Exists" });
      return;
    }
    // gets room's previous messages
    const roomMessages = await prisma.chat.findMany({
      where: { roomId: room.id },
      orderBy: { id: "desc" },
      take: 1000,
    });

    const payload = { userId, roomId: room.id };
    const wsToken = sign(payload, WS_JWT_SECRET as string, { expiresIn: "10m" });

    res.status(200).json({ type: "success", message: "Room found", data: { token: wsToken, roomMessages } });
  } catch (e) {
    res.status(500).json({ type: "error", message: "Internal Server Error", error: e });
  }
};
