import { Piece } from "../constants.ts/types";
import { logger } from "../lib/logger";
import { supabase } from "../lib/supabase";
import { Player } from "../models/Player";
import { createInitBoard, getRandomInRange } from "../utilities/utilities";
import { Referee } from "./Referee";

export class GameMaster {
  private _board: (null | Piece)[][];
  private _hostPlayer: Player;
  private _guestPlayer: Player;
  private firstPlayer: "HOST" | "GUEST" | "";
  private _playerInTurn: "HOST" | "GUEST" | "";
  private isMoveBoard: boolean[][];
  private _winner: "HOST" | "GUEST" | "DRAW" | null;
  private _hostTime: number;
  private _guestTime: number;
  private _hostRegisterTime: number;
  private _guestRegisterTime: number;
  private _increment: number;
  private _code: string;
  private _version: number;

  constructor(
    hostPlayer: Player,
    guestPlayer: Player,
    increment: number,
    code: string,
    guestTime: number,
    hostTime: number,
    hostRegisterTime: number,
    guestRegisterTime: number,
  ) {
    this._board = createInitBoard();
    this._hostPlayer = hostPlayer;
    this._guestPlayer = guestPlayer;
    this.firstPlayer = "";
    this._playerInTurn = "";
    this.isMoveBoard = [...Array(8)].map(() => Array(8).fill(false));
    this._winner = null;
    this._guestRegisterTime = guestRegisterTime;
    this._hostRegisterTime = hostRegisterTime;
    this._hostTime = hostTime;
    this._guestTime = guestTime;
    this._increment = increment;
    this._code = code;
    this._version = 0;
  }

  set increment(increment: number) {
    this._increment = increment;
  }

  get winner() {
    return this._winner;
  }

  get playerInTurn() {
    return this._playerInTurn;
  }
  get hostPlayer() {
    return this._hostPlayer;
  }
  get guestPlayer() {
    return this._guestPlayer;
  }
  get board() {
    return this._board;
  }

  get hostTime() {
    return this._hostTime;
  }

  get guestTime() {
    return this._guestTime;
  }

  get version() {
    return this._version;
  }

  public setTime(value: {
    guestTime: number;
    hostTime: number;
    hostRegisterTime: number;
    guestRegisterTime: number;
  }) {
    this._guestTime = value.guestTime;
    this._hostTime = value.hostTime;
    this._hostRegisterTime = value.hostRegisterTime;
    this._guestRegisterTime = value.guestRegisterTime;
  }

  public getTime() {
    return {
      guestTime: this._guestTime,
      hostTime: this._hostTime,
      hostRegisterTime: this._hostRegisterTime,
      guestRegisterTime: this._guestRegisterTime,
    };
  }

  public isTimeLegit() {
    if (
      !this._hostRegisterTime ||
      !this._guestRegisterTime ||
      !this._guestTime ||
      !this._hostTime
    )
      throw "Time cannot be caculated if not initialized";

    if (this.playerInTurn === "HOST") {
      const isTimeOut = Date.now() > this._hostRegisterTime + this._hostTime;
      if (isTimeOut) return "HOST";
      return "LEGIT";
    }

    if (this.playerInTurn === "GUEST") {
      const isTimeOut = Date.now() > this._guestRegisterTime + this._guestTime;
      if (isTimeOut) return "GUEST";
      return "LEGIT";
    }
  }

  public updateGameState() {
    const isTimeLegit = this.isTimeLegit();
    if (isTimeLegit === "GUEST") {
      this.endGame("HOST");
      return true;
    } else if (isTimeLegit === "HOST") {
      this.endGame("GUEST");
      return true;
    }
    return false;
  }

  private togglePlayerInTurn() {
    if (this._playerInTurn === "GUEST") {
      this._playerInTurn = "HOST";
    } else {
      this._playerInTurn = "GUEST";
    }
  }

  public hostTimeNow() {
    if (!this._hostRegisterTime || !this._hostTime)
      throw "Time cannot be caculated if not initialized";
    if (this._playerInTurn === "HOST") {
      const elapsedTime = Date.now() - this._hostRegisterTime;
      return this._hostTime - elapsedTime;
    }
    return this._hostTime;
  }

  public guestTimeNow() {
    if (!this._guestRegisterTime || !this._guestTime)
      throw "Time cannot be caculated if not initialized";
    if (this._playerInTurn === "GUEST") {
      const elapsedTime = Date.now() - this._guestRegisterTime;
      return this._guestTime - elapsedTime;
    }
    return this._guestTime;
  }

  private updateTimer() {
    if (
      !this._hostRegisterTime ||
      !this._guestRegisterTime ||
      !this._guestTime ||
      !this._hostTime ||
      !this._playerInTurn
    )
      throw "Time cannot be caculated if not initialized";
    if (this._playerInTurn === "GUEST") {
      const elapsedTime = Date.now() - this._guestRegisterTime;

      this._guestRegisterTime = Date.now();
      this._hostRegisterTime = Date.now();
      this._guestTime = this._guestTime - elapsedTime + this._increment;
    } else {
      const elapsedTime = Date.now() - this._hostRegisterTime;
      this._guestRegisterTime = Date.now();
      this._hostRegisterTime = Date.now();
      this._hostTime = this._hostTime - elapsedTime + this._increment;
    }
  }

  public start(): "HOST" | "GUEST" {
    const roll = getRandomInRange(0, 1);

    if (roll === 0) {
      this.firstPlayer = "HOST";
      this._playerInTurn = "HOST";

      logger.info("[GAME_START] First turn assigned", {
        firstPlayer: "HOST",
        host: this._hostPlayer.username,
        guest: this._guestPlayer.username,
      });

      return "HOST";
    }

    this.firstPlayer = "GUEST";
    this._playerInTurn = "GUEST";

    logger.info("[GAME_START] First turn assigned", {
      firstPlayer: "GUEST",
      host: this._hostPlayer.username,
      guest: this._guestPlayer.username,
    });

    return "GUEST";
  }

  private async endGame(winner: "HOST" | "GUEST" | "DRAW") {
    this._version++;
    this._winner = winner;
    const { data, error } = await supabase
      .from("Room")
      .update({
        status: winner,
      })
      .eq("code", this._code)
      .select()
      .single();
    if (error) throw "failed to end game";
  }
  public move(
    userId: number,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ): boolean {
    let referee = new Referee();
    let board = structuredClone(this._board);

    if (this._winner) return false;

    const isTimeLegit = this.isTimeLegit();
    if (isTimeLegit === "GUEST") {
      this.endGame("HOST");
      return false;
    } else if (isTimeLegit === "HOST") {
      this.endGame("GUEST");
      return false;
    } else if (referee.isDraw(board)) {
      this.endGame("DRAW");
      return false;
    }

    logger.info("[MOVE_ATTEMPT]", {
      userId,
      from: { x: fromX, y: fromY },
      to: { x: toX, y: toY },
      currentTurn: this._playerInTurn,
    });

    let team = "";
    let player = "";
    const piece = this._board[fromX][fromY];

    if (!piece) return false;

    if (this._hostPlayer.id === userId) {
      team = this._hostPlayer.team;
      player = "HOST";
    } else if (this._guestPlayer.id === userId) {
      team = this._guestPlayer.team;
      player = "GUEST";
    } else {
      logger.warn("[MOVE_REJECTED] Unknown player tried to move", {
        userId,
      });

      return false;
    }

    if (this._playerInTurn !== player) {
      logger.warn("[MOVE_REJECTED] Not player's turn", {
        userId,
        playerRole: player,
        currentTurn: this._playerInTurn,
      });

      return false;
    }

    const canMove = referee.canMove(
      fromX,
      fromY,
      toX,
      toY,
      this.board,
      this.isMoveBoard,
    );

    if (!canMove) {
      logger.warn("[MOVE_REJECTED] Illegal move", {
        userId,
        from: { x: fromX, y: fromY },
        to: { x: toX, y: toY },
      });
      return false;
    }

    board[toX][toY] = board[fromX][fromY];
    board[fromX][fromY] = null;
    referee = new Referee();
    const isChecked = referee.isChecked(
      this.playerInTurn === "HOST"
        ? this._hostPlayer.team
        : this._guestPlayer.team,
      board,
    );
    if (isChecked) {
      logger.warn("[MOVE_REJECTED] can be eaten this move", {
        userId,
        from: { x: fromX, y: fromY },
        to: { x: toX, y: toY },
      });

      return false;
    }

    let isPromote = piece.type === "PAWN" && (toX === 0 || toX === 7);
    if (isPromote) {
      piece.type = "QUEEN";
    }

    let isCastling = piece.type === "KING" && Math.abs(toY - fromY) === 2;
    if (isCastling && fromY - toY > 0) {
      this._board[fromX][fromY - 1] = this._board[fromX][0];
      this._board[fromX][0] = null;
    } else if (isCastling && fromY - toY < 0) {
      this._board[fromX][fromY + 1] = this._board[fromX][7];
      this._board[fromX][7] = null;
    }
    this._board[toX][toY] = this._board[fromX][fromY];
    this._board[fromX][fromY] = null;

    if (
      !referee.canEscapeCheck(
        piece.team === "WHITE" ? "BLACK" : "WHITE",
        this.board,
        this.isMoveBoard,
      )
    ) {
      const winner = this.playerInTurn;

      if (!winner) throw "player in turn not set";

      this.endGame(winner);
      logger.warn(`[MOVE_SUCCESS] ${this._winner} wins`, {
        userId,
        from: { x: fromX, y: fromY },
        to: { x: toX, y: toY },
      });
    } else if (referee.isDraw(board)) {
      logger.warn(`DRAW`, {
        userId,
        from: { x: fromX, y: fromY },
        to: { x: toX, y: toY },
      });
      this.endGame("DRAW");
    }

    this.isMoveBoard[fromX][fromY] = true;

    this._version++;
    this.updateTimer();
    this.togglePlayerInTurn();
    logger.info("[MOVE_SUCCESS]", {
      userId,
      movedFrom: { x: fromX, y: fromY },
      movedTo: { x: toX, y: toY },
      nextTurn: this._playerInTurn,
      team,
    });

    return true;
  }

  public surrender(userId: number) {
    if (this.hostPlayer.id === userId) {
      this.endGame("GUEST");
    } else {
      this.endGame("HOST");
    }
  }
}
