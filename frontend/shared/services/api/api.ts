import { API } from "@/shared/config";
import { Domain, PieceColor } from "@/shared/constants/types";
import { UserProps } from "@/shared/types/types";

export class UserApi {
  public async post(payload: UserProps) {
    const response = await fetch(`${API}/user/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to create user");
    }

    return response.json();
  }
  public async get(payload: { userName: string; password: string }) {
    // const params = new URLSearchParams({
    //   userName: payload.userName,
    //   password: payload.password,
    // });

    const response = await fetch(`${API}/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to get user");
    }

    return response.json();
  }
  public async patch(payload: {
    userName: string;
    newPassword: string;
    oldPassword: string;
    name: string;
  }) {
    const response = await fetch(`${API}/user/edit`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to get user");
    }

    return response.json();
  }
}

export class ScoreApi {
  public async getDailyStats(username: string) {
    const params = new URLSearchParams({
      username,
    });

    const response = await fetch(`${API}/daily-stats?${params.toString()}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch daily stats");
    }

    return response.json();
  }
  public async getScore(username: string) {
    const params = new URLSearchParams({
      username,
    });

    const response = await fetch(`${API}/score?${params.toString()}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch score");
    }

    return response.json();
  }

  public async getHistory(username: string) {
    const params = new URLSearchParams({
      username,
    });

    const response = await fetch(`${API}/history?${params.toString()}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch history");
    }

    return response.json();
  }

  public async getLeaderboard() {
    const response = await fetch(`${API}/leaderboard`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch leaderboard");
    }

    return response.json();
  }
}

export class MatchApi {
  // Host creates match
  async createMatch(payload: {
    userName: string;
    color: PieceColor;
    domain: Domain;
    increment: number;
    turnTime: number;
  }) {
    const response = await fetch(`${API}/match`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return response.json();
  }

  async configMatch(payload: {
    userName: string;
    color: PieceColor;
    domain: Domain;
    increment: number;
    turnTime: number;
  }) {
    const response = await fetch(`${API}/match/config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return response.json();
  }
  // Get match status
  async getMatch(payload: { code: string }): Promise<{
    code: string;
    host: string;
    guest: string | null;
    readyUsers: string[];
    state: "READY" | "PREPARE";
    playerInTurn: "HOST" | "GUEST";

    color: "WHITE" | "BLACK";
    domain: "PUBLIC" | "PRIVATE";
    increment: number;
    turnTime: number;
  }> {
    const response = await fetch(`${API}/match/${payload.code}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message ?? "Failed to get match");
    }

    const data: {
      code: string;
      host: string;
      guest: string | null;
      readyUsers: string[];
      state: "READY" | "PREPARE";
      playerInTurn: "HOST" | "GUEST";

      color: "WHITE" | "BLACK";
      domain: "PUBLIC" | "PRIVATE";
      increment: number;
      turnTime: number;
    } = await response.json();

    return data;
  }

  async getActiveMatches(payload: {}): Promise<{
    activeRooms: {
      host: string;
      guest: string;
      code: string;
    }[];
    status: boolean;
  }> {
    const response = await fetch(`${API}/match/active`);
    console.log("FETCH the active room");
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message ?? "Failed to get matches");
    }

    const data: {
      activeRooms: {
        host: string;
        guest: string;
        code: string;
      }[];
      status: boolean;
    } = await response.json();

    return data;
  }

  async getRandomMatch(payload: { userName: string }): Promise<{
    code: string;
    hostName: string;
    guestName: string | null;
    readyUsers: string[];
    state: "READY" | "PREPARE";
    playerInTurn: "HOST" | "GUEST";
    color: "WHITE" | "BLACK";
    domain: "PUBLIC" | "PRIVATE";
    increment: number;
    turnTime: number;
  }> {
    const response = await fetch(`${API}/match/random/${payload.userName}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message ?? "Failed to get match");
    }

    const data: {
      code: string;
      hostName: string;
      guestName: string | null;
      readyUsers: string[];
      state: "READY" | "PREPARE";
      playerInTurn: "HOST" | "GUEST";
      color: "WHITE" | "BLACK";
      domain: "PUBLIC" | "PRIVATE";
      increment: number;
      turnTime: number;
    } = await response.json();

    return data;
  }

  async joinMatch(payload: { code: string; guestName: string }) {
    const response = await fetch(`${API}/match`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return response.json();
  }
  async spectateMatch(payload: { code: string; userName: string }) {
    console.log("SPECTATE");
    const url = new URLSearchParams({
      code: payload.code,
      userName: payload.userName,
    });
    const response = await fetch(`${API}/match/spectate?${url.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message ?? "cannot spectate this room");
    }
    return response.json();
  }
  // Host starts match
  async readyMatch(payload: {
    userName: string;
    hostName: string;
    guestName: string;
    code: string;
    color: PieceColor;
    domain: Domain;
    increment: number;
    turnTime: number;
    isReady: boolean;
  }) {
    const response = await fetch(`${API}/match/ready`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message ?? "Failed to make ready");
    }
    return response.json();
  }
}
