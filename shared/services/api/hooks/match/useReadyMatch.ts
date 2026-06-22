import { UserProps } from "@/shared/types/types";
import { useMutation } from "@tanstack/react-query";
import { useUserDataContext } from "@/shared/contexts/UserData";
import { MatchApi } from "../../api";
import { useMatchContext } from "@/shared/contexts/Match";
import { Domain, PieceColor } from "@/shared/constants/types";

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
      console.log("esablishing socket");
      const socket = new WebSocket("ws://localhost:8080");

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log("message received ", message);
        switch (message.type) {
          case "MOVE_PIECE":
            const { fromX, fromY, toX, toY } = message;

            const piece = match.value.board[fromX][fromY];

            const isCastling =
              piece?.type === "KING" && Math.abs(toY - fromY) === 2;

            if (isCastling) {
              // Queenside castling
              if (fromY - toY > 0) {
                match.dispatch({
                  type: "PLACE_PIECE",
                  params: {
                    fromX,
                    fromY: 0,
                    toX: fromX,
                    toY: fromY - 1,
                  },
                });
              }
              // Kingside castling
              else {
                match.dispatch({
                  type: "PLACE_PIECE",
                  params: {
                    fromX,
                    fromY: 7,
                    toX: fromX,
                    toY: fromY + 1,
                  },
                });
              }
            }
            match.dispatch({
              type: "PLACE_PIECE",
              params: {
                fromX: message.fromX,
                fromY: message.fromY,
                toX: message.toX,
                toY: message.toY,
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
