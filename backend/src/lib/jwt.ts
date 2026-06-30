import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export function createAccessToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "15m" });
}

export function createRefreshToken(userId: string) {
  return jwt.sign({ userId }, process.env.REFRESH_SECRET!, {
    expiresIn: "7d",
  });
}

export function authenticate(req: Request) {
  const headerAuth = req.headers.authorization;

  if (!headerAuth?.startsWith("Bearer ")) {
    return null;
  }

  const token = headerAuth.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
    };

    return payload.userId;
  } catch {
    return null;
  }
}

export function authenticateByToken(accessToken: string) {
  try {
    const payload = jwt.verify(accessToken, process.env.JWT_SECRET!) as {
      userId: number;
    };

    return payload.userId;
  } catch {
    return null;
  }
}

export function refreshAccessToken(req: Request) {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) return null;

  try {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET!) as {
      userId: number;
    };
    console.log("verified");
    const accessToken = jwt.sign(
      { userId: payload.userId },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" },
    );
    return accessToken;
  } catch {
    return null;
  }
}
