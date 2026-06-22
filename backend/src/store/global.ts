import { GameMaster } from "../services/GameMaster";

interface SpectatorConnection {
  userName: string;
  socket: any;
}

export const connections = new Map<
  string,
  {
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
  }
>();
// there master there game
// there entry but no master then he is ready only
