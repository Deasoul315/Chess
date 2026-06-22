import { z } from "zod";
import { ColorEnum, DomainEnum } from "../../../constants.ts/constants";

export const makeRoomSchema = z.object({
  userName: z.string().min(1, "Invalid userName"),
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
  userName: z.string().min(1, "Invalid userName"),
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

export const joinRoomSchema = z.object({
  code: z.string().min(1, "Invalid matchCode"),
  guestName: z.string().min(1, "Invalid guestName"),
});

export const makeReadySchema = z.object({
  userName: z.string().min(1),
  code: z.string().min(1),
  color: z.enum(ColorEnum),
  isReady: z.boolean(),
});

export const randomRoomSchema = z.object({
  userName: z.string().min(1),
});

export const spectateRoomSchema = z.object({
  code: z.string().min(1, "Invalid room code"),
  userName: z.string(),
});

export const activeRoomsSchema = z.object({});
