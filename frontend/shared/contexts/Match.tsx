"use client";

import { createContext, useContext, useReducer } from "react";
import React from "react";
import { Domain, Match, Message, Piece, PieceType } from "../constants/types";
import { PIECES_TYPE } from "../constants/constants";
import { Referee } from "../features/referee/referee";
console.log("call");
export function createInitBoard(): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array.from({ length: 8 }, () =>
    Array.from({ length: 8 }, () => null),
  );

  const backRow = [
    PIECES_TYPE.ROOK,
    PIECES_TYPE.KNIGHT,
    PIECES_TYPE.BISHOP,
    PIECES_TYPE.QUEEN,
    PIECES_TYPE.KING,
    PIECES_TYPE.BISHOP,
    PIECES_TYPE.KNIGHT,
    PIECES_TYPE.ROOK,
  ];

  // BLACK pieces
  for (let col = 0; col < 8; col++) {
    board[0][col] = {
      type: backRow[col],
      team: "BLACK",
      image: `/pieces/${backRow[col]}_b.png`,
    };

    board[1][col] = {
      type: PIECES_TYPE.PAWN,
      team: "BLACK",
      image: `/pieces/pawn_b.png`,
    };
  }

  // WHITE pieces
  for (let col = 0; col < 8; col++) {
    board[6][col] = {
      type: PIECES_TYPE.PAWN,
      team: "WHITE",
      image: `/pieces/pawn_w.png`,
    };

    board[7][col] = {
      type: backRow[col],
      team: "WHITE",
      image: `/pieces/${backRow[col]}_w.png`,
    };
  }

  return board;
}

const initMatch: Match = {
  role: null,
  board: createInitBoard(),
  isMoveBoard: Array(8).fill(Array(8).fill(false)),
  teamInTurn: null,
  turnTime: 0,
  increment: 0,
  code: "",
  color: "WHITE",
  domain: "PRIVATE",
  guestName: "",
  hostName: "",
  socket: null,
  winner: null,
  time: {
    guest: null,
    host: null,
  },
  log: {
    guest: [],
    host: [],
  },
  messages: {
    public: [],
    private: [],
  },
};
const ACTIONS = {
  PLACE_PIECE: "PLACE_PIECE",
  CONFIGURE: "CONFIGURE",
  START_GAME: "START_GAME",
  SPECTATE_INIT: "SPECTATE_INIT",
  ADD_MESSAGE: "ADD_MESSAGE",
  UPDATE_TIME: "UPDATE_TIME",
  END: "END",
} as const;
type Action =
  | {
      type: typeof ACTIONS.PLACE_PIECE;
      params: {
        fromX: number;
        fromY: number;
        toX: number;
        toY: number;
      };
    }
  | {
      type: typeof ACTIONS.CONFIGURE;
      params: {
        code: string;
        color: "WHITE" | "BLACK";
        turnTime: number;
        increment: number;
        domain: Domain;
        guestName: string;
        hostName: string;
      };
    }
  | {
      type: typeof ACTIONS.START_GAME;
      params: {
        socket: WebSocket;
        teamInTurn: "GUEST" | "HOST";
        hostName: string;
        guestName: string;
      };
    }
  | {
      type: typeof ACTIONS.SPECTATE_INIT;
      params: {
        socket: WebSocket;
        teamInTurn: "GUEST" | "HOST";
        board: (null | {
          type: PieceType;
          team: "BLACK" | "WHITE";
        })[][];
      };
    }
  | {
      type: typeof ACTIONS.ADD_MESSAGE;
      params: {
        domain: "PUBLIC" | "PRIVATE";
        userName: string;
        message: string;
      };
    }
  | {
      type: typeof ACTIONS.END;
      params: {
        winner: "HOST" | "GUEST";
      };
    }
  | {
      type: typeof ACTIONS.UPDATE_TIME;
      params: {
        host: number;
        guest: number;
      };
    };
function matchReducer(prevState: Match, action: Action): Match {
  switch (action.type) {
    case "PLACE_PIECE": {
      let [fromX, fromY, toX, toY] = [
        action.params.fromX,
        action.params.fromY,
        action.params.toX,
        action.params.toY,
      ];
      let newBoard = [...prevState.board];
      newBoard[action.params.fromX] = [...newBoard[action.params.fromX]];
      newBoard[action.params.toX] = [...newBoard[action.params.toX]];
      newBoard[action.params.toX][action.params.toY] =
        newBoard[action.params.fromX][action.params.fromY];
      newBoard[action.params.fromX][action.params.fromY] = null;

      let newIsMoveBoard = [...prevState.isMoveBoard];
      newIsMoveBoard[fromX] = [...prevState.isMoveBoard[fromX]];
      newIsMoveBoard[fromX][fromY] = true;

      const piece = prevState.board[action.params.fromX][action.params.fromY];

      if (!piece) {
        return prevState;
      }

      let isPromote =
        piece.type === "PAWN" &&
        (action.params.toX === 0 || action.params.toX === 7);
      if (isPromote) {
        newBoard[action.params.toX][action.params.toY] = {
          image: `/pieces/queen_${piece.team === "WHITE" ? "w" : "b"}.png`,
          type: piece.type,
          team: piece.team,
        };
      }

      const newLog = {
        guest: [...prevState.log.guest],
        host: [...prevState.log.host],
      };

      const move = {
        fromX: action.params.fromX,
        fromY: action.params.fromY,
        toX: action.params.toX,
        toY: action.params.toY,
      };

      if (prevState.teamInTurn === "GUEST") {
        newLog.guest.push(move);
      } else {
        newLog.host.push(move);
      }

      const newTeamInTurn = prevState.teamInTurn === "GUEST" ? "HOST" : "GUEST";

      console.log(
        "new host time",
        (prevState.time.host ?? 0) +
          (prevState.teamInTurn === "HOST" ? prevState.increment : 0),
      );
      console.log(
        "new guest time ",
        (prevState.time.guest ?? 0) +
          (prevState.teamInTurn === "GUEST" ? prevState.increment : 0),
      );
      return {
        ...prevState,
        board: newBoard,
        teamInTurn: newTeamInTurn,
        log: newLog,
        isMoveBoard: newIsMoveBoard,
        time: {
          host:
            (prevState.time.host ?? 0) +
            (prevState.teamInTurn === "HOST" ? prevState.increment : 0),
          guest:
            (prevState.time.guest ?? 0) +
            (prevState.teamInTurn === "GUEST" ? prevState.increment : 0),
        },
      };
    }
    case "CONFIGURE": {
      return {
        ...prevState,
        turnTime: action.params.turnTime,
        increment: action.params.increment,
        domain: action.params.domain,
        color: action.params.color,
        code: action.params.code,
        guestName: action.params.guestName,
        hostName: action.params.hostName,
      };
    }
    case "START_GAME": {
      return {
        ...prevState,
        socket: action.params.socket,
        teamInTurn: action.params.teamInTurn,
        role: "PLAYER",
        time: {
          host: prevState.turnTime,
          guest: prevState.turnTime,
        },
        hostName: action.params.hostName,
        guestName: action.params.guestName,
      };
    }
    case "SPECTATE_INIT": {
      const res = action.params.board.map(
        (row: ({ type: PieceType; team: "BLACK" | "WHITE" } | null)[]) => {
          return row.map((element) => {
            if (!element) return null;

            let ref = "";

            switch (element.type) {
              case "PAWN":
                ref = "/pieces/pawn";
                break;
              case "ROOK":
                ref = "/pieces/rook";
                break;
              case "KNIGHT":
                ref = "/pieces/knight";
                break;
              case "BISHOP":
                ref = "/pieces/bishop";
                break;
              case "QUEEN":
                ref = "/pieces/queen";
                break;
              case "KING":
                ref = "/pieces/king";
                break;
              default:
                ref = "";
            }

            if (element.team === "BLACK") {
              ref += "_b.png";
            } else if (element.team === "WHITE") {
              ref += "_w.png";
            } else {
              console.warn("received weird piece team");
            }

            return {
              type: element.type,
              team: element.team,
              image: ref,
            };
          });
        },
      );
      console.log("NEW BOARD ", res);
      return {
        ...prevState,
        socket: action.params.socket,
        teamInTurn: action.params.teamInTurn,
        board: res,
        time: {
          host: prevState.turnTime,
          guest: prevState.turnTime,
        },
        role: "SPECTATOR",
      };
    }
    case "ADD_MESSAGE": {
      let messages: null | { private: Message[]; public: Message[] } = null;
      if (action.params.domain === "PRIVATE") {
        messages = {
          public: prevState.messages.public,
          private: [
            ...prevState.messages.private,
            {
              userName: action.params.userName,
              message: action.params.message,
            },
          ],
        };
      } else {
        messages = {
          private: prevState.messages.private,
          public: [
            ...prevState.messages.public,
            {
              userName: action.params.userName,
              message: action.params.message,
            },
          ],
        };
      }
      return {
        ...prevState,
        messages: messages,
      };
    }
    case "UPDATE_TIME": {
      return {
        ...prevState,
        time: {
          host: action.params.host,
          guest: action.params.guest,
        },
      };
    }
    case "END": {
      return {
        ...prevState,
        winner: action.params.winner,
      };
    }
    default:
      break;
  }

  return prevState;
}

type MatchContext = {
  value: Match;
  dispatch: React.ActionDispatch<[Action]>;
};

const MatchContext = createContext<MatchContext | null>(null);

export const MatchContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [match, dispatchMatch] = useReducer(matchReducer, initMatch);

  return (
    <MatchContext.Provider value={{ value: match, dispatch: dispatchMatch }}>
      {children}
    </MatchContext.Provider>
  );
};

export function useMatchContext() {
  let match = useContext(MatchContext);

  if (!match)
    throw "match data context cannot yet be used while value is 'null'";

  return match;
}
