import { UserProps } from "@/shared/types/types";
import { useMutation } from "@tanstack/react-query";
import { useUserDataContext } from "@/shared/contexts/UserData";
import { MatchApi, UserApi } from "../../api";
import { useMatchContext } from "@/shared/contexts/Match";
import { Domain, PieceColor } from "@/shared/constants/types";
import { RECONNECT_RETRY_COUNT, WS_URI } from "@/shared/config";
import { useRefreshUser } from "../user/useRefreshToken";

const matchApi = new MatchApi();
const userApi = new UserApi();

export function useReadyMatch() {
  const match = useMatchContext();
  const userData = useUserDataContext();
  return useMutation({
    mutationFn: async (payload: {
      code: string;
      guestName: string;
      hostName: string;
      accessToken: string;
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

      const connectSocket = (retries: number) => {
        if (!retries) return null;

        console.log("reconnect");

        const socket = new WebSocket(WS_URI);

        socket.onmessage = (event) => {
          const message = JSON.parse(event.data);

          switch (message.type) {
            case "MOVE_PIECE": {
              const { fromX, fromY, toX, toY } = message;

              const piece = match.value.board[fromX][fromY];

              const isCastling =
                piece?.type === "KING" && Math.abs(toY - fromY) === 2;

              const movements = [];

              if (isCastling) {
                if (fromY - toY > 0) {
                  movements.push({
                    fromX,
                    fromY: 0,
                    toX: fromX,
                    toY: fromY - 1,
                  });
                } else {
                  movements.push({
                    fromX,
                    fromY: 7,
                    toX: fromX,
                    toY: fromY + 1,
                  });
                }
              }

              movements.push({
                fromX,
                fromY,
                toX,
                toY,
              });

              match.dispatch({
                type: "PLACE_PIECES",
                params: {
                  movements,
                },
              });

              break;
            }

            case "MESSAGE":
              if (message.from === userData.value.userName) break;

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
              accessToken: userData.value.accessToken,
            }),
          );
        };

        socket.onclose = async () => {
          console.log("socket closed");

          if (!match.value.winner) {
            try {
              let retry = 3;
              let result = null;
              while (retry) {
                try {
                  result = await matchApi.reconnectMatch({
                    accessToken: userData.value.accessToken,
                  });
                } catch (e) {
                  console.log("CRASH", e);
                  const errorTypeGuard =
                    e && typeof e === "object" && "status" in e;
                  if (errorTypeGuard && e.status === 401) {
                    let retry = 1;
                    let result = null;
                    while (retry) {
                      result = await userApi.refreshToken();

                      if (result) break;

                      retry--;
                    }
                    if (!result) {
                      userData.set({
                        userName: "",
                        name: "",
                        accessToken: "",
                      });
                      return;
                    }
                    userData.set({
                      ...userData.value,
                      accessToken: result.accessToken,
                    });
                  }
                }

                if (result) break;

                retry--;
              }
              if (!result) return;

              console.log("fetched ", result);

              match.dispatch({
                type: "RESYNC",
                params: {
                  board: result.board,
                  guestTime: result.guestTime,
                  hostTime: result.hostTime,
                  teamInTurn: result.playerInTurn,
                },
              });

              const res = connectSocket(retries - 1);

              if (res)
                match.dispatch({
                  type: "SET_SOCKET",
                  params: {
                    socket: res,
                  },
                });
              console.log("socket", res);
            } catch (e: unknown) {
              console.log("CRASHS ", e);
            }
          }
        };

        socket.onerror = () => {
          socket.close();
        };

        return socket;
      };

      const socket = connectSocket(RECONNECT_RETRY_COUNT);
      if (socket) {
        match.dispatch({
          type: "START_GAME",
          params: {
            socket,
            teamInTurn: data.playerInTurn,
            hostName: data.hostName,
            guestName: data.guestName,
          },
        });
      }
    },
    onError: async (error: any) => {
      const status = error?.response?.status;

      if (status === 401) {
        const useRefresh = await useRefreshUser();
        await useRefresh.mutateAsync();

        return;
      }
    },
  });
}
