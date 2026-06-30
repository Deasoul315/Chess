import { z } from "zod";
import { ColorEnum, DomainEnum } from "../../../constants.ts/constants";

export const makeRoomSchema = z.object({
  color: z.enum(ColorEnum),
  domain: z.enum(DomainEnum),
  increment: z
    .number()
    .min(0)
    .max(60 * 1000),
  turnTime: z
    .number()
    .min(1)
    .max(60 * 1000 * 60),
});

export const configRoomSchema = z.object({
  color: z.enum(ColorEnum),
  domain: z.enum(DomainEnum),
  increment: z
    .number()
    .min(0)
    .max(60 * 1000),
  turnTime: z
    .number()
    .min(1)
    .max(60 * 1000 * 60),
});

export const getRoomParamsSchema = z.object({
  code: z.string().min(1, "Invalid room code"),
});

export const getRoomByIdParamsSchema = z.object({});

export const joinRoomSchema = z.object({
  code: z.string().min(1, "Invalid matchCode"),
});

export const makeReadySchema = z.object({
  code: z.string().min(1),
  color: z.enum(ColorEnum),
  isReady: z.boolean(),
});

export const randomRoomSchema = z.object({});

export const spectateRoomSchema = z.object({
  code: z.string().min(1, "Invalid room code"),
});

export const activeRoomsSchema = z.object({});
