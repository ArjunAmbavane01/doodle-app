import { Request, Response } from "express";
import { generateSvgSchema } from "@workspace/backend-common/schemas";

export const generateSvg = async (req: Request, res: Response) => {
  try {
    const result = generateSvgSchema.safeParse(req.body);
    if (result.error) {
      console.error(`Invalid request body`, result.error.format());
      res.status(400).json({ type: "error", message: "Invalid body format", error: result.error.flatten() });
      return;
    }
    const body = result.data;
    const svgPath = "M2970,2690 L3079,2639 L3188,2690 L3188,2750 L2970,2750 Z M3030,2750 V2720 H3120 V2750 Z"
    res.status(200).json({ type: "success", message: "SVG Path created successfully", svgPath });
  } catch (e) {
    res.status(500).json({ type: "error", message: "Internal Server Error", error: e });
  }
};
