import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { JWT_SECRET } from "@workspace/backend-common/config";

export interface ICustomRequest extends Request{ userId?:string }

export const auth = (req: ICustomRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!token) {
      res.status(401).json({ type: "error", message: "JWT token not present"});
      return;
    }
    try {
      const payload = verify(token, JWT_SECRET as string);
      if(typeof payload === 'string'){
        res.status(401).json({ type: "error", message: "Invalid JWT token"});
        return;
      }
      if (!payload || !payload.id) {
        res.status(401).json({ type: "error", message: "Invalid JWT token" });
        return;
      }
      req.userId = payload.id;
      next();
    } catch (e) {
      res.status(401).json({ type: "error", message: "Invalid JWT token"});
      return;
    }
  } catch (e) {
    res.status(500).json({ type: "error", message: "Internal Server Error", error: e,});
    return;
  }
};
