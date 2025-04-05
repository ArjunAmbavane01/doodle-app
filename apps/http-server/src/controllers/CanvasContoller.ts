import 'dotenv/config';
import OpenAI from "openai";
import { Request, Response } from "express";
import { generateSvgSchema } from "@workspace/backend-common/schemas";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function promptToSVG(startX: number, startY: number, width: number, height: number, promptText: string) {
  try {
    const userPrompt = `
    Generate an SVG path (just the 'd' attribute, no <svg> or <path> tags) for this illustration: "${promptText}".
    The shape must be fully contained inside a bounding box starting at (${startX}, ${startY}) with width ${width} and height ${height}.
    Do not explain. Just return the SVG path string.`.trim();
    
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that only returns SVG path data (`d` attribute)."
        },
        {
          role: "user",
          content: userPrompt
        }
      ]
    });

    const svg = response.choices[0] && response.choices[0].message.content?.trim() || '';
    console.log(svg);
    return svg;
  } catch (error: any) {
    console.error('Error generating SVG:', error.message);
    throw error;
  }
}

export const generateSvg = async (req: Request, res: Response) => {
  try {
    const result = generateSvgSchema.safeParse(req.body);
    if (!result.success) {
      console.error(`Invalid request body`, result.error.format());
      res.status(400).json({ type: "error", message: "Invalid body format", error: result.error.flatten() });
      return;
    }
    
    const { startX, startY, width, height } = result.data.shape;
    const prompt = result.data.prompt;
    const svgPath = await promptToSVG(startX, startY, width, height, prompt);

    if (!svgPath || !svgPath.startsWith("M")) {
      res.status(500).json({ type: "error", message: "Invalid SVG path response", svgPath });
      return
    }

    res.status(200).json({ type: "success", message: "SVG Path created successfully", svgPath });
  } catch (e) {
    res.status(500).json({ type: "error", message: "Internal Server Error", error: e });
  }
};