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
  private _hostTime: null | number;
  private _guestTime: null | number;
  private _hostRegisterTime: null | number;
  private _guestRegisterTime: null | number;
  private _increment: number;
  private _code: string;

  constructor(
    hostPlayer: Player,
    guestPlayer: Player,
    increment: number,
    code: string,
  ) {
    this._board = createInitBoard();
    this._hostPlayer = hostPlayer;
    this._guestPlayer = guestPlayer;
    this.firstPlayer = "";
    this._playerInTurn = "";
    this.isMoveBoard = [...Array(8)].map(() => Array(8).fill(false));
    this._winner = null;
    this._guestRegisterTime = null;
    this._hostRegisterTime = null;
    this._hostTime = null;
    this._guestTime = null;
    this._increment = increment;
    this._code = code;
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

  private togglePlayerInTurn() {
    if (this._playerInTurn === "GUEST") {
      this._playerInTurn = "HOST";
    } else {
      this._playerInTurn = "GUEST";
    }
  }

  private updateTimer() {
    if (
      !this._hostRegisterTime ||
      !this._guestRegisterTime ||
      !this._guestTime ||
      !this._hostTime
    )
      throw "Time cannot be caculated if not initialized";
    if (this._playerInTurn === "GUEST") {
      const elapsedTime = Date.now() - this._guestRegisterTime;
      console.log({
        guestTime: this._guestTime,
        hostTime: this._hostTime,
        elapsedTime,
        increment: this.increment,
      });
      this._guestRegisterTime = Date.now();
      this._hostRegisterTime = Date.now();
      this._guestTime = this._guestTime - elapsedTime + this._increment;
    } else {
      const elapsedTime = Date.now() - this._hostRegisterTime;
      console.log({
        guestTime: this._guestTime,
        hostTime: this._hostTime,
        elapsedTime,
        increment: this._increment,
      });
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
    console.log();
    this._winner = winner;
    const { data, error } = await supabase
      .from("Room")
      .update({
        status: winner,
      })
      .eq("code", this._code)
      .select()
      .single();
    console.log("ENDING GAME", this._code, data, error);
    if (error) throw "failed to end game";
  }
  public move(
    username: string,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ): boolean {
    if (this._winner) return false;

    const isTimeLegit = this.isTimeLegit();
    if (isTimeLegit === "GUEST") {
      this.endGame("HOST");
      return false;
    } else if (isTimeLegit === "HOST") {
      this.endGame("GUEST");
      return false;
    }

    let board = structuredClone(this._board);
    let referee = new Referee();

    logger.info("[MOVE_ATTEMPT]", {
      username,
      from: { x: fromX, y: fromY },
      to: { x: toX, y: toY },
      currentTurn: this._playerInTurn,
    });

    let team = "";
    let player = "";
    const piece = this._board[fromX][fromY];

    if (!piece) return false;

    if (this._hostPlayer.username === username) {
      team = this._hostPlayer.team;
      player = "HOST";
    } else if (this._guestPlayer.username === username) {
      team = this._guestPlayer.team;
      player = "GUEST";
    } else {
      logger.warn("[MOVE_REJECTED] Unknown player tried to move", {
        username,
      });

      return false;
    }

    if (this._playerInTurn !== player) {
      logger.warn("[MOVE_REJECTED] Not player's turn", {
        username,
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
    let isChecked = referee.isChecked(
      this.playerInTurn === "HOST"
        ? this._hostPlayer.team
        : this._guestPlayer.team,
      this.board,
    );

    if (!canMove) {
      logger.warn("[MOVE_REJECTED] Illegal move", {
        username,
        from: { x: fromX, y: fromY },
        to: { x: toX, y: toY },
      });
      return false;
    }

    if (isChecked) {
      board[toX][toY] = board[fromX][fromY];
      board[fromX][fromY] = null;
      referee = new Referee();
      // console.log(board);
      isChecked = referee.isChecked(
        this.playerInTurn === "HOST"
          ? this._hostPlayer.team
          : this._guestPlayer.team,
        this.board,
      );
      if (isChecked) {
        logger.warn("[MOVE_REJECTED] can be eaten this move", {
          username,
          from: { x: fromX, y: fromY },
          to: { x: toX, y: toY },
        });

        return false;
      }
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
      const winner = this.playerInTurn === "GUEST" ? "HOST" : "GUEST";
      this.endGame(winner);
      logger.warn(`[MOVE_SUCCESS] ${this._winner} wins`, {
        username,
        from: { x: fromX, y: fromY },
        to: { x: toX, y: toY },
      });
    }

    this.isMoveBoard[fromX][fromY] = true;
    this.updateTimer();
    this.togglePlayerInTurn();
    // console.log(this._board);
    logger.info("[MOVE_SUCCESS]", {
      username,
      movedFrom: { x: fromX, y: fromY },
      movedTo: { x: toX, y: toY },
      nextTurn: this._playerInTurn,
      team,
    });

    return true;
  }
}
