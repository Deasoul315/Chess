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
import { connections } from "../../store/global";
import {
  ActiveRoomsSchema,
  ConfigRoomSchema,
  GetRoomParamsDTO,
  JoinRoomDTO,
  MakeReadyDTO,
  MakeRoomDTO,
  RandomRoomDTO,
  SpectateRoomDTO,
} from "./validators/types";

// remove ready rooms and use connections as truth that there room
export class MatchController {
  public async configRoom(data: ConfigRoomSchema, res: Response) {
    const { userName, color, domain, increment, turnTime } = data;

    try {
      let { key: hostUserName, value: hostConnection } = findValueInMap(
        (element, key) =>
          key === userName &&
          element.type === "CONTROLLED" &&
          element.userType === "HOST",
        connections,
      );

      if (!hostUserName || !hostConnection)
        return badRequest(res, "not found host ");

      hostConnection = {
        ...hostConnection,
        increment,
        color,
        domain,
        time: turnTime,
      };
      connections.set(hostUserName, hostConnection);

      return res.status(200).json({
        success: true,
        message: "configured room",
        code: hostConnection.code,
        color,
        domain,
        increment,
        turnTime,
        hostName: userName,
        guestName: "",
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

  public async makeRoom(data: MakeRoomDTO, res: Response) {
    const { userName, color, domain, increment, turnTime } = data;

    const code = makeCode(10);

    try {
      logger.info("[MAKE_ROOM] Creating room", {
        userName,
        color,
        domain,
        increment,
        turnTime,
      });

      const connection = connections.get(userName);
      if (
        connection &&
        connection.master === null &&
        connection.type === "CONTROLLED"
      ) {
        return ok(
          res,
          {
            code: connection.code,
            color: connection.color,
            domain: connection.domain,
            increment: connection.increment,
            turnTime: connection.time,
            hostName: userName,
            guestName: "",
          },
          201,
        );
      }

      connections.set(userName, {
        code: code,
        master: null,
        socket: null,
        spectators: [],
        isReady: true,
        type: "CONTROLLED",
        userType: "HOST",
        time: turnTime,
        increment: increment,
        domain: domain,
        color: color,
      });

      logger.info("[MAKE_ROOM] Room created successfully", {
        code,
        host: userName,
      });

      return ok(
        res,
        {
          code,
          color,
          domain,
          increment,
          turnTime,
          hostName: userName,
          guestName: "",
        },
        201,
      );
    } catch (err) {
      logger.error("[MAKE_ROOM] Unexpected error", err);
      return serverError(res, err);
    }
  }

  public async getRoom(data: GetRoomParamsDTO, res: Response) {
    const { code } = data;

    try {
      const { key: hostUserName, value: hostConnection } = findValueInMap(
        (element) =>
          element.code === code &&
          element.type === "CONTROLLED" &&
          element.userType === "HOST",
        connections,
      );

      const { key: guestUserName, value: guestConnection } = findValueInMap(
        (element) =>
          element.code === code &&
          element.type === "CONTROLLED" &&
          element.userType === "GUEST",
        connections,
      );

      if (!hostUserName) return badRequest(res, "not found host or guest");

      const isReadyHost =
        guestConnection && guestConnection.master ? true : false;

      if (isReadyHost) {
        const playerInTurn = guestConnection?.master?.playerInTurn;

        return res.status(200).json({
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
          color: hostConnection.color === "WHITE" ? "BLACK" : "WHITE",
          domain: hostConnection.domain,
        });
      }

      return res.status(200).json({
        success: true,
        state: "PREPARE",
        code: code,
        host: hostUserName,
        guest: guestUserName,
        readyUsers: [
          connections.get(hostUserName)?.isReady ? hostUserName : null,
          connections.get(guestUserName ?? "")?.isReady ? guestUserName : null,
        ].filter(Boolean),
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

  public async getActiveRooms(data: ActiveRoomsSchema, res: Response) {
    try {
      logger.info("[GET_ACTIVE_ROOMS] Fetching active rooms");

      const rooms = [];

      for (const [key, connection] of connections) {
        if (connection.master) {
          const code = connection.code;
          const host = connection.master.hostPlayer.username;
          const guest = connection.master.guestPlayer.username;
          rooms.push({
            code,
            host,
            guest,
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

  public async randomRoom(data: RandomRoomDTO, res: Response) {
    const { userName } = data;
    const requestId = crypto.randomUUID();
    const INCREMENT = 3 * 1000;
    const TURN_TIME = 5 * 60 * 1000;
    logger.info("[RANDOM_ROOM] Request received", {
      requestId,
      userName,
    });

    try {
      logger.info("[RANDOM_ROOM] Validating user", {
        requestId,
        userName,
      });

      const { data: userData, error: userError } = await supabase
        .from("User")
        .select("user_name")
        .eq("user_name", userName)
        .single();

      if (userError) {
        logger.error("[RANDOM_ROOM] User validation failed", {
          requestId,
          userName,
          error: userError.message,
        });

        return badRequest(res, "cannot find user");
      }

      logger.info("[RANDOM_ROOM] User validated", {
        requestId,
        userName,
      });

      const connection = connections.get(userName);

      if (connection && connection.master && connection.type === "RANDOM") {
        logger.info("[RANDOM_ROOM] Returning existing room", {
          requestId,
          userName,
          roomCode: connection.code,
          host: connection.master.hostPlayer.username,
          guest: connection.master.guestPlayer.username,
        });
        return ok(
          res,
          {
            code: connection.code,
            color: "WHITE",
            domain: "PUBLIC",
            increment: INCREMENT,
            turnTime: TURN_TIME,
            hostName: connection.master.hostPlayer.username,
            guestName: connection.master.guestPlayer.username,
            playerInTurn: connection?.master?.playerInTurn,
          },
          201,
        );
      }

      if (!connection || connection.type !== "RANDOM") {
        connections.set(userName, {
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

      const { key: freeUser, value: freeUserConnection } = findValueInMap(
        (connection, key) =>
          connection.master === null &&
          userName !== key &&
          connection.type === "RANDOM",
        connections,
      );

      if (!freeUserConnection) {
        return badRequest(res, "Failed to get room, please wait");
      }

      logger.info("[RANDOM_ROOM] Existing room found", {
        requestId,
        userName,
        roomCode: connection?.code,
      });

      const code = makeCode(10);
      const { data: roomData, error } = await supabase
        .from("Room")
        .insert({
          code,
          host: freeUser,
          guest: userName,
        })
        .select()
        .single();

      if (error) {
        logger.error("[RANDOM_ROOM] Failed to fetch existing room", {
          requestId,
          userName,
          roomCode: code,
          error: error.message,
        });

        return badRequest(res, "Failed to get room", {
          dbError: error.message,
        });
      }

      logger.info("[RANDOM_ROOM] Returning existing room", {
        requestId,
        userName,
        roomCode: code,
        host: roomData.host,
        guest: roomData.guest,
      });

      const master = new GameMaster(
        new Player(roomData.host, roomData.host, "WHITE"),
        new Player(roomData.guest, roomData.guest, "BLACK"),
        INCREMENT,
        code,
      );

      const playerInTurn = master.start();

      connections.set(roomData.host, {
        master,
        socket: null,
        spectators: [],
        code: code,
        type: "RANDOM",
        userType: "HOST",
        isReady: true,
        time: TURN_TIME,
        increment: INCREMENT,
        domain: "PUBLIC",
        color: "WHITE",
      });
      connections.set(roomData.guest, {
        master,
        socket: null,
        spectators: [],
        code: code,
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
          code: code,
          color: "WHITE",
          domain: "PUBLIC",
          increment: INCREMENT,
          turnTime: TURN_TIME,
          hostName: roomData.host,
          guestName: roomData.guest,
          playerInTurn: master.playerInTurn,
        },
        201,
      );
    } catch (err) {
      logger.error("[RANDOM_ROOM] Unexpected error", {
        requestId,
        userName,
        error: err instanceof Error ? err.message : err,
        stack: err instanceof Error ? err.stack : undefined,
      });

      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  public async joinRoom(data: JoinRoomDTO, res: Response) {
    const { code, guestName } = data;

    try {
      logger.info("[JOIN_ROOM] Attempting to join room", {
        code,
        guestName,
      });

      const { key: hostUserName, value: hostConnection } = findValueInMap(
        (connection) =>
          connection.code === code &&
          connection.type === "CONTROLLED" &&
          connection.userType === "HOST",
        connections,
      );

      if (!hostConnection) {
        return badRequest(res, "there is no room found with provided code");
      }

      connections.set(guestName, {
        master: null,
        socket: null,
        spectators: [],
        type: "CONTROLLED",
        code: code,
        isReady: false,
        userType: "GUEST",
        time: hostConnection.time,
        increment: hostConnection.increment,
        domain: hostConnection.domain,
        color: hostConnection.color === "WHITE" ? "BLACK" : "WHITE",
      });

      logger.info("[JOIN_ROOM] User joined successfully", {
        code,
        host: hostUserName,
        guest: guestName,
      });

      return res.status(200).json({
        success: true,
        code: code,
        hostName: hostUserName,
        guestName: guestName,
      });
    } catch (err) {
      logger.error("[JOIN_ROOM] Unexpected error", err);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  public async makeReady(data: MakeReadyDTO, res: Response) {
    const { userName, code, color, isReady } = data;

    try {
      logger.info("[MAKE_READY] Request received", {
        userName,
        code,
        color,
      });

      // 1. Validate user exists
      const { data: userData, error: userError } = await supabase
        .from("User")
        .select("user_name")
        .eq("user_name", userName)
        .single();

      if (userError || !userData) {
        logger.error("[MAKE_READY] User not found", userError);

        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const { key: hostUserName, value: hostConnection } = findValueInMap(
        (connection, key) =>
          connection.code === code &&
          connection.type === "CONTROLLED" &&
          connection.userType === "HOST",
        connections,
      );

      const { key: guestUserName, value: guestConnection } = findValueInMap(
        (connection, key) =>
          connection.code === code &&
          connection.type === "CONTROLLED" &&
          connection.userType === "GUEST",
        connections,
      );
      if (!guestUserName || !hostUserName)
        return badRequest(res, "there is no guest yet");

      // 4. Only host triggers game start
      if (guestUserName === userName) {
        guestConnection.isReady = isReady;
        console.log("GUEST IS READY? ", guestConnection.isReady);
        return res.status(200).json({
          success: true,
          state: "PREPARE",
          userName,
          isReady: isReady,
        });
      }
      console.log(
        "IS READY? ",
        guestConnection.isReady,
        hostConnection.isReady,
      );
      if (guestConnection.isReady !== true || hostConnection.isReady !== true)
        return badRequest(res, "users are not ready yet");
      // 5. Start game (host only)
      logger.info("[MAKE_READY] Starting game", {
        code: code,
      });

      const master = new GameMaster(
        new Player(hostUserName, hostUserName, color),
        new Player(
          guestUserName,
          guestUserName,
          color === "WHITE" ? "BLACK" : "WHITE",
        ),
        hostConnection.increment ?? 0,
        code,
      );

      const playerInTurn = master.start();

      connections.set(hostUserName, {
        master,
        socket: null,
        spectators: [],
        code: hostConnection.code,
        isReady: true,
        userType: "HOST",
        type: "CONTROLLED",
        time: hostConnection.time,
        increment: hostConnection.increment,
        domain: hostConnection.domain,
        color: hostConnection.color === "WHITE" ? "BLACK" : "WHITE",
      });
      connections.set(guestUserName, {
        master,
        socket: null,
        spectators: [],
        code: hostConnection.code,
        isReady: true,
        userType: "GUEST",
        type: "CONTROLLED",
        time: hostConnection.time,
        increment: hostConnection.increment,
        domain: hostConnection.domain,
        color: hostConnection.color === "WHITE" ? "BLACK" : "WHITE",
      });

      const { data: roomData, error } = await supabase
        .from("Room")
        .insert({
          code,
          host: hostUserName,
          guest: guestUserName,
        })
        .select()
        .single();

      if (error) {
        logger.error("[MAKE_ROOM] DB insert failed", error);

        return badRequest(res, "Failed to create room", {
          dbError: error.message,
        });
      }

      return res.status(200).json({
        success: true,
        state: "READY",
        userName,
        playerInTurn,
        hostName: hostUserName,
        guestName: guestUserName,
      });
    } catch (err) {
      logger.error("[MAKE_READY] Unexpected error", err);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  public async spectate(data: SpectateRoomDTO, res: Response) {
    const { code, userName } = data;

    try {
      logger.info("[SPECTATE] Request received", {
        code,
        userName,
        rawData: data,
      });

      const { key: hostUserName, value: hostConnection } = findValueInMap(
        (connection, key) =>
          connection.code === code && connection.userType === "HOST",
        connections,
      );

      const { key: guestUserName, value: guestConnection } = findValueInMap(
        (connection, key) =>
          connection.code === code && connection.userType === "GUEST",
        connections,
      );

      if (!hostConnection || !guestConnection) {
        logger.warn("[SPECTATE] No host or guest connection found", {
          host: hostUserName,
        });

        return res.status(400).json({
          success: false,
          message: "Game not started (host not connected)",
          debug: {
            host: hostUserName,
          },
        });
      }

      if (!hostConnection.master || !guestConnection.master) {
        logger.warn("[SPECTATE] No hosted ready room for that code", {
          host: hostUserName,
        });

        return res.status(400).json({
          success: false,
          message: "Game not started (host not connected)",
          debug: {
            host: hostUserName,
          },
        });
      }

      logger.info("[SPECTATE] Host connection found", {
        host: hostUserName,
        spectatorCount: hostConnection.spectators?.length ?? 0,
      });

      if (hostConnection.domain === "PRIVATE") {
        return badRequest(res, "this is a private match cannot spectate");
      }

      // 4. Check duplicates
      const alreadySpectating = hostConnection.spectators.some(
        (s) => s.userName === userName,
      );

      logger.info("[SPECTATE] Duplicate check", {
        userName,
        alreadySpectating,
        currentSpectators: hostConnection.spectators.map((s) => s.userName),
      });

      if (!alreadySpectating) {
        hostConnection.spectators.push({
          userName,
          socket: null,
        });

        logger.info("[SPECTATE] Spectator added", {
          code,
          userName,
          totalSpectators: hostConnection.spectators.length,
        });
      } else {
        logger.info("[SPECTATE] User already spectating", {
          userName,
        });
      }

      // 5. Final response
      logger.info("[SPECTATE] Success response sent", {
        code,
        host: hostUserName,
        guest: hostConnection.master.guestPlayer.username,
      });

      return res.status(200).json({
        success: true,
        code,
        host: hostUserName,
        guest: hostConnection.master.guestPlayer.username,
        board: hostConnection.master.board,
        color: "WHITE",
        domain: "PUBLIC",
        increment: hostConnection.increment,
        turnTime: hostConnection.time,
        playerInTurn: hostConnection.master.playerInTurn,
      });
    } catch (err) {
      logger.error("[SPECTATE] Unexpected error", {
        err,
        stack: err instanceof Error ? err.stack : undefined,
        data,
      });

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
