import { z } from "zod";
import { createUserSchema, editSchema, logInSchema } from "./validators";

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type LogInDTO = z.infer<typeof logInSchema>;
export type EditDTO = z.infer<typeof editSchema>;
