import { API } from "@/shared/config";
import { Domain, PieceColor } from "@/shared/constants/types";
import { UserProps } from "@/shared/types/types";

function makeError(response: Response, message?: string) {
  return {
    status: response.status,
    message: message,
  };
}

export class UserApi {
  public async refreshToken() {
    const response = await fetch(`${API}/user/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    return response.json();
  }

  public async signout(payload: { accessToken: string }) {
    const response = await fetch(`${API}/user/signout`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${payload.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get user");
    }

    return response.json();
  }

  public async getData(payload: { accessToken: string }) {
    const response = await fetch(`${API}/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${payload.accessToken}`,
      },
    });

    if (!response.ok) {
      throw makeError(response);
    }

    return response.json();
  }

  public async post(payload: UserProps) {
    const response = await fetch(`${API}/user/signup`, {
      method: "POST",
      credentials: "include",
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
    const response = await fetch(`${API}/user/login`, {
      method: "POST",
      credentials: "include",
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
    newPassword: string;
    oldPassword: string;
    name: string;
    accessToken: string;
  }) {
    const response = await fetch(`${API}/user/edit`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${payload.accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw makeError(response);
    }

    return response.json();
  }
}

export class ScoreApi {
  public async getDailyStats(payload: { accessToken: string }) {
    const response = await fetch(`${API}/daily-stats`, {
      method: "GET",
      headers: {
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${payload.accessToken}`,
      },
    });

    if (!response.ok) {
      throw makeError(response);
    }

    return response.json();
  }
  public async getScore(payload: { accessToken: string }) {
    const response = await fetch(`${API}/score`, {
      method: "GET",
      headers: {
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${payload.accessToken}`,
      },
    });

    if (!response.ok) {
      throw makeError(response);
    }

    return response.json();
  }

  public async getHistory(payload: { accessToken: string }) {
    const response = await fetch(`${API}/history`, {
      method: "GET",
      headers: {
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${payload.accessToken}`,
      },
    });

    if (!response.ok) {
      throw makeError(response);
    }

    return response.json();
  }

  public async getLeaderboard() {
    const response = await fetch(`${API}/leaderboard`, {
      method: "GET",
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!response.ok) {
      throw makeError(response);
    }

    return response.json();
  }
}

export class MatchApi {
  // Host creates match
  async createMatch(payload: {
    accessToken: string;
    color: PieceColor;
    domain: Domain;
    increment: number;
    turnTime: number;
  }) {
    const response = await fetch(`${API}/match`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${payload.accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    return response.json();
  }

  async configMatch(payload: {
    accessToken: string;
    color: PieceColor;
    domain: Domain;
    increment: number;
    turnTime: number;
  }) {
    const response = await fetch(`${API}/match/config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${payload.accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw makeError(response);
    }

    return response.json();
  }
  // Get match status
  async getMatch(payload: { accessToken: string; code: string }): Promise<{
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
    const response = await fetch(`${API}/match/${payload.code}`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${payload.accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw makeError(response);
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
    if (!response.ok) {
      const error = await response.json();
      throw makeError(response);
    }

    if (!response.ok) {
      throw makeError(response);
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

  async getRandomMatch(payload: { accessToken: string }): Promise<{
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
    const response = await fetch(`${API}/match/random`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${payload.accessToken}`,
      },
    });

    if (!response.ok) {
      throw makeError(response);
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

  async joinMatch(payload: { code: string; accessToken: string }) {
    const response = await fetch(`${API}/match`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${payload.accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw makeError(response);
    }

    return response.json();
  }
  async spectateMatch(payload: { code: string; accessToken: string }) {
    const url = new URLSearchParams({
      code: payload.code,
    });
    const response = await fetch(`${API}/match/spectate?${url.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!response.ok) {
      throw makeError(response);
    }

    return response.json();
  }

  async reconnectMatch(payload: { accessToken: string }) {
    const response = await fetch(`${API}/match/reconnect`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${payload.accessToken}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw makeError(response);
    }
    return response.json();
  }
  // Host starts match
  async readyMatch(payload: {
    accessToken: string;
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
        Authorization: `Bearer ${payload.accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw makeError(response);
    }

    return response.json();
  }
}
