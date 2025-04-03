import { z } from "zod";

const joinRoomSchema = z.object({ type: z.literal("join_room") });

const leaveRoomSchema = z.object({ type: z.literal("leave_room") });

const collaboratorJoinedSchema = z.object({
  type: z.literal("user_joined"),
  userId: z.string(),
  name: z.string()
});

const userPositionSchema = z.object({
  type: z.literal("user_pos"),
  posX: z.number(),
  posY: z.number(),
});

const collaboratorPositionSchema = z.object({
  type: z.literal("room_user_pos"),
  userId: z.string(),
  posX: z.number(),
  posY: z.number(),
});

const roomChatSchema = z.object({
  type: z.literal("chat"),
  userId: z.string(),
  roomId: z.string().optional(),
  message: z.string(),
});

const errorMessageSchema = z.object({
  type: z.literal("error"),
  message: z.string(),
});

const deleteShapeMessageSchema = z.object({
  type: z.literal("delete_shape"),
  message: z.string(),
});

const broadcastRemoveShapeMessageSchema = z.object({
  type: z.literal("remove_shape"),
  userId: z.string(),
  message: z.string(),
});

const moveShapeMessageSchema = z.object({
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
  collaboratorJoinedSchema,
  userPositionSchema,
  collaboratorPositionSchema,
  roomChatSchema,
  errorMessageSchema,
  deleteShapeMessageSchema,
  broadcastRemoveShapeMessageSchema,
  moveShapeMessageSchema
]);

export type IRoomChat = z.infer<typeof roomChatSchema>;