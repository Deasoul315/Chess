// validators/user.validator.ts
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1),
  userName: z.string().min(3),
  password: z.string().min(6),
});

export const logInSchema = z.object({
  userName: z.string(),
  password: z.string(),
});

export const editSchema = z.object({
  userName: z.string(),
  name: z.string().min(1),
  newPassword: z.string().min(6),
  oldPassword: z.string().min(6),
});

export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

export const userNameRegex = /^[a-zA-Z0-9_]{3,20}$/;
