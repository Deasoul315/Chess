import { z } from "zod";
import {
  makeRoomSchema,
  joinRoomSchema,
  makeReadySchema,
  getRoomParamsSchema,
  randomRoomSchema,
  spectateRoomSchema,
  activeRoomsSchema,
  configRoomSchema,
  getRoomByIdParamsSchema,
} from "./validators";

export type MakeRoomDTO = z.infer<typeof makeRoomSchema>;
export type JoinRoomDTO = z.infer<typeof joinRoomSchema>;
export type MakeReadyDTO = z.infer<typeof makeReadySchema>;
export type GetRoomParamsDTO = z.infer<typeof getRoomParamsSchema>;
export type GetRoomByIdParamsDTO = z.infer<typeof getRoomByIdParamsSchema>;
export type RandomRoomDTO = z.infer<typeof randomRoomSchema>;
export type SpectateRoomDTO = z.infer<typeof spectateRoomSchema>;
export type ActiveRoomsSchema = z.infer<typeof activeRoomsSchema>;
export type ConfigRoomSchema = z.infer<typeof configRoomSchema>;
