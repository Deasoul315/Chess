import { GameMaster } from "../services/GameMaster";

interface SpectatorConnection {
  userId: number;
  socket: any;
}
export type Connection = {
  userName: string;
  master: GameMaster | null;
  socket: any;
  spectators: SpectatorConnection[];
  code: null | string;
  type: "RANDOM" | "CONTROLLED";
  isReady: boolean;
  userType: "HOST" | "GUEST" | null;
  time: null | number;
  increment: null | number;
  domain: null | "PRIVATE" | "PUBLIC";
  color: null | "WHITE" | "BLACK";
};

export const connections = new Map<number, Connection>();

// there master there game
// there entry but no master then he is ready only
