import { Request, Response } from "express";
import { sign } from "jsonwebtoken";
import prisma from "@workspace/db/client";
import { JWT_SECRET } from "@workspace/backend-common/config";
import { googleLoginSchema } from "@workspace/backend-common/schemas";

// Fix the problem ki jwt is still valid after next auth logout
export const login = async (req: Request, res: Response) => {
  try {
    const result = googleLoginSchema.safeParse(req.body);
    if (result.error) {
      console.error(`Invalid request body`, result.error.format());
      res.status(400).json({ type: "error", message: "Invalid body format", error: result.error.flatten() });
      return;
    }
    const body = result.data;
    let user = await prisma.user.findUnique({ where: { email: body.email } });

    if (!user) user = await prisma.user.create({ data: body });

    const JWTPayload = { name: body.name, email: body.email, id: user.id };
    const token = sign(JWTPayload, JWT_SECRET as string, { expiresIn: "365d" });
    res.status(200).json({ type: "success", message: "Login Successful", user: { ...user, token: token } });
  } catch (e) {
    res.status(500).json({ type: "error", message: "Internal Server Error", error: e });
  }
};
