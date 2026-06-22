import { Domain, PieceColor, PIECES_TYPE } from "./constants";

export type PieceType = (typeof PIECES_TYPE)[keyof typeof PIECES_TYPE];

export interface Piece {
  image: string;
  type: PieceType;
  team: "BLACK" | "WHITE";
}

export type MoveCoordination = {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
};

export type Message = {
  userName: string;
  message: string;
};

export type Match = {
  role: "PLAYER" | "SPECTATOR" | null;
  board: (Piece | null)[][];
  isMoveBoard: boolean[][];
  teamInTurn: "GUEST" | "HOST" | null;
  increment: number;
  turnTime: number;
  code: string;
  color: "BLACK" | "WHITE";
  domain: Domain;
  guestName: string;
  hostName: string;
  socket: null | WebSocket;
  winner: null | "HOST" | "GUEST";
  log: {
    host: MoveCoordination[];
    guest: MoveCoordination[];
  };
  time: {
    host: null | number;
    guest: null | number;
  };
  messages: {
    private: Message[];
    public: Message[];
  };
};

export type Domain = (typeof Domain)[keyof typeof Domain];

export type PieceColor = (typeof PieceColor)[keyof typeof PieceColor];
