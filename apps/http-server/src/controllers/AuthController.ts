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


// Fix the problem ki jwt is still valid after next auth logout
class AuthController {
  static login = async (req: Request, res: Response) => {
    try {
      const body: ILoginPayload = req.body;
      
      console.log(`\nbody : ${JSON.stringify(body)}`)
      console.log(`\nemail : ${body.email}`)

      let user = await prisma.user.findUnique({ where: { email: body.email }});

      console.log(`\nuser : ${user}`)
      
      if (!user) user = await prisma.user.create({ data: body });
      
      console.log(`\nuser : ${JSON.stringify(user)}`)
      
      const JWTPayload = { name: body.name, email: body.email, id: user.id};
      
      console.log(`\njwtPayload : ${JSON.stringify(JWTPayload)}`)
      console.log(`\n SECRET : ${JWT_SECRET}`)

      const token = sign(JWTPayload, JWT_SECRET as string, { expiresIn: "365d" });

      console.log(`\n\n token : ${token}`);

      res.status(200).json({
        type: "success",
        message: "Login Successful",
        user:{
          ...user,
          token:token
        }
      });
      return;
      
    } catch (e) {
      res.status(500).json({
        type: "error",
        message: "Something went wrong",
        error: e,
      });
      return
    }
  };
}

export default AuthController;
