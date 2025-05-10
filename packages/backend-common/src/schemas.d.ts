import { z } from "zod";
export declare const googleLoginSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    oauth_id: z.ZodString;
    provider: z.ZodLiteral<"google">;
    photo: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    oauth_id: string;
    provider: "google";
    photo?: string | undefined;
}, {
    name: string;
    email: string;
    oauth_id: string;
    provider: "google";
    photo?: string | undefined;
}>;
export declare const roomJoinSchema: z.ZodObject<{
    slug: z.ZodString;
}, "strip", z.ZodTypeAny, {
    slug: string;
}, {
    slug: string;
}>;
export declare const generateSvgSchema: z.ZodObject<{
    shape: z.ZodObject<{
        type: z.ZodLiteral<"genAI">;
        startX: z.ZodNumber;
        startY: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
        svgPath: z.ZodString;
        strokeColour: z.ZodString;
        strokeWidth: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        type: "genAI";
        startX: number;
        startY: number;
        width: number;
        height: number;
        svgPath: string;
        strokeColour: string;
        strokeWidth: number;
    }, {
        type: "genAI";
        startX: number;
        startY: number;
        width: number;
        height: number;
        svgPath: string;
        strokeColour: string;
        strokeWidth: number;
    }>;
    prompt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    shape: {
        type: "genAI";
        startX: number;
        startY: number;
        width: number;
        height: number;
        svgPath: string;
        strokeColour: string;
        strokeWidth: number;
    };
    prompt: string;
}, {
    shape: {
        type: "genAI";
        startX: number;
        startY: number;
        width: number;
        height: number;
        svgPath: string;
        strokeColour: string;
        strokeWidth: number;
    };
    prompt: string;
}>;
//# sourceMappingURL=schemas.d.ts.map