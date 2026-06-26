import WebSocket, { WebSocketServer } from "ws";
import { WEB_SOCKET_PORT } from "../config/config";
import { connections } from "../store/global";
import { logger } from "./logger";
import { z } from "zod";
import { findValueInMap } from "../utilities/utilities";

export function makeSocketServer(server: any) {
  const wss = new WebSocketServer({ server });

  type InitPayload = {
    userType: "PLAYER" | "SPECTATOR";
    type: "INIT";
    userName: string;
  };

  type MovePayload = {
    userType: "PLAYER" | "SPECTATOR";
    type: "MOVE";
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  };

  type MessagePayload = {
    userType: "PLAYER" | "SPECTATOR";
    type: "MESSAGE";
    message: string;
    domain: "PUBLIC" | "PRIVATE";
  };

  type SpectatePayload = {
    userType: "PLAYER" | "SPECTATOR";
    type: "SPECTATE";
    userName: string;
  };

  type SurrenderPayload = {
    userType: "PLAYER";
    type: "SURRENDER";
    userName: string;
  };

  type ClientMessage =
    | InitPayload
    | MovePayload
    | SpectatePayload
    | MessagePayload
    | SurrenderPayload;

  const interval = setInterval(() => {
    for (const [key, connection] of connections) {
      if (connection.master?.isTimeOut() && connection.master.winner) {
        const host = connection.master.hostPlayer.username;
        const guest = connection.master.guestPlayer.username;

        const targets = [host, guest];

        for (const name of targets) {
          const conn = connections.get(name);

          if (conn?.socket && conn.socket.readyState === WebSocket.OPEN) {
            conn.socket.send(
              JSON.stringify({
                type: "END",
                winner: connection.master.winner,
              }),
            );
          }
        }

        const hostConnection = connections.get(host);

        for (const spectator of hostConnection?.spectators ?? []) {
          if (
            spectator.socket &&
            spectator.socket.readyState === WebSocket.OPEN
          ) {
            spectator.socket.send(
              JSON.stringify({
                type: "END",
                winner: connection.master.winner,
              }),
            );
          }
        }
      }
    }
  }, 5000);

  wss.on("connection", (ws: WebSocket) => {
    logger.info("[WS] Client connected");

    let userName: string | null = null;

    ws.on("message", (message) => {
      let payload: ClientMessage;

      try {
        payload = JSON.parse(message.toString());
      } catch (err) {
        logger.warn("[WS] Invalid JSON received");
        ws.send(JSON.stringify({ type: "ERROR", message: "Invalid JSON" }));
        return;
      }
      console.log("[WS] RECEIVED MESSAGE", payload);

      /**
       * =========================
       * INIT
       * =========================
       */
      if (payload.type === "INIT" && payload.userType === "PLAYER") {
        userName = payload.userName;

        if (!userName) {
          ws.send(
            JSON.stringify({
              type: "ERROR",
              message: "Missing userName",
            }),
          );
          return;
        }

        const connection = connections.get(userName);

        if (!connection || !connection.master || !connection.time) {
          logger.warn("[WS] INIT failed - no connection entry", { userName });

          ws.send(
            JSON.stringify({
              type: "ERROR",
              message: "Connection not found (join room first)",
            }),
          );
          return;
        }

        connection.socket = ws;

        if (!connection.master.getTime().guestRegisterTime)
          connection.master.setTime({
            guestTime: connection.time,
            hostTime: connection.time,
            hostRegisterTime: Date.now(),
            guestRegisterTime: Date.now(),
          });

        logger.info("[WS] User registered", { userName });
        return;
      }

      if (payload.type === "INIT" && payload.userType === "SPECTATOR") {
        userName = payload.userName;

        if (!userName) {
          ws.send(
            JSON.stringify({
              type: "ERROR",
              message: "Missing userName",
            }),
          );

          return;
        }

        let found = false;

        for (const [, connection] of connections) {
          if (!connection.spectators) continue;

          const spectator = connection.spectators.find(
            (s) => s.userName === userName,
          );

          if (!spectator) continue;

          spectator.socket = ws;
          found = true;

          logger.info("[WS] Spectator registered", {
            userName,
          });

          const board = spectator ? connection.master?.board : null;

          ws.send(
            JSON.stringify({
              type: "SPECTATE_CONNECTED",
              success: true,
              board,
              playerInTurn: connection.master?.playerInTurn,
              host: connection.master?.hostPlayer.username,
              guest: connection.master?.guestPlayer.username,
            }),
          );

          break;
        }

        if (!found) {
          logger.warn("[WS] Spectator not found", {
            userName,
          });

          ws.send(
            JSON.stringify({
              type: "ERROR",
              message: "Spectator not found",
            }),
          );
        }

        return;
      }

      if (payload.type === "MESSAGE" && payload.userType === "PLAYER") {
        if (!userName) {
          ws.send(
            JSON.stringify({
              type: "ERROR",
              message: "Not initialized",
            }),
          );
          return;
        }

        /**
         * Find the game connection
         */
        let { key: hostUserName, value: connection } = findValueInMap(
          (connection) => connection.userType === "HOST",
          connections,
        );

        // Spectator messages need to locate the room they belong to
        if (!connection) {
          ws.send(
            JSON.stringify({
              type: "ERROR",
              message: "Game session not found",
            }),
          );
          return;
          // for (const [, conn] of connections) {
          //   const spectator = conn.spectators?.find(
          //     (s) => s.userName === userName,
          //   );

          //   if (spectator) {
          //     connection = conn;
          //     break;
          //   }
          // }
        }

        if (!connection.master) {
          ws.send(
            JSON.stringify({
              type: "ERROR",
              message: "Game session not found",
            }),
          );
          return;
        }

        const host = connection.master.hostPlayer.username;
        const guest = connection.master.guestPlayer.username;

        /**
         * =========================
         * PRIVATE MESSAGE
         * =========================
         */
        if (payload.domain === "PRIVATE") {
          const targetUser = userName === host ? guest : host;
          const targetConn = connections.get(targetUser);

          if (
            targetConn?.socket &&
            targetConn.socket.readyState === WebSocket.OPEN
          ) {
            targetConn.socket.send(
              JSON.stringify({
                type: "MESSAGE",
                domain: "PRIVATE",
                from: userName,
                message: payload.message,
              }),
            );
          }

          return;
        }

        /**
         * =========================
         * PUBLIC MESSAGE
         * =========================
         */
        const recipients = new Set<WebSocket>();

        const hostConn = connections.get(host);
        const guestConn = connections.get(guest);

        if (
          userName === guest &&
          hostConn?.socket &&
          hostConn.socket.readyState === WebSocket.OPEN
        ) {
          recipients.add(hostConn.socket);
        }

        if (
          userName === host &&
          guestConn?.socket &&
          guestConn.socket.readyState === WebSocket.OPEN
        ) {
          recipients.add(guestConn.socket);
        }

        for (const spectator of connection.spectators) {
          if (
            spectator.socket &&
            spectator.socket.readyState === WebSocket.OPEN
          ) {
            recipients.add(spectator.socket);
          }
        }

        for (const socket of recipients) {
          socket.send(
            JSON.stringify({
              type: "MESSAGE",
              domain: payload.domain,
              from: userName,
              userType: payload.userType,
              message: payload.message,
            }),
          );
        }

        return;
      }

      if (payload.type === "MESSAGE" && payload.userType === "SPECTATOR") {
        if (!userName) {
          ws.send(
            JSON.stringify({
              type: "ERROR",
              message: "Not initialized",
            }),
          );
          return;
        }

        /**
         * Find the game connection
         */
        let connection = null;
        for (const [, conn] of connections) {
          const spectator = conn.spectators?.find(
            (s) => s.userName === userName,
          );

          if (spectator) {
            connection = conn;
            break;
          }
        }

        if (!connection) {
          ws.send(
            JSON.stringify({
              type: "ERROR",
              message: "Game session not found",
            }),
          );
          return;
        }

        if (!connection.master) {
          ws.send(
            JSON.stringify({
              type: "ERROR",
              message: "Game session not found",
            }),
          );
          return;
        }

        const host = connection.master.hostPlayer.username;
        const guest = connection.master.guestPlayer.username;

        /**
         * =========================
         * PUBLIC MESSAGE
         * =========================
         */
        const recipients = new Set<WebSocket>();

        const hostConn = connections.get(host);
        const guestConn = connections.get(guest);

        if (hostConn?.socket && hostConn.socket.readyState === WebSocket.OPEN) {
          recipients.add(hostConn.socket);
        }

        if (
          guestConn?.socket &&
          guestConn.socket.readyState === WebSocket.OPEN
        ) {
          recipients.add(guestConn.socket);
        }

        for (const spectator of connection.spectators ?? []) {
          if (
            spectator.userName !== userName &&
            spectator.socket &&
            spectator.socket.readyState === WebSocket.OPEN
          ) {
            recipients.add(spectator.socket);
          }
        }

        for (const socket of recipients) {
          socket.send(
            JSON.stringify({
              type: "MESSAGE",
              domain: payload.domain,
              from: userName,
              userType: payload.userType,
              message: payload.message,
            }),
          );
        }

        return;
      }

      if (payload.type === "SURRENDER") {
        const { userName } = payload;
        const connection = connections.get(userName);
        if (!connection || !connection.master) return;
        connection.master?.surrender(userName);
        const host = connection.master.hostPlayer.username;
        const guest = connection.master.guestPlayer.username;

        const targets = [host, guest];

        for (const name of targets) {
          const conn = connections.get(name);

          if (conn?.socket && conn.socket.readyState === WebSocket.OPEN) {
            conn.socket.send(
              JSON.stringify({
                type: "END",
                winner: connection.master.winner,
              }),
            );
          }
        }

        const hostConnection = connections.get(host);

        for (const spectator of hostConnection?.spectators ?? []) {
          if (
            spectator.socket &&
            spectator.socket.readyState === WebSocket.OPEN
          ) {
            spectator.socket.send(
              JSON.stringify({
                type: "END",
                winner: connection.master.winner,
              }),
            );
          }
        }
      }
      /**
       * =========================
       * GAME MOVE
       * =========================
       */

      const moveSchema = z.object({
        type: z.literal("PLAY"),
        userName: z.string(),
        fromX: z.number(),
        fromY: z.number(),
        toX: z.number(),
        toY: z.number(),
      });

      const result = moveSchema.safeParse(payload);

      if (!result.success) {
        ws.send(
          JSON.stringify({
            type: "ERROR",
            message: "Invalid MOVE payload",
            issues: result.error.flatten(),
          }),
        );
        return;
      }

      const { fromX, fromY, toX, toY, type } = result.data;

      if (type === "PLAY") {
        if (!userName) {
          ws.send(
            JSON.stringify({
              type: "ERROR",
              message: "Not initialized",
            }),
          );
          return;
        }

        const connection = connections.get(userName);

        if (!connection?.master) {
          ws.send(
            JSON.stringify({
              type: "ERROR",
              message: "Game session not found",
            }),
          );
          return;
        }

        if (connection.master.winner) {
          ws.send(
            JSON.stringify({
              type: "END",
              reason: "Game has already ended",
            }),
          );
          return;
        }

        const success = connection.master.move(
          userName,
          fromX,
          fromY,
          toX,
          toY,
        );

        if (!success) {
          if (connection.master.winner) {
            const host = connection.master.hostPlayer.username;
            const guest = connection.master.guestPlayer.username;

            const targets = [host, guest];

            for (const name of targets) {
              const conn = connections.get(name);

              if (conn?.socket && conn.socket.readyState === WebSocket.OPEN) {
                conn.socket.send(
                  JSON.stringify({
                    type: "END",
                    winner: connection.master.winner,
                  }),
                );
              }
            }

            const hostConnection = connections.get(host);

            for (const spectator of hostConnection?.spectators ?? []) {
              if (
                spectator.socket &&
                spectator.socket.readyState === WebSocket.OPEN
              ) {
                spectator.socket.send(
                  JSON.stringify({
                    type: "END",
                    winner: connection.master.winner,
                  }),
                );
              }
            }
          }

          ws.send(
            JSON.stringify({
              type: "MOVE_REJECTED",
              reason: "Illegal move",
            }),
          );

          logger.warn("[WS] Move rejected", {
            userName,
            fromX,
            fromY,
            toX,
            toY,
          });

          return;
        }

        logger.info("[WS] Move accepted", {
          userName,
          fromX,
          fromY,
          toX,
          toY,
        });

        /**
         * Broadcast
         */
        const host = connection.master.hostPlayer.username;
        const guest = connection.master.guestPlayer.username;

        const targets = [host, guest];

        for (const name of targets) {
          const conn = connections.get(name);

          if (conn?.socket && conn.socket.readyState === WebSocket.OPEN) {
            conn.socket.send(
              JSON.stringify({
                type: "MOVE_PIECE",
                player: userName,
                fromX,
                fromY,
                toX,
                toY,
                time: connection.master.getTime(),
              }),
            );
          }
        }

        const hostConnection = connections.get(host);

        for (const spectator of hostConnection?.spectators ?? []) {
          if (
            spectator.socket &&
            spectator.socket.readyState === WebSocket.OPEN
          ) {
            spectator.socket.send(
              JSON.stringify({
                type: "MOVE_PIECE",
                player: userName,
                fromX,
                fromY,
                toX,
                toY,
              }),
            );
          }
        }

        if (connection.master.winner) {
          const host = connection.master.hostPlayer.username;
          const guest = connection.master.guestPlayer.username;

          const targets = [host, guest];

          for (const name of targets) {
            const conn = connections.get(name);

            if (conn?.socket && conn.socket.readyState === WebSocket.OPEN) {
              conn.socket.send(
                JSON.stringify({
                  type: "END",
                  winner: connection.master.winner,
                }),
              );
            }
          }

          const hostConnection = connections.get(host);

          for (const spectator of hostConnection?.spectators ?? []) {
            if (
              spectator.socket &&
              spectator.socket.readyState === WebSocket.OPEN
            ) {
              spectator.socket.send(
                JSON.stringify({
                  type: "END",
                  winner: connection.master.winner,
                }),
              );
            }
          }
        }
      }
    });

    /**
     * =========================
     * CLEANUP
     * =========================
     */
    ws.on("close", () => {
      if (userName) {
        const conn = connections.get(userName);

        if (conn) {
          conn.socket = null;
        }

        for (const [, connection] of connections) {
          const spectator = connection.spectators?.find(
            (s) => s.userName === userName,
          );

          if (spectator) {
            spectator.socket = null;
            break;
          }
        }
      }

      logger.info("[WS] Disconnected", { userName });
    });
  });

  return wss;
}
