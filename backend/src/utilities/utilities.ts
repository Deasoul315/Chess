import { Response } from "express";
import { PIECES_TYPE } from "../constants.ts/constants";
import { Piece } from "../constants.ts/types";

export function makeCode(length: number) {
  let result = "";
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function createInitBoard(): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array.from({ length: 8 }, () =>
    Array.from({ length: 8 }, () => null),
  );

  const backRow = [
    PIECES_TYPE.ROOK,
    PIECES_TYPE.KNIGHT,
    PIECES_TYPE.BISHOP,
    PIECES_TYPE.QUEEN,
    PIECES_TYPE.KING,
    PIECES_TYPE.BISHOP,
    PIECES_TYPE.KNIGHT,
    PIECES_TYPE.ROOK,
  ];

  // BLACK pieces
  for (let col = 0; col < 8; col++) {
    board[0][col] = {
      type: backRow[col],
      team: "BLACK",
    };

    board[1][col] = {
      type: PIECES_TYPE.PAWN,
      team: "BLACK",
    };
  }

  // WHITE pieces
  for (let col = 0; col < 8; col++) {
    board[6][col] = {
      type: PIECES_TYPE.PAWN,
      team: "WHITE",
    };

    board[7][col] = {
      type: backRow[col],
      team: "WHITE",
    };
  }

  return board;
}

export function getRandomInRange(low: number, high: number): number {
  return Math.random() * (high - low) + low;
}

// special guard
export function isString(value: unknown): boolean {
  return typeof value === "string";
}

export function badRequest(res: Response, message: string, extra?: any) {
  return res.status(400).json({
    success: false,
    message,
    ...(extra && { extra }),
  });
}

export function serverError(
  res: Response,
  error: unknown,
  message = "Internal server error",
) {
  return res.status(500).json({
    success: false,
    message,
    error: error instanceof Error ? error.message : "Unknown error",
  });
}

export function ok(res: Response, data: any, status = 200) {
  return res.status(status).json({
    success: true,
    ...data,
  });
}

export function findValueInMap<K, V>(
  compareFn: (val: V, key?: K) => boolean,
  map: Map<K, V>,
) {
  for (const [key, value] of map) {
    if (compareFn(value, key)) {
      return { key, value };
    }
  }
  return {
    key: null,
    value: null,
  };
}
