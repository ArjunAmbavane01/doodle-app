import { z } from "zod";

export const googleLoginSchema = z.object({
  name: z.string().nonempty("Name is required"),
  email: z.string().email("Invalid email format"),
  oauth_id: z.string().nonempty("OAuth ID is required"),
  provider: z.literal("google"),
  photo: z.string().url().optional(),
});

export const roomJoinSchema = z.object({
  slug: z.string().nonempty("Room slug is required"),
});
