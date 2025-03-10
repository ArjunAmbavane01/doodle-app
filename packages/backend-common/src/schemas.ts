import { z } from "zod";

export const loginSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  oauth_id: z.string(),
  provider: z.literal("google"),
  photo: z.string().optional(),
});

export const joinRoomSchema = z.object({
  slug: z.string()
});