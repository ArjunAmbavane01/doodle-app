import { z } from "zod";

const point = z.object({
  x: z.number(),
  y: z.number(),
});

const highlightPoint = z.object({
  x: z.number(),
  y: z.number(),
  timestamp: z.number(),
});

const pen = z.object({
  type: z.literal("pen"),
  path: z.string(),
  strokeColour: z.string(),
  strokeWidth: z.number(),
});

const highlighter = z.object({
  type: z.literal("highlighter"),
  path: z.any().optional(),
  svgPath: z.string().optional(),
  points: z.array(highlightPoint).optional(),
});

const text = z.object({
  type: z.literal("text"),
  startX: z.number(),
  startY: z.number(),
  text: z.string(),
  textColour: z.string(),
  fontSize: z.number(),
  textStyle: z.object({ bold: z.boolean(), italic: z.boolean() }),
  fontFamily: z.string(),
});

const line = z.object({
  type: z.literal("line"),
  startX: z.number(),
  startY: z.number(),
  endX: z.number(),
  endY: z.number(),
  strokeColour: z.string(),
  strokeWidth: z.number(),
});

const arrow = z.object({
  type: z.literal("arrow"),
  startX: z.number(),
  startY: z.number(),
  endX: z.number(),
  endY: z.number(),
  strokeColour: z.string(),
  strokeWidth: z.number(),
});

const rectangle = z.object({
  type: z.literal("rectangle"),
  startX: z.number(),
  startY: z.number(),
  width: z.number(),
  height: z.number(),
  strokeColour: z.string(),
  fillColour: z.string(),
  strokeWidth: z.number(),
});

const triangle = z.object({
  type: z.literal("triangle"),
  startX: z.number(),
  startY: z.number(),
  width: z.number(),
  height: z.number(),
  strokeColour: z.string(),
  fillColour: z.string(),
  strokeWidth: z.number(),
});

const circle = z.object({
  type: z.literal("circle"),
  centerX: z.number(),
  centerY: z.number(),
  radius: z.number(),
  strokeColour: z.string(),
  fillColour: z.string(),
  strokeWidth: z.number(),
});

const genAI = z.object({
  type: z.literal("genAI"),
  startX: z.number(),
  startY: z.number(),
  width: z.number(),
  height: z.number(),
  svgPath: z.string(),
  strokeColour: z.string(),
  strokeWidth: z.number(),
});

export const shapeSchema = z.discriminatedUnion("type", [
  pen,
  text,
  highlighter,
  line,
  arrow,
  rectangle,
  triangle,
  circle,
  genAI
]);

const roomShape = z.object({
  userId: z.string(),
  shape: shapeSchema,
});

export type Shape = z.infer<typeof shapeSchema>;
export type RoomShape = z.infer<typeof roomShape>;
export type HighlightPoint = z.infer<typeof highlightPoint>;
export type Point = z.infer<typeof point>;
export type genAI = z.infer<typeof genAI>;
