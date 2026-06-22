import { z } from "zod";
import { historySchema, leaderboardSchema, scoreSchema } from "./validators";

export type HistoryInput = z.infer<typeof historySchema>;

export type ScoreInput = z.infer<typeof scoreSchema>;

export type LeaderboardInput = z.infer<typeof leaderboardSchema>;
