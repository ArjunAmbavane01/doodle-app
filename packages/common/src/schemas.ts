import { z } from "zod";

const joinRoomSchema = z.object({ type: z.literal("join_room") });

const leaveRoomSchema = z.object({ type: z.literal("leave_room") });

const userPosSchema = z.object({
  type: z.literal("user_pos"),
  posX: z.number(),
  posY: z.number(),
});

const roomUserPosSchema = z.object({
  type: z.literal("room_user_pos"),
  userId: z.string(),
  posX: z.number(),
  posY: z.number(),
});

const chatSchema = z.object({
  type: z.literal("chat"),
  userId: z.string(),
  roomId: z.string().optional(),
  message: z.string(),
});

const deleteShapeSchema = z.object({
  type: z.literal("delete_shape"),
  message: z.string(),
});

const removeShapeSchema = z.object({
  type: z.literal("remove_shape"),
  userId: z.string(),
  message: z.string(),
});

const moveShapeSchema = z.object({
  type: z.literal("move_shape"),
  userId: z.string(),
  message: z.object({
    prevShape: z.string(),
    newShape: z.string(),
  }),
});

export const messageSchema = z.discriminatedUnion("type", [
  joinRoomSchema,
  leaveRoomSchema,
  userPosSchema,
  roomUserPosSchema,
  chatSchema,
  deleteShapeSchema,
  removeShapeSchema,
  moveShapeSchema,
]);

export type IRoomChat = z.infer<typeof chatSchema>;