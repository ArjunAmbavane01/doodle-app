import { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import prisma from "@workspace/db/client";
import { JWT_SECRET } from "@workspace/backend-common/config";

interface ILoginPayload {
  name: string;
  email: string;
  oauth_id: string;
  provider: string;
  photo?: string;
}

// also use zod 
// Fix the problem ki jwt is still valid after next auth logout
class AuthController {
  static login = async (req: Request, res: Response) => {
    try {
      const body: ILoginPayload = req.body;
      let user = await prisma.user.findUnique({ where: { email: body.email }});

      if (!user) user = await prisma.user.create({ data: body });
      
      const JWTPayload = { name: body.name, email: body.email, id: user.id};
      
      const token = sign(JWTPayload, JWT_SECRET as string, { expiresIn: "365d" });

      res.status(200).json({ type: "success", message: "Login Successful", user:{ ...user, token:token }});
    } catch (e) {
      res.status(500).json({type: "error", message: "Internal Server Error", error: e});
    }
  };
}

export default AuthController;
