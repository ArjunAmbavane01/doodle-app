import prisma from "@workspace/db/client";
import { Request, Response, Router } from "express";
import { v4 as uuidv4 } from "uuid";


const createRoom =  async (req: Request, res: Response) => {
  const body = req.body;
  try{

      const userId = body.userId;
      const newRoom = await prisma.room.create({
          data: {
              slug: uuidv4(),
              adminId: userId,
            },
        });
        
  res.status(200).json({
      type:'success',
      message:'New Room created successfully',
      data:{
          slug:newRoom.slug
        }
    })
    return;
} catch(e){
    res.status(500).json({
        type:'error',
        message:'Internal server error',
        error:e
    })
}
};

export default createRoom;