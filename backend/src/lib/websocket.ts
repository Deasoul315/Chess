import WebSocket, { WebSocketServer } from "ws";

import { Connection, connections } from "../store/global";
import { logger } from "./logger";
import { z } from "zod";
import { findValueInMap } from "../utilities/utilities";
import { authenticate, authenticateByToken } from "./jwt";
import { UserService } from "../services/UserService";

const UserTypeSchema = z.enum(["PLAYER", "SPECTATOR"]);

export const InitPayloadSchema = z.object({
  userType: UserTypeSchema,
  type: z.literal("INIT"),
  accessToken: z.string(),
});

export const MovePayloadSchema = z.object({
  type: z.literal("PLAY"),
  fromX: z.number(),
  fromY: z.number(),
  toX: z.number(),
  toY: z.number(),
});

export const MessagePayloadSchema = z.object({
  userType: UserTypeSchema,
  type: z.literal("MESSAGE"),
  message: z.string(),
  domain: z.enum(["PUBLIC", "PRIVATE"]),
});

export const SpectatePayloadSchema = z.object({
  userType: UserTypeSchema,
  type: z.literal("SPECTATE"),
});

export const SurrenderPayloadSchema = z.object({
  userType: z.literal("PLAYER"),
  type: z.literal("SURRENDER"),
});

export const PayloadSchema = z.discriminatedUnion("type", [
  InitPayloadSchema,
  MovePayloadSchema,
  MessagePayloadSchema,
  SpectatePayloadSchema,
  SurrenderPayloadSchema,
]);

export type InitPayload = z.infer<typeof InitPayloadSchema>;
export type MovePayload = z.infer<typeof MovePayloadSchema>;
export type MessagePayload = z.infer<typeof MessagePayloadSchema>;
export type SpectatePayload = z.infer<typeof SpectatePayloadSchema>;
export type SurrenderPayload = z.infer<typeof SurrenderPayloadSchema>;
export type Payload = z.infer<typeof PayloadSchema>;

function broadCast(connection: Connection, message: {}) {
  if (!connection) return;

  const master = connection.master;

  if (!master) return;

  const host = master.hostPlayer.id;
  const guest = master.guestPlayer.id;

  const targets = [host, guest];

  for (const name of targets) {
    const conn = connections.get(name);

    if (conn?.socket && conn.socket.readyState === WebSocket.OPEN) {
      conn.socket.send(JSON.stringify(message));
    }
  }

  const hostConnection = connections.get(host);

  if (!hostConnection) throw "cannot find host";

  for (const spectator of hostConnection.spectators) {
    if (spectator.socket && spectator.socket.readyState === WebSocket.OPEN) {
      spectator.socket.send(JSON.stringify(message));
    }
  }
}

export function makeSocketServer(server: any) {
  const wss = new WebSocketServer({ server });
  const interval = setInterval(() => {
    for (const [key, connection] of connections) {
      if (!connection) continue;

      const master = connection.master;

      if (!master) continue;

      connection.master?.updateGameState();

      const isMatchEnd =
        connection && connection.master && connection.master.winner;

      if (!isMatchEnd) continue;

      const message = {
        type: "END",
        winner: master.winner,
      };

      broadCast(connection, message);
    }
  }, 5000);

  wss.on("connection", (ws: WebSocket) => {
    logger.info("[WS] Client connected");

    let userId: number | null = null;

    ws.on("message", async (message) => {
      const parsedMessage = JSON.parse(message.toString());
      logger.info("[WS] received message", parsedMessage);

      let payload = PayloadSchema.safeParse(parsedMessage);

      const data = payload.data;
      if (!data) return;

      switch (data.type) {
        case "INIT":
          if (data.userType === "PLAYER") {
            const id = authenticateByToken(data.accessToken);
            if (!id) {
              ws.send(
                JSON.stringify({
                  type: "ERROR",
                  message: "unauthorized",
                }),
              );
              return;
            }

            const connection = connections.get(id);

            const isMatchActive =
              connection && connection.master && !connection.master.winner;
            if (!isMatchActive) {
              logger.warn("[WS] INIT failed - no connection entry", {
                userId,
              });

              ws.send(
                JSON.stringify({
                  type: "ERROR",
                  message: "Connection not found (join room first)",
                }),
              );
              return;
            }

            userId = id;
            connection.socket = ws;

            logger.info("[WS] User registered", { userId });
            return;
          }

          let master = null;

          if (data.userType === "SPECTATOR") {
            const id = authenticateByToken(data.accessToken);
            if (!id) {
              ws.send(
                JSON.stringify({
                  type: "ERROR",
                  message: "unauthorized",
                }),
              );
              return;
            }

            let found = null;

            for (const [, connection] of connections) {
              if (!connection.spectators) continue;

              const spectator = connection.spectators.find(
                (s) => s.userId === userId,
              );

              if (!spectator) continue;

              spectator.socket = ws;
              found = true;

              master = connection.master;
            }

            if (!master) {
              logger.warn("[WS] Spectator not found", {
                userId,
              });

              ws.send(
                JSON.stringify({
                  type: "ERROR",
                  message: "Spectator not found",
                }),
              );
              return;
            }

            logger.info("[WS] Spectator registered", {
              userId,
            });

            ws.send(
              JSON.stringify({
                type: "SPECTATE_CONNECTED",
                success: true,
                board: master.board,
                playerInTurn: master.playerInTurn,
                host: master.hostPlayer.username,
                guest: master.guestPlayer.username,
              }),
            );
            return;
          }
          break;
      }
      if (!userId) return;

      switch (data.type) {
        case "PLAY":
          {
            const { fromX, fromY, toX, toY } = data;
            const connection = connections.get(userId);

            if (!connection) return;

            const master = connection.master;

            if (!master) return;

            master.updateGameState();

            let isGameEnd = master.winner;

            if (isGameEnd) {
              ws.send(
                JSON.stringify({
                  type: "END",
                  reason: "Game has already ended",
                }),
              );
              return;
            }

            const success = master.move(userId, fromX, fromY, toX, toY);

            if (!success) {
              ws.send(
                JSON.stringify({
                  type: "MOVE_REJECTED",
                  reason: "Illegal move",
                }),
              );

              logger.warn("[WS] Move rejected", {
                userId,
                fromX,
                fromY,
                toX,
                toY,
              });

              return;
            }

            logger.info("[WS] Move accepted", {
              userId,
              fromX,
              fromY,
              toX,
              toY,
            });

            const userService = new UserService();
            const { data: user } = await userService.findById(userId);

            broadCast(connection, {
              type: "MOVE_PIECE",
              player: user.user_name,
              fromX,
              fromY,
              toX,
              toY,
              time: master.getTime(),
            });

            isGameEnd = master.winner;
            if (isGameEnd) {
              broadCast(connection, {
                type: "END",
                winner: master.winner,
              });
            }
          }
          break;

        case "SURRENDER": {
          const connection = connections.get(userId);
          if (!connection) return;

          const master = connection.master;

          if (!master) return;

          master.surrender(userId);

          broadCast(connection, {
            type: "END",
            winner: master.winner,
          });

          break;
        }

        case "MESSAGE": {
          const { domain, message } = data;

          if (data.userType === "PLAYER") {
            const connection = connections.get(userId);

            if (!connection) return;

            const master = connection.master;

            if (!master) return;

            if (domain === "PRIVATE") {
              const targetUser =
                connection.userType === "HOST"
                  ? master.guestPlayer.id
                  : master.hostPlayer.id;
              const targetConn = connections.get(targetUser);

              if (
                targetConn?.socket &&
                targetConn.socket.readyState === WebSocket.OPEN
              ) {
                targetConn.socket.send(
                  JSON.stringify({
                    type: "MESSAGE",
                    domain: "PRIVATE",
                    from: targetConn.userName,
                    message: message,
                  }),
                );
              }
              return;
            }

            if (domain === "PUBLIC") {
              broadCast(connection, {
                type: "MESSAGE",
                domain: domain,
                from: connection.userName,
                userType: "PLAYER",
                message: message,
              });
            }
          }

          if (data.userType === "SPECTATOR") {
            let connection = null;
            for (const [, conn] of connections) {
              const spectator = conn.spectators?.find(
                (s) => s.userId === userId,
              );

              if (spectator) {
                connection = conn;
                break;
              }
            }

            if (!connection) return;

            broadCast(connection, {
              type: "MESSAGE",
              domain: domain,
              from: connection.userName,
              userType: "PLAYER",
              message: message,
            });
          }
        }
      }
    });

    ws.on("close", () => {
      if (!userId) return;

      const conn = connections.get(userId);

      if (conn) {
        conn.socket = null;
      }

      for (const [, connection] of connections) {
        const spectator = connection.spectators?.find(
          (s) => s.userId === userId,
        );

        if (spectator) {
          spectator.socket = null;
          break;
        }
      }

      logger.info("[WS] Disconnected", { userId });
    });
  });

  return wss;
}
