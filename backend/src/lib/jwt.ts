import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export function createAccessToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "15m" });
}

export function authenticate(req: Request, res: Response) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    return payload.userId;
  } catch {
    return null;
  }
}

export function refresh(req: Request) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return false;
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET!) as {
      userId: string;
    };

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
