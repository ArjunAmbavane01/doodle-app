import prisma from "@workspace/db/client";
import { Request, Response, Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { ICustomRequest } from "../auth";
import { WS_JWT_SECRET } from "@workspace/backend-common/config";
import { sign } from "jsonwebtoken";

export const createRoom = async (req:ICustomRequest , res: Response) => {
  try {
    const userId = req.userId;
    const newRoom = await prisma.room.create({data: { slug: uuidv4(), adminId: userId as string}});
    res.status(200).json({ type: "success", message: "New Room created successfully", data: { slug: newRoom.slug }});
    return;
  } catch (e) {
    res.status(500).json({type: "error",message: "Internal server error",error: e });
  }
};



export const joinRoom = async (req: ICustomRequest, res: Response) => {
  const {slug:roomSlug} = req.body;
  const userId = req.userId;
  try {
    const room = await prisma.room.findFirst({ where: { slug: roomSlug }});
    if (!room) {
      res.status(400).json({ type: "error", message: "Room does not exists" });
      return;
    }

    const payload = { userId, roomId:room.id}
    const wsToken = sign(payload,WS_JWT_SECRET as string,{expiresIn: "10m" });

    // get room messages
    const roomMessages = await prisma.chat.findMany({
      where:{ roomId:room.id },
      orderBy:{id:"desc"},
      take:1000
    });
    res.status(200).json({ type: "success", message: "Room found", data: { token:wsToken,roomMessages }});
    return;
  } catch (e) {
    res.status(500).json({ type: "error", message: "Internal server error", error: e });
  }
};
