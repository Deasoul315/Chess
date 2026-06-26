import { UserProps } from "@/shared/types/types";
import { useMutation } from "@tanstack/react-query";
import { useUserDataContext } from "@/shared/contexts/UserData";
import { MatchApi } from "../../api";
import { useMatchContext } from "@/shared/contexts/Match";
import { Domain, PieceColor } from "@/shared/constants/types";
import { WS_URI } from "@/shared/config";

const matchApi = new MatchApi();

export function useReadyMatch() {
  const match = useMatchContext();
  return useMutation({
    mutationFn: async (payload: {
      code: string;
      guestName: string;
      hostName: string;
      userName: string;
      color: PieceColor;
      domain: Domain;
      increment: number;
      turnTime: number;
      isReady: boolean;
    }) => await matchApi.readyMatch(payload),
    onSuccess: (data, variables) => {
      const { userName, hostName } = variables;

      if (userName !== hostName) return;
      const socket = new WebSocket(WS_URI);

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        switch (message.type) {
          case "MOVE_PIECE":
            const { fromX, fromY, toX, toY } = message;

            const piece = match.value.board[fromX][fromY];

            const isCastling =
              piece?.type === "KING" && Math.abs(toY - fromY) === 2;

            const movements = [];
            if (isCastling) {
              // Queenside castling
              if (fromY - toY > 0) {
                movements.push({
                  fromX,
                  fromY: 0,
                  toX: fromX,
                  toY: fromY - 1,
                });
              }
              // Kingside castling
              else {
                movements.push({
                  fromX,
                  fromY: 7,
                  toX: fromX,
                  toY: fromY + 1,
                });
              }
            }
            movements.push({
              fromX: message.fromX,
              fromY: message.fromY,
              toX: message.toX,
              toY: message.toY,
            });
            match.dispatch({
              type: "PLACE_PIECES",
              params: {
                movements: movements,
              },
            });
            break;
          case "MESSAGE":
            match.dispatch({
              type: "ADD_MESSAGE",
              params: {
                userName: message.from,
                message: message.message,
                domain: message.domain,
              },
            });
            break;
          case "END":
            match.dispatch({
              type: "END",
              params: {
                winner: message.winner,
              },
            });
            break;
          default:
            console.warn("Unknown message:", message);
        }
      };

      socket.onopen = () => {
        socket.send(
          JSON.stringify({
            type: "INIT",
            userType: "PLAYER",
            userName: userName,
          }),
        );
      };

      match.dispatch({
        type: "START_GAME",
        params: {
          socket: socket,
          teamInTurn: data.playerInTurn,
          hostName: data.hostName,
          guestName: data.guestName,
        },
      });
    },
  });
}
