import { Request, Response } from "express";
import {
  badRequest,
  findValueInMap,
  makeCode,
  ok,
  serverError,
} from "../../utilities/utilities";
import { supabase } from "../../lib/supabase";
import { logger } from "../../lib/logger";
import { GameMaster } from "../../services/GameMaster";
import { Player } from "../../models/Player";
import { Connection, connections } from "../../store/global";
import {
  ActiveRoomsSchema,
  ConfigRoomSchema,
  GetRoomByIdParamsDTO,
  GetRoomParamsDTO,
  JoinRoomDTO,
  MakeReadyDTO,
  MakeRoomDTO,
  RandomRoomDTO,
  SpectateRoomDTO,
} from "./validators/types";

import { UserService } from "../../services/UserService";
import { matchService } from "../../services/MatchService";
import { Mutex } from "async-mutex";

const locks = new Map<number, Mutex>();
function getLock(userId: number) {
  if (!locks.has(userId)) {
    locks.set(userId, new Mutex());
  }

  return locks.get(userId)!;
}

const globalLock = new Mutex();
const userService = new UserService();
// remove ready rooms and use connections as truth that there room
export class MatchController {
  public async configRoom(
    hostId: number,
    data: ConfigRoomSchema,
    res: Response,
  ) {
    const userMutex = getLock(hostId);

    return userMutex.runExclusive(async () => {
      try {
        const { color, domain, increment, turnTime } = data;
        let hostConnection = connections.get(hostId);

        if (!hostConnection) return badRequest(res, "cannot find host");

        const isControlledRoomHost =
          hostConnection.type === "CONTROLLED" &&
          hostConnection.userType === "HOST";

        if (!isControlledRoomHost) return badRequest(res, "not found host ");

        const isInPlay = hostConnection.master && !hostConnection.master.winner;

        if (isInPlay) return badRequest(res, "go back to your match");

        const controlledRoomGuestQuery = (
          _key: number,
          connection: Connection,
        ) =>
          connection.type === "CONTROLLED" &&
          connection.userType === "GUEST" &&
          connection.code === hostConnection.code;

        const updatedHostConnection = {
          ...hostConnection,
          increment,
          color,
          domain,
          time: turnTime,
        };

        connections.set(hostId, updatedHostConnection);

        const { key: guestId, value: guestConnection } = findValueInMap(
          controlledRoomGuestQuery,
          connections,
        );

        if (guestConnection) {
          const updateGuestConnection = {
            ...guestConnection,
            increment,
            color,
            domain,
            time: turnTime,
          };

          connections.set(guestId, updateGuestConnection);
        }

        return ok(res, {
          success: true,
          message: "configured room",
          code: hostConnection.code,
          color,
          domain,
          increment,
          turnTime,
          hostName: hostConnection.userName,
        });
      } catch (err) {
        logger.error("[GET_ROOM] Unexpected error", err);

        return serverError(res, "couldn't config room");
      }
    });
  }

  public makeRoom(hostId: number, data: MakeRoomDTO, res: Response) {
    const userMutex = getLock(hostId);

    return userMutex.runExclusive(async () => {
      try {
        const { color, domain, increment, turnTime } = data;
        const code = makeCode(10);

        logger.info("[MAKE_ROOM] Creating room", {
          hostId,
          color,
          domain,
          increment,
          turnTime,
        });

        const hostConnection = connections.get(hostId);
        const isInPlay =
          hostConnection?.master && !hostConnection.master.winner;

        if (isInPlay) return badRequest(res, "go back to your match");

        const alreadyHasControlledRoom =
          hostConnection?.master === null &&
          hostConnection.type === "CONTROLLED";

        if (alreadyHasControlledRoom) {
          logger.info("[MAKE_ROOM] already has room", hostConnection);
          return ok(
            res,
            {
              code: hostConnection.code,
              color: hostConnection.color,
              domain: hostConnection.domain,
              increment: hostConnection.increment,
              turnTime: hostConnection.time,
              hostName: hostConnection.userName,
              guestName: "",
            },
            201,
          );
        }

        const { error: hostError, data: hostData } =
          await userService.findById(hostId);

        if (hostError) return badRequest(res, "user not found");
        connections.set(hostId, {
          userName: hostData.user_name,
          code,
          master: null,
          socket: null,
          spectators: [],
          isReady: true,
          type: "CONTROLLED",
          userType: "HOST",
          time: turnTime,
          increment,
          domain,
          color,
        });

        logger.info("[MAKE_ROOM] Room created successfully", {
          code,
          hostId,
        });

        return ok(
          res,
          {
            code,
            color,
            domain,
            increment,
            turnTime,
            hostName: hostData.user_name,
            guestName: "",
          },
          201,
        );
      } catch (err) {
        logger.error("[MAKE_ROOM] Unexpected error", err);

        return serverError(res, err);
      }
    });
  }

  public async getRoomByUsername(
    userId: number,
    data: GetRoomByIdParamsDTO,
    res: Response,
  ) {
    try {
      const connection = connections.get(userId);

      if (!connection || !connection.master)
        return badRequest(res, "not found room");

      const hostQuery = (_key: number, conn: Connection) =>
        conn.code === connection.code &&
        conn.type === "CONTROLLED" &&
        conn.userType === "HOST";

      const guestQuery = (_key: number, conn: Connection) =>
        conn.code === connection.code &&
        conn.type === "CONTROLLED" &&
        conn.userType === "GUEST";
      const { value: hostConnection } = findValueInMap(hostQuery, connections);

      const { value: guestConnection } = findValueInMap(
        guestQuery,
        connections,
      );

      const isInPlay = connection.master && !connection.master.winner;

      const hasMatchTime =
        connection.master?.getTime().hostTime &&
        connection.master?.getTime().guestTime;
      const isReadyRoom =
        isInPlay && hostConnection && guestConnection && hasMatchTime;

      if (isReadyRoom) {
        const playerInTurn = guestConnection.master?.playerInTurn;

        return ok(res, {
          success: true,
          state: "READY",
          playerInTurn,
          increment: hostConnection.increment,
          turnTime: hostConnection.time,
          board: connection.master.board,
          hostTime: connection.master.hostTimeNow(),
          guestTime: connection.master.guestTimeNow(),
          code: hostConnection.code,
          host: hostConnection.master?.hostPlayer.username,
          guest: hostConnection.master?.guestPlayer.username,
          readyUsers: [
            hostConnection.master?.hostPlayer.username,
            hostConnection.master?.guestPlayer.username,
          ],
          color: hostConnection.color,
          domain: hostConnection.domain,
        });
      }

      return badRequest(res, "fail to get");
    } catch (err) {
      logger.error("[GET_ROOM] Unexpected error", err);

      return serverError(res, "couldn't get room");
    }
  }

  public async getRoom(userId: number, data: GetRoomParamsDTO, res: Response) {
    const { code } = data;
    try {
      logger.info(`[GET_ROOM] ${code} for ${userId}`);
      const hostQuery = (_key: number, conn: Connection) =>
        conn.code === code &&
        conn.type === "CONTROLLED" &&
        conn.userType === "HOST";

      const guestQuery = (_key: number, conn: Connection) =>
        conn.code === code &&
        conn.type === "CONTROLLED" &&
        conn.userType === "GUEST";

      const { key: hostUserId, value: hostConnection } = findValueInMap(
        hostQuery,
        connections,
      );

      const { key: guestUserId, value: guestConnection } = findValueInMap(
        guestQuery,
        connections,
      );

      if (!hostConnection || !hostUserId) {
        // logger.info("[GET_ROOM] not found host");
        return badRequest(res, "not found host");
      }

      const isReadyGame =
        hostConnection &&
        hostConnection.master &&
        guestConnection &&
        guestConnection.master
          ? true
          : false;

      if (isReadyGame) {
        const playerInTurn = guestConnection?.master?.playerInTurn;

        return ok(res, {
          success: true,
          state: "READY",
          playerInTurn,
          increment: hostConnection.increment,
          turnTime: hostConnection.time,
          code: hostConnection.code,
          host: hostConnection.master?.hostPlayer.username,
          guest: hostConnection.master?.guestPlayer.username,
          readyUsers: [
            hostConnection.master?.hostPlayer.username,
            hostConnection.master?.guestPlayer.username,
          ],
          color: hostConnection.color,
          domain: hostConnection.domain,
        });
      }

      const hostReady = hostConnection?.isReady
        ? hostConnection.userName
        : null;

      const guestReady = guestConnection?.isReady
        ? guestConnection.userName
        : null;

      return ok(res, {
        success: true,
        state: "PREPARE",
        code,
        host: hostConnection.userName,
        guest: guestConnection?.userName,
        increment: hostConnection.increment,
        turnTime: hostConnection.time,
        color: hostConnection.color,
        domain: hostConnection.domain,
        readyUsers: [hostReady, guestReady].filter(Boolean),
      });
    } catch (err) {
      logger.error("[GET_ROOM] Unexpected error", err);

      return serverError(res, "Internal server error");
    }
  }

  public async getActiveRooms(data: ActiveRoomsSchema, res: Response) {
    try {
      logger.info("[GET_ACTIVE_ROOMS] Fetching active rooms");

      const rooms = [];
      const seenCodes = new Set();

      for (const [key, connection] of connections) {
        if (
          connection.master &&
          !connection.master.winner &&
          connection.domain === "PUBLIC"
        ) {
          const code = connection.code;

          if (seenCodes.has(code)) continue;
          seenCodes.add(code);

          rooms.push({
            code,
            host: connection.master.hostPlayer.username,
            guest: connection.master.guestPlayer.username,
          });
        }
      }

      return res.status(200).json({
        success: true,
        activeRooms: rooms,
      });
    } catch (err) {
      logger.error("[GET_ROOM] Unexpected error", err);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  public async randomRoom(userId: number, data: RandomRoomDTO, res: Response) {
    const userMutex = getLock(userId);

    return userMutex.runExclusive(async () => {
      return globalLock.runExclusive(async () => {
        const requestId = crypto.randomUUID();

        const INCREMENT = 3 * 1000;
        const TURN_TIME = 5 * 60 * 1000;

        logger.info("[RANDOM_ROOM] Request received", {
          requestId,
          userId,
        });

        try {
          const connection = connections.get(userId);

          const hasActiveGame =
            connection && connection.master && !connection.master.winner;

          if (hasActiveGame) {
            return ok(
              res,
              {
                code: connection.code,
                color: connection.color,
                domain: "PUBLIC",
                increment: connection.increment,
                turnTime: connection.time,
                hostName: connection.master?.hostPlayer.username,
                guestName: connection.master?.guestPlayer.username,
                playerInTurn: connection.master?.playerInTurn,
              },
              201,
            );
          }

          const isReusableRandomSlot =
            connection &&
            connection.type === "RANDOM" &&
            connection.master === null;

          if (!isReusableRandomSlot) {
            const { data: userData } = await userService.findById(userId);
            const userName = userData.user_name;

            connections.set(userId, {
              userName: userName,
              master: null,
              socket: null,
              spectators: [],
              type: "RANDOM",
              code: null,
              isReady: true,
              userType: null,
              time: TURN_TIME,
              increment: INCREMENT,
              domain: "PUBLIC",
              color: "WHITE",
            });
          }

          if (!connection) return badRequest(res, "fail to make room");

          const freeUserQuery = (key: number, conn: Connection) =>
            conn.type === "RANDOM" && conn.master === null && key !== userId;

          const { key: freeUserId, value: freeUserConnection } = findValueInMap(
            freeUserQuery,
            connections,
          );

          if (!freeUserConnection) {
            return badRequest(res, "Failed to get room, please wait");
          }

          const code = makeCode(10);

          const { data: roomData, error } = await matchService.createRoom({
            code,
            host: freeUserId,
            guest: userId,
          });

          if (error) {
            logger.error("[RANDOM_ROOM] Room creation failed", {
              requestId,
              userId,
              roomCode: code,
              error: error.message,
            });

            return badRequest(res, "Failed to get room");
          }

          const { data: hostUser, error: hostError } =
            await userService.findById(roomData.host);
          const { data: guestUser, error: guestError } =
            await userService.findById(roomData.guest);

          if (hostError || guestError) {
            return badRequest(res, "user not found");
          }

          const master = new GameMaster(
            new Player(
              hostUser.user_name,
              hostUser.user_name,
              "WHITE",
              hostUser.id,
            ),
            new Player(
              guestUser.user_name,
              guestUser.user_name,
              "BLACK",
              guestUser.id,
            ),
            INCREMENT,
            code,
            connection.time ?? 0,
            connection.time ?? 0,
            Date.now(),
            Date.now(),
          );

          master.start();

          connections.set(roomData.host, {
            userName: hostUser.user_name,
            master,
            socket: null,
            spectators: [],
            code,
            type: "RANDOM",
            userType: "HOST",
            isReady: true,
            time: TURN_TIME,
            increment: INCREMENT,
            domain: "PUBLIC",
            color: "WHITE",
          });

          connections.set(roomData.guest, {
            userName: guestUser.user_name,
            master,
            socket: null,
            spectators: [],
            code,
            type: "RANDOM",
            userType: "GUEST",
            isReady: true,
            time: TURN_TIME,
            increment: INCREMENT,
            domain: "PUBLIC",
            color: "BLACK",
          });

          return ok(
            res,
            {
              code,
              color: "WHITE",
              domain: "PUBLIC",
              increment: INCREMENT,
              turnTime: TURN_TIME,
              hostName: hostUser.user_name,
              guestName: guestUser.user_name,
              playerInTurn: master.playerInTurn,
            },
            201,
          );
        } catch (err) {
          logger.error("[RANDOM_ROOM] Unexpected error", {
            requestId,
            userId,
            error: err instanceof Error ? err.message : err,
            stack: err instanceof Error ? err.stack : undefined,
          });

          return serverError(res, "Internal server error");
        }
      });
    });
  }

  public async joinRoom(userId: number, data: JoinRoomDTO, res: Response) {
    const { code } = data;

    try {
      logger.info("[JOIN_ROOM] Attempting to join room", {
        code,
        userId,
      });

      const hostQuery = (key: number, connection: Connection) =>
        connection.code === code &&
        connection.type === "CONTROLLED" &&
        connection.userType === "HOST";

      const { value: hostConnection } = findValueInMap(hostQuery, connections);

      if (!hostConnection) {
        return badRequest(res, "there is no room found with provided code");
      }

      const { data: guestUser, error: guestError } =
        await userService.findById(userId);

      if (guestError) {
        return badRequest(res, "user not found");
      }

      const guestUserName = guestUser.user_name;

      connections.set(userId, {
        master: null,
        socket: null,
        spectators: [],
        type: "CONTROLLED",
        code,
        isReady: false,
        userType: "GUEST",
        time: hostConnection.time,
        increment: hostConnection.increment,
        domain: hostConnection.domain,
        color: hostConnection.color,
        userName: guestUserName,
      });

      logger.info("[JOIN_ROOM] User joined successfully", {
        code,
        host: hostConnection.userName,
        guest: guestUserName,
      });

      return ok(res, {
        success: true,
        code,
        hostName: hostConnection.userName,
        guestName: guestUserName,
      });
    } catch (err) {
      logger.error("[JOIN_ROOM] Unexpected error", err);

      return serverError(res, "Internal server error");
    }
  }
  public async makeReady(userId: number, data: MakeReadyDTO, res: Response) {
    const { code, color, isReady } = data;

    try {
      logger.info("[MAKE_READY] Request received", {
        userId,
        code,
        color,
      });

      // 1. Validate user from DB
      const { data: userData, error: userError } = await supabase
        .from("User")
        .select("user_name")
        .eq("id", userId)
        .single();

      if (userError || !userData) {
        logger.error("[MAKE_READY] User not found", userError);

        return badRequest(res, "User not found");
      }

      const userName = userData.user_name;

      // 2. Find host & guest connections
      const hostQuery = (key: number, connection: Connection) =>
        connection.code === code &&
        connection.type === "CONTROLLED" &&
        connection.userType === "HOST";

      const guestQuery = (key: number, connection: Connection) =>
        connection.code === code &&
        connection.type === "CONTROLLED" &&
        connection.userType === "GUEST";

      const { value: hostConnection, key: hostUserId } = findValueInMap(
        hostQuery,
        connections,
      );

      const { value: guestConnection, key: guestUserId } = findValueInMap(
        guestQuery,
        connections,
      );

      if (!hostConnection || !guestConnection) {
        return badRequest(res, "there is no guest yet");
      }

      // 3. Update ready state for caller
      const isGuest = userId === guestUserId;

      if (isGuest) {
        guestConnection.isReady = isReady;

        return ok(res, {
          success: true,
          state: "PREPARE",
          userName,
          isReady,
        });
      }

      const isHost = userId === hostUserId;

      if (isHost) {
        hostConnection.isReady = isReady;
      }

      // 4. Validate both ready
      if (!hostConnection.isReady || !guestConnection.isReady) {
        return badRequest(res, "users are not ready yet");
      }

      logger.info("[MAKE_READY] Starting game", { code });

      // 5. Start game
      const { data: hostUser, error: hostError } =
        await userService.findById(hostUserId);

      const { data: guestUser, error: guestError } =
        await userService.findById(guestUserId);

      if (hostError || guestError || !hostUser || !guestUser) {
        return badRequest(res, "user not found");
      }

      const master = new GameMaster(
        new Player(hostUser.user_name, hostUser.user_name, color, hostUser.id),
        new Player(
          guestUser.user_name,
          guestUser.user_name,
          color === "WHITE" ? "BLACK" : "WHITE",
          guestUser.id,
        ),
        hostConnection.increment ?? 0,
        code,
        hostConnection.time ?? 0,
        hostConnection.time ?? 0,
        Date.now(),
        Date.now(),
      );

      const playerInTurn = master.start();

      connections.set(hostUserId, {
        ...hostConnection,
        master,
        isReady: true,
      });

      connections.set(guestUserId, {
        ...guestConnection,
        master,
        isReady: true,
      });

      // 6. Save room
      const { error } = await supabase.from("Room").insert({
        code,
        host: hostUserId,
        guest: guestUserId,
      });

      if (error) {
        logger.error("[MAKE_READY] DB insert failed", error);

        return badRequest(res, "Failed to create room");
      }

      return ok(res, {
        success: true,
        state: "READY",
        userName,
        playerInTurn,
        hostName: hostConnection.userName,
        guestName: guestConnection.userName,
      });
    } catch (err) {
      logger.error("[MAKE_READY] Unexpected error", err);

      return serverError(res, "Internal server error");
    }
  }

  public async spectate(userId: number, data: SpectateRoomDTO, res: Response) {
    const { code } = data;

    try {
      logger.info("[SPECTATE] Request received", {
        code,
        userId,
      });

      const hostQuery = (key: number, connection: Connection) =>
        connection.code === code && connection.userType === "HOST";

      const guestQuery = (key: number, connection: Connection) =>
        connection.code === code && connection.userType === "GUEST";

      const { key: hostUserId, value: hostConnection } = findValueInMap(
        hostQuery,
        connections,
      );

      const { key: guestUserId, value: guestConnection } = findValueInMap(
        guestQuery,
        connections,
      );

      const spectatorConnection = connections.get(userId);
      const isSpectatorInPlay =
        spectatorConnection &&
        spectatorConnection.master &&
        !spectatorConnection.master.winner;

      if (isSpectatorInPlay) {
        logger.warn("[SPECTATE] Invalid spectate request", {
          host: hostUserId,
          guest: guestUserId,
          userId,
        });

        return badRequest(res, "cannot spectate while playing");
      }

      const isInvalidRoom =
        !hostConnection ||
        !guestConnection ||
        userId === hostUserId ||
        userId === guestUserId;

      if (isInvalidRoom) {
        logger.warn("[SPECTATE] Invalid spectate request", {
          host: hostUserId,
          guest: guestUserId,
          userId,
        });

        return badRequest(res, "Game not available for spectating");
      }

      const isGameActive =
        hostConnection.master &&
        guestConnection.master &&
        !hostConnection.master.winner &&
        !guestConnection.master.winner;

      if (!isGameActive) {
        logger.warn("[SPECTATE] Game not ready", {
          host: hostUserId,
        });

        return badRequest(res, "Game not started");
      }

      if (hostConnection.domain === "PRIVATE") {
        return badRequest(res, "this is a private match cannot spectate");
      }

      // remove existing spectator session if any
      connections.delete(userId);

      logger.info("[SPECTATE] Host found", {
        host: hostUserId,
        spectatorCount: hostConnection.spectators?.length ?? 0,
      });

      // 4. prevent duplicates
      const alreadySpectatingHost = hostConnection.spectators.some(
        (s) => s.userId === userId,
      );

      const alreadySpectatingGuest = guestConnection.spectators.some(
        (s) => s.userId === userId,
      );

      if (!alreadySpectatingHost) {
        hostConnection.spectators.push({
          userId: userId,
          socket: null,
        });
      }

      if (!alreadySpectatingGuest) {
        guestConnection.spectators.push({
          userId: userId,
          socket: null,
        });
      }

      logger.info("[SPECTATE] Success response sent", {
        code,
        host: hostConnection.userName,
        guest: guestConnection.userName,
      });

      return ok(res, {
        success: true,
        code,
        host: hostConnection.userName,
        guest: guestConnection.userName,
        board: hostConnection.master?.board,
        color: hostConnection.color,
        domain: "PUBLIC",
        increment: hostConnection.increment,
        turnTime: hostConnection.time,
        playerInTurn: hostConnection.master?.playerInTurn,
      });
    } catch (err) {
      logger.error("[SPECTATE] Unexpected error", {
        err,
        stack: err instanceof Error ? err.stack : undefined,
        userId,
        data,
      });

      return serverError(res, "Internal server error");
    }
  }
}
