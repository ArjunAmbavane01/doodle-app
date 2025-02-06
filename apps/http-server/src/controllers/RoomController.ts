import prisma from "@workspace/db/client";
import { Request, Response, Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { ICustomRequest } from "../auth";

export const createRoom = async (req:ICustomRequest , res: Response) => {
  try {
    const userId = req.userId;
    console.log(userId)
    const newRoom = await prisma.room.create({
      data: {
        slug: uuidv4(),
        adminId: userId as string,
      },
    });

    res.status(200).json({
      type: "success",
      message: "New Room created successfully",
      data: {
        slug: newRoom.slug,
      },
    });
    return;
  } catch (e) {
    res.status(500).json({
      type: "error",
      message: "Internal server error",
      error: e,
    });
  }
};
export const joinRoom = async (req: Request, res: Response) => {
  const body = req.body;
  try {
    const roomSlug = body.slug;
    const room = await prisma.room.findFirst({
      where: { slug: roomSlug },
    });
    if (!room) {
      res.status(400).json({
        type: "error",
        message: "Room does not exists",
      });
      return;
    }
    res.status(200).json({
      type: "success",
      message: "Room found",
      data: {
        roomId: room.id,
      },
    });
    return;
  } catch (e) {
    res.status(500).json({
      type: "error",
      message: "Internal server error",
      error: e,
    });
  }
};
