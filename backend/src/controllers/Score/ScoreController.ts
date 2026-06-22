import { Response } from "express";
import { supabase } from "../../lib/supabase";
import { HistoryInput, LeaderboardInput, ScoreInput } from "./validators/types";

export class ScoreController {
  public async getDailyStats(data: ScoreInput, res: Response) {
    const { username } = data;

    try {
      const { data: matches, error } = await supabase
        .from("Room")
        .select("host, guest, status, created_at")
        .or(`host.eq.${username},guest.eq.${username}`)
        .not("host", "is", null)
        .not("guest", "is", null)
        .not("status", "is", null)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("[DAILY_STATS_GET] DB error:", error);

        return res.status(500).json({
          success: false,
          message: "Failed to fetch daily stats",
        });
      }

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

      return res.status(200).json({
        success: true,
        stats: Object.values(stats),
      });
    } catch (err) {
      console.error("[DAILY_STATS_GET] Unexpected error:", err);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public async getScore(data: ScoreInput, res: Response) {
    const { username } = data;

    try {
      const { data: matches, error } = await supabase
        .from("Room")
        .select("host, guest, status")
        .not("host", "is", null)
        .not("guest", "is", null)
        .not("status", "is", null)
        .or(`host.eq.${username},guest.eq.${username}`);

      if (error) {
        console.error("[SCORE_GET] DB error:", error);

        return res.status(500).json({
          success: false,
          message: "Failed to fetch score",
        });
      }

      const wins = matches.filter((match) => {
        return (
          (match.status === "HOST" && match.host === username) ||
          (match.status === "GUEST" && match.guest === username)
        );
      }).length;

      const losses = matches.filter((match) => {
        return (
          (match.status === "HOST" && match.guest === username) ||
          (match.status === "GUEST" && match.host === username)
        );
      }).length;

      const draws = matches.filter((match) => match.status === "DRAW").length;

      return res.status(200).json({
        success: true,
        score: {
          wins,
          losses,
          draws,
          total: matches.length,
        },
      });
    } catch (err) {
      console.error("[SCORE_GET] Unexpected error:", err);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public async getHistory(data: HistoryInput, res: Response) {
    const { username } = data;

    try {
      const { data: matches, error } = await supabase
        .from("Room")
        .select("*")
        .or(`host.eq.${username},guest.eq.${username}`)
        .not("host", "is", null)
        .not("guest", "is", null)
        .not("status", "is", null)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[HISTORY_GET] DB error:", error);

        return res.status(500).json({
          success: false,
          message: "Failed to fetch history",
        });
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

      return res.status(200).json({
        success: true,
        history,
      });
    } catch (err) {
      console.error("[HISTORY_GET] Unexpected error:", err);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  public async getLeaderboard(_: LeaderboardInput, res: Response) {
    try {
      const { data: users, error: usersError } = await supabase
        .from("User")
        .select("user_name");

      if (usersError) {
        console.error("[LEADERBOARD_GET] User fetch error:", usersError);

        return res.status(500).json({
          success: false,
          message: "Failed to fetch leaderboard",
        });
      }

      const leaderboard = await Promise.all(
        users.map(async (user) => {
          const userName = user.user_name;

          const { data: matches, error } = await supabase
            .from("Room")
            .select("host, guest, status")
            .not("host", "is", null)
            .not("guest", "is", null)
            .not("status", "is", null)
            .or(`host.eq.${userName},guest.eq.${userName}`);

          if (error) {
            throw error;
          }

          const wins = matches.filter((match) => {
            return (
              (match.status === "HOST" && match.host === userName) ||
              (match.status === "GUEST" && match.guest === userName)
            );
          }).length;

          const losses = matches.filter((match) => {
            return (
              (match.status === "HOST" && match.guest === userName) ||
              (match.status === "GUEST" && match.host === userName)
            );
          }).length;

          const draws = matches.filter(
            (match) => match.status === "DRAW",
          ).length;

          return {
            userName,
            wins,
            losses,
            draws,
            total: matches.length,
          };
        }),
      );

      leaderboard.sort((a, b) => {
        if (b.wins !== a.wins) {
          return b.wins - a.wins;
        }

        return a.losses - b.losses;
      });

      return res.status(200).json({
        success: true,
        leaderboard: leaderboard.slice(0, 10),
      });
    } catch (err) {
      console.error("[LEADERBOARD_GET] Unexpected error:", err);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
