import 'dotenv/config';
import OpenAI from "openai";
import { Request, Response } from "express";
import { generateSvgSchema } from "@workspace/backend-common/schemas";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function promptToSVG(startX: number, startY: number, width: number, height: number, promptText: string) {
  try {
    console.log(promptText);
    const userPrompt = `
You are to generate only the 'd' attribute of an SVG path representing the following object: "${promptText}".
Requirements:
- The path must start at (${startX}, ${startY}) and be fully enclosed within a bounding box of width ${width} and height ${height}.
- Only use SVG path commands: M, L, H, V, C, Q, Z.
- Return ONLY the SVG path string. No explanations, comments, or tags.
`.trim();

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.3,
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
    console.log(svg)
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