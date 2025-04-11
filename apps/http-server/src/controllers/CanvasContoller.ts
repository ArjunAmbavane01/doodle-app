import 'dotenv/config';
import OpenAI from "openai";
import { Request, Response } from "express";
import { generateSvgSchema } from "@workspace/backend-common/schemas";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function promptToSVG(startX: number, startY: number, width: number, height: number, promptText: string) {
  try {
    console.log(promptText);
    const userPrompt = `
    You are an SVG generator.
    
    Return only the 'd' attribute (path data) of a valid SVG path that represents the object: "${promptText}".
    
    **Constraints**:
    - Start at point (${startX}, ${startY}).
    - Keep the entire drawing inside a bounding box of width ${width} and height ${height}, starting at (${startX}, ${startY}).
    - Use only these commands: M, L, H, V, C, Q, Z.
    - Close the path using "Z" if the shape is enclosed.
    - Do not add comments, explanations, or any tags—only return the raw path string.
    
    **Style Tips**:
    - Use curves ('C', 'Q') where appropriate for round or natural shapes.
    - Keep path length balanced—neither overly minimal nor over-detailed.
    - Keep shapes visually representative — avoid abstract patterns.
    - Try to structure the object in distinct parts (e.g., roof + walls, trunk + canopy)..
    
    **Examples**:
    1. For a simple house: M20 60 L20 40 L40 40 L40 60 Z M20 40 L30 30 L40 40 ZM10 80 L30 50 L50 80 Z
    2. For a triangle: M10 10 L50 10 L30 40 Z
    Now generate the path for: "${promptText}"
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