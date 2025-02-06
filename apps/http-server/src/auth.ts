import { JWT_SECRET } from "@workspace/backend-common/config";
import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

interface ICustomRequest extends Request{
    userId?:string
}

export const auth = (req: ICustomRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["authorization"];
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split("Bearer ")[1]
        : null;
    if (!token) {
      res.status(400).json({
        type: "error",
        message: "JWT token not present",
      });
      return;
    }
    try {
      const payload = verify(token, JWT_SECRET as string);
      req.userId = payload.userId;
      next();
    } catch (e) {
      res.status(400).json({
        type: "error",
        message: "Invalid JWT token",
      });
      return;
    }
  } catch (e) {
    res.status(500).json({
      type: "error",
      message: "Internal Server Error",
      error: e,
    });
    return;
  }
};
