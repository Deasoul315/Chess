import { PIECES_TYPE } from "./constants";

export type PieceType = (typeof PIECES_TYPE)[keyof typeof PIECES_TYPE];

export interface Piece {
  type: PieceType;
  team: "BLACK" | "WHITE";
}

export type Match = {
  board: (Piece | null)[][];
  activePieceIndicies: { x: number; y: number } | null;
  activePiecePlacements: ("MOVE" | "ATTACK" | "INVALID")[][] | null;
  teamInTurn: "ENEMY" | "PLAYER" | null;
  time: number;
  turnTime: number;
  code: string;
  team: "BLACK" | "WHITE";
};
