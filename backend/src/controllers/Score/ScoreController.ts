import { Response } from "express";
import { supabase } from "../../lib/supabase";
import { HistoryInput, LeaderboardInput, ScoreInput } from "./validators/types";
import { badRequest, ok, serverError } from "../../utilities/utilities";
import { MatchService } from "../../services/MatchService";
import { logger } from "../../lib/logger";
import { UserService } from "../../services/UserService";

const userService = new UserService();
const matchService = new MatchService();

export class ScoreController {
  public async getDailyStats(userId: number, data: ScoreInput, res: Response) {
    try {
      logger.info("[GET_DAILY] ", userId);
      // 1. Get user from DB
      const { data: userData, error: userError } =
        await userService.findById(userId);

      if (userError || !userData) {
        return badRequest(res, "user not found");
      }

      const username = userData.user_name;

      // 2. Fetch matches
      const { data: matches, error } = await supabase
        .from("Room")
        .select("host, guest, status, created_at")
        .or(`host.eq.${username},guest.eq.${username}`)
        .not("host", "is", null)
        .not("guest", "is", null)
        .not("status", "is", null)
        .order("created_at", { ascending: true });

      if (error) {
        logger.error("[DAILY_STATS_GET] DB error:", error);

        return serverError(res, "Failed to fetch daily stats");
      }

      // 3. Aggregate stats
      const stats = matches.reduce<
        Record<
          string,
          {
            date: string;
            wins: number;
            losses: number;
            draws: number;
            total: number;
          }
        >
      >((acc, match) => {
        const date = new Date(match.created_at).toISOString().split("T")[0];

        if (!acc[date]) {
          acc[date] = {
            date,
            wins: 0,
            losses: 0,
            draws: 0,
            total: 0,
          };
        }

        acc[date].total++;

        if (match.status === "DRAW") {
          acc[date].draws++;
        } else if (
          (match.status === "HOST" && match.host === username) ||
          (match.status === "GUEST" && match.guest === username)
        ) {
          acc[date].wins++;
        } else {
          acc[date].losses++;
        }

        return acc;
      }, {});

      return ok(res, {
        success: true,
        stats: Object.values(stats),
      });
    } catch (err) {
      logger.error("[DAILY_STATS_GET] Unexpected error:", err);

      return serverError(res, "Internal server error");
    }
  }

  public async getScore(userId: number, data: ScoreInput, res: Response) {
    try {
      const { data: userData, error: userError } =
        await userService.findById(userId);

      if (userError || !userData) {
        return badRequest(res, "user not found");
      }

      const username = userData.user_name;

      const { data: matches, error } = await supabase
        .from("Room")
        .select("host, guest, status")
        .not("host", "is", null)
        .not("guest", "is", null)
        .not("status", "is", null)
        .or(`host.eq.${username},guest.eq.${username}`);

      if (error) {
        logger.error("[SCORE_GET] DB error:", error);
        return serverError(res, "Failed to fetch score");
      }

      const wins = matches.filter(
        (m) =>
          (m.status === "HOST" && m.host === username) ||
          (m.status === "GUEST" && m.guest === username),
      ).length;

      const losses = matches.filter(
        (m) =>
          (m.status === "HOST" && m.guest === username) ||
          (m.status === "GUEST" && m.host === username),
      ).length;

      const draws = matches.filter((m) => m.status === "DRAW").length;

      return ok(res, {
        success: true,
        score: {
          wins,
          losses,
          draws,
          total: matches.length,
        },
      });
    } catch (err) {
      logger.error("[SCORE_GET] Unexpected error:", err);
      return serverError(res, "Internal server error");
    }
  }

  public async getHistory(userId: number, data: HistoryInput, res: Response) {
    try {
      const { data: userData, error: userError } =
        await userService.findById(userId);

      if (userError || !userData) {
        return badRequest(res, "user not found");
      }

      const username = userData.user_name;

      const { data: matches, error } = await supabase
        .from("Room")
        .select("*")
        .or(`host.eq.${username},guest.eq.${username}`)
        .not("host", "is", null)
        .not("guest", "is", null)
        .not("status", "is", null)
        .order("created_at", { ascending: false });

      if (error) {
        logger.error("[HISTORY_GET] DB error:", error);
        return serverError(res, "Failed to fetch history");
      }

      const history = matches.map((match) => {
        let result: "WIN" | "LOSS" | "DRAW";

        if (match.status === "DRAW") {
          result = "DRAW";
        } else if (
          (match.status === "HOST" && match.host === username) ||
          (match.status === "GUEST" && match.guest === username)
        ) {
          result = "WIN";
        } else {
          result = "LOSS";
        }

        return {
          ...match,
          result,
        };
      });

      return ok(res, {
        success: true,
        history,
      });
    } catch (err) {
      logger.error("[HISTORY_GET] Unexpected error:", err);
      return serverError(res, "Internal server error");
    }
  }

  public async getLeaderboard(_: LeaderboardInput, res: Response) {
    try {
      const { data: users, error: usersError } = await supabase
        .from("User")
        .select("id, user_name");

      if (usersError) {
        logger.error("[LEADERBOARD_GET] User fetch error:", usersError);
        return serverError(res, "Failed to fetch leaderboard");
      }

      const leaderboard = await Promise.all(
        users.map(async (user) => {
          const username = user.user_name;

          const { data: matches, error } = await supabase
            .from("Room")
            .select("host, guest, status")
            .not("host", "is", null)
            .not("guest", "is", null)
            .not("status", "is", null)
            .or(`host.eq.${username},guest.eq.${username}`);

          if (error) throw error;

          const wins = matches.filter(
            (m) =>
              (m.status === "HOST" && m.host === username) ||
              (m.status === "GUEST" && m.guest === username),
          ).length;

          const losses = matches.filter(
            (m) =>
              (m.status === "HOST" && m.guest === username) ||
              (m.status === "GUEST" && m.host === username),
          ).length;

          const draws = matches.filter((m) => m.status === "DRAW").length;

          return {
            userName: username,
            wins,
            losses,
            draws,
            total: matches.length,
          };
        }),
      );

      leaderboard.sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return a.losses - b.losses;
      });

      return ok(res, {
        success: true,
        leaderboard: leaderboard.slice(0, 10),
      });
    } catch (err) {
      logger.error("[LEADERBOARD_GET] Unexpected error:", err);
      return serverError(res, "Internal server error");
    }
  }
}
