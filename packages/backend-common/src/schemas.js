"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSvgSchema = exports.roomJoinSchema = exports.googleLoginSchema = void 0;
const zod_1 = require("zod");
exports.googleLoginSchema = zod_1.z.object({
    name: zod_1.z.string().nonempty("Name is required"),
    email: zod_1.z.string().email("Invalid email format"),
    oauth_id: zod_1.z.string().nonempty("OAuth ID is required"),
    provider: zod_1.z.literal("google"),
    photo: zod_1.z.string().url().optional(),
});
exports.roomJoinSchema = zod_1.z.object({
    slug: zod_1.z.string().nonempty("Room slug is required"),
});
exports.generateSvgSchema = zod_1.z.object({
    shape: zod_1.z.object({
        type: zod_1.z.literal("genAI"),
        startX: zod_1.z.number(),
        startY: zod_1.z.number(),
        width: zod_1.z.number(),
        height: zod_1.z.number(),
        svgPath: zod_1.z.string(),
        strokeColour: zod_1.z.string(),
        strokeWidth: zod_1.z.number()
    }),
    prompt: zod_1.z.string().min(3).max(100)
});
