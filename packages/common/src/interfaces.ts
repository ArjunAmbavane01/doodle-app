export interface IChatMessage {
  type: "chat";
  message: string;
  roomId: number;
}
