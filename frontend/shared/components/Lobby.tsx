"use client";

import React, { useEffect, useState } from "react";
import {
  ActionIcon,
  Box,
  Button,
  ButtonGroup,
  Center,
  Flex,
  Grid,
  Group,
  LoadingOverlay,
  Modal,
  Overlay,
  Paper,
  ScrollArea,
  Slider,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { ArrowLeftIcon, CheckIcon, XIcon } from "@phosphor-icons/react";
import Board from "./Board";
import { createInitBoard, useMatchContext } from "../contexts/Match";
import { useCreateMatch } from "../services/api/hooks/match/useCreateMatch";
import { useUserDataContext } from "../contexts/UserData";
import { Domain, PieceColor } from "../constants/types";
import { useJoinMatch } from "../services/api/hooks/match/useJoinMatch";
import { match } from "assert";
import { useReadyMatch } from "../services/api/hooks/match/useReadyMatch";
import useGetRoom from "../services/api/hooks/match/useGetRoom";
import { useSpecateMatch } from "../services/api/hooks/match/useSpectateMatch";
import useGetRandomRoom from "../services/api/hooks/match/useGetRandomRoom";
import { useDisclosure } from "@mantine/hooks";
import Logger from "./Logger";
import { useConfigMatch } from "../services/api/hooks/match/useConfigMatch";
import Chat from "./Chat";
import { useReconnectMatch } from "../services/api/hooks/match/useReconnectMatch";
import Timer from "./Timer";
import { useSearchParams } from "next/navigation";
import { RECONNECT_RETRY_COUNT, WS_URI } from "../config";
import { useQueryClient } from "@tanstack/react-query";
import { useRefreshUser } from "../services/api/hooks/user/useRefreshToken";

type LobbyView =
  | "home"
  | "create-room"
  | "join-room"
  | "matchmaking"
  | "spectate";

type Configuration = {
  color: PieceColor;
  domain: Domain;
  increment: number;
  turnTime: number;
};
interface HomeProps {
  onNavigate: (view: LobbyView) => void;
}

function LobbyHome({ onNavigate }: HomeProps) {
  const user = useUserDataContext();
  const [error, setError] = useState<null | "JOIN" | "CREATE">(null);
  return (
    <Stack>
      <Button
        onClick={() => {
          if (user.value.userName === "") {
            setError("CREATE");
            return;
          }
          onNavigate("create-room");
        }}
        color="primary"
        size="lg"
      >
        Create Room
      </Button>
      {error === "CREATE" && (
        <Text c={"red"}>You Must Log In first before creating Room</Text>
      )}
      <Button
        onClick={() => {
          if (user.value.userName === "") {
            setError("JOIN");
            return;
          }
          onNavigate("join-room");
        }}
        color="primary"
        size="lg"
      >
        Join Room
      </Button>
      {error === "JOIN" && (
        <Text c={"red"}>You Must Log In first before joining Room</Text>
      )}
      <Button
        onClick={() => onNavigate("matchmaking")}
        color="primary"
        size="lg"
      >
        Random Match Up
      </Button>

      <Button onClick={() => onNavigate("spectate")} color="primary" size="lg">
        Spectate
      </Button>
    </Stack>
  );
}

function Room({
  setIsGameStart,
}: {
  setIsGameStart: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const titleWidth = "70px";
  const [isConfigure, setIsConfigure] = useState(false);
  const match = useMatchContext();
  const [configuration, setConfiguration] = useState<Configuration>({
    turnTime: match.value.turnTime ? match.value.turnTime : 5 * 60 * 1000,
    increment: match.value.increment ? match.value.increment : 3 * 1000,
    domain: match.value.domain ? match.value.domain : "PUBLIC",
    color: match.value.color ? match.value.color : "WHITE",
  });
  const userData = useUserDataContext();
  const mutation = useCreateMatch();
  const readyMutation = useReadyMatch();
  const configMutation = useConfigMatch();
  const uer = useUserDataContext();
  const useRefresh = useRefreshUser();

  const pollPlayers = useGetRoom({
    code: match.value.code,
    accessToken: userData.value.accessToken,
  });

  useEffect(() => {
    if (!readyMutation.isSuccess) return;

    setIsGameStart(true);
  }, [readyMutation.isSuccess]);

  useEffect(() => {
    if (!configMutation.isSuccess) return;
    setIsConfigure(false);
  }, [configMutation.isSuccess]);

  useEffect(() => {
    const params = {
      ...configuration,
      userName: userData.value.userName,
      accessToken: userData.value.accessToken,
    };
    mutation.mutate(params);
  }, []);

  useEffect(() => {
    if (!pollPlayers.isError) return;

    const error = pollPlayers.error;

    if (error && typeof error === "object" && "status" in error) {
      const status = error.status;

      if (status === 401) {
        useRefresh.mutate();
        return;
      }
    }
  }, [pollPlayers.isError]);
  return (
    <>
      <Stack>
        {!isConfigure && (
          <Stack>
            <Title order={4}>Room</Title>
            <Button
              onClick={() => setIsConfigure(true)}
              color="var(--secondary)"
              size="lg"
            >
              Configure
            </Button>
            <Flex align={"center"} justify={"space-between"}>
              <Title order={5} w={titleWidth}>
                Code:
              </Title>
              <Text size="lg" className="grow flex justify-center">
                {mutation.isPending
                  ? "Loading..."
                  : mutation.isSuccess
                    ? match.value.code
                    : "Error getting code"}
              </Text>
            </Flex>

            <Stack>
              <Title order={5} w={titleWidth} size="lg">
                Players:
              </Title>
              <ScrollArea h={90} bg={"var(--secondary)"}>
                {pollPlayers.isSuccess && (
                  <Stack align="center">
                    <Group>
                      <Text size="lg">{pollPlayers.data.host}</Text>
                      {pollPlayers.data.host &&
                        (pollPlayers.data.readyUsers.find(
                          (element) => pollPlayers.data.host === element,
                        ) ? (
                          <CheckIcon></CheckIcon>
                        ) : (
                          <XIcon></XIcon>
                        ))}
                    </Group>
                    <Group>
                      <Text size="lg">{pollPlayers.data.guest}</Text>
                      {pollPlayers.data.guest &&
                        (pollPlayers.data.readyUsers.find(
                          (element) => pollPlayers.data.guest === element,
                        ) ? (
                          <CheckIcon></CheckIcon>
                        ) : (
                          <XIcon></XIcon>
                        ))}
                    </Group>
                  </Stack>
                )}
              </ScrollArea>
            </Stack>

            <Button
              onClick={() => {
                readyMutation.mutate({
                  accessToken: userData.value.accessToken,
                  code: match.value.code,
                  userName: userData.value.userName,
                  guestName: match.value.guestName,
                  hostName: match.value.hostName,
                  color: match.value.color,
                  domain: "PRIVATE",
                  increment: 3,
                  turnTime: 1,
                  isReady: true,
                });
              }}
              disabled={match.value.code === ""}
              color="var(--primary)"
              size="lg"
            >
              Challenge On!
            </Button>
            <Text size="md" c="red">
              {readyMutation.isError ? "Users must be ready first" : ""}
            </Text>
          </Stack>
        )}
        {isConfigure && (
          <Stack>
            <ConfigureRoom
              configuration={configuration}
              setConfiguration={setConfiguration}
            ></ConfigureRoom>
            <Button
              onClick={() => {
                configMutation.mutate({
                  accessToken: userData.value.accessToken,
                  ...configuration,
                });
              }}
              color="var(--primary)"
              size="lg"
            >
              Save
            </Button>
          </Stack>
        )}
      </Stack>
    </>
  );
}

function ConfigureRoom({
  configuration,
  setConfiguration,
}: {
  configuration: Configuration;
  setConfiguration: React.Dispatch<React.SetStateAction<Configuration>>;
}) {
  const [toggle, setToggle] = useState(true);
  const [toggleColor, setToggleColor] = useState(true);
  //   const [showRoom, ];
  const timeMarks = [
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 10, label: "10" },
    { value: 30, label: "30" },
  ];
  const titleWidth = "100px";

  return (
    <Stack>
      <Title order={4}>Configure Room</Title>
      <Stack>
        {/* domain */}
        <Flex align={"center"} gap={"10"}>
          <Title order={5} w={titleWidth}>
            Domain
          </Title>
          <Button
            className="grow"
            disabled={configuration.domain === "PUBLIC"}
            onClick={() =>
              setConfiguration({ ...configuration, domain: "PUBLIC" })
            }
            color="var(--secondary)"
            size="lg"
          >
            Public
          </Button>
          <Button
            className="grow"
            disabled={configuration.domain === "PRIVATE"}
            onClick={() =>
              setConfiguration({ ...configuration, domain: "PRIVATE" })
            }
            color="var(--secondary)"
            size="lg"
          >
            Private
          </Button>
        </Flex>
        <Flex align={"center"} gap={"10"}>
          <Title order={5} w={titleWidth}>
            Time
          </Title>
          <Slider
            className="grow"
            defaultValue={configuration.turnTime / (1000 * 60)}
            label={(val) => val}
            // step={30} need dynamic stepping
            color="var(--secondary)"
            min={1}
            max={30}
            marks={timeMarks}
            styles={{ markLabel: { display: "none" } }}
            onChangeEnd={(value) =>
              setConfiguration({
                ...configuration,
                turnTime: value * 1000 * 60,
              })
            }
          />
        </Flex>
        <Flex align={"center"} gap={"10"}>
          <Title order={5} w={titleWidth}>
            Increment
          </Title>
          <Slider
            className="grow"
            color="var(--secondary)"
            size="sm"
            defaultValue={configuration.increment / 1000}
            min={1}
            max={30}
            onChangeEnd={(value) =>
              setConfiguration({ ...configuration, increment: value * 1000 })
            }
          />
        </Flex>
        <Flex align={"center"} gap={"10"}>
          <Title order={5} w={titleWidth}>
            Color
          </Title>
          <Button
            className="grow"
            disabled={configuration.color === "WHITE"}
            onClick={() =>
              setConfiguration({ ...configuration, color: "WHITE" })
            }
            color="var(--secondary)"
            size="lg"
          >
            White
          </Button>
          <Button
            className="grow"
            disabled={configuration.color === "BLACK"}
            onClick={() =>
              setConfiguration({ ...configuration, color: "BLACK" })
            }
            color="var(--secondary)"
            size="lg"
          >
            Black
          </Button>
        </Flex>
        {/* room */}
      </Stack>
    </Stack>
  );
}

function JoinRoom({
  setIsGameStart,
}: {
  setIsGameStart: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const titleWidth = "70px";
  const mutation = useJoinMatch();
  const user = useUserDataContext();
  const [error, setError] = useState<null | string>(null);
  const match = useMatchContext();
  const pollPlayers = useGetRoom({
    code: match.value.code,
    accessToken: user.value.accessToken,
  });
  const useRefresh = useRefreshUser();
  const readyMutation = useReadyMatch();
  const [isReady, setIsReady] = useState(false);
  const useReconnect = useReconnectMatch({
    accessToken: user.value.accessToken,
  });

  useEffect(() => {
    if (!pollPlayers.isSuccess || pollPlayers.data.state !== "READY") return;
    setIsGameStart(true);
    if (match.value.socket) return;
    const connectSocket = (retries: number) => {
      if (!retries) return null;
      console.log("reconnect");

      const socket = new WebSocket(WS_URI);

      socket.onopen = () => {
        console.log("connected");

        socket.send(
          JSON.stringify({
            type: "INIT",
            userType: "PLAYER",
            accessToken: user.value.accessToken,
          }),
        );
      };

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case "END":
            match.dispatch({
              type: "END",
              params: {
                winner: message.winner,
              },
            });
            break;

          case "MOVE_PIECE": {
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
                movements,
              },
            });

            break;
          }

          case "MESSAGE": {
            if (message.from === user.value.userName) break;
            match.dispatch({
              type: "ADD_MESSAGE",
              params: {
                userName: message.from,
                message: message.message,
                domain: message.domain,
              },
            });

            break;
          }
        }
      };

      socket.onclose = async () => {
        if (!match.value.winner) {
          let retry = 3;
          let result = null;
          while (retry) {
            result = await useReconnect.refetch();

            if (result.data) break;
            const err = result.error;
            const errorTypeGuard =
              err && typeof err === "object" && "status" in err;
            if (errorTypeGuard && err.status === 401) {
              let retry = 1;
              let refresh: any = null;
              while (retry) {
                try {
                  refresh = await useRefresh.mutateAsync();
                } catch {}

                if (refresh) break;

                retry--;
              }
              if (!refresh) {
                user.set({
                  userName: "",
                  name: "",
                  accessToken: "",
                });
                return;
              }
              user.set({
                ...user.value,
                accessToken: refresh.accessToken as any,
              });
            }

            retry--;
          }
          if (!result) return;
          if (!result.data) return;

          match.dispatch({
            type: "RESYNC",
            params: {
              board: result.data.board,
              guestTime: result.data.guestTime,
              hostTime: result.data.hostTime,
              teamInTurn: result.data.playerInTurn,
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
        }
      };

      socket.onerror = () => {
        socket.close();
      };

      return socket;
    };

    const socket = connectSocket(RECONNECT_RETRY_COUNT);
    if (!socket) return;
    match.dispatch({
      type: "CONFIGURE",
      params: {
        code: pollPlayers.data.code,
        color: pollPlayers.data.color,
        domain: pollPlayers.data.domain,
        increment: pollPlayers.data.increment,
        turnTime: pollPlayers.data.turnTime,
        guestName: match.value.guestName,
        hostName: pollPlayers.data.host,
      },
    });

    match.dispatch({
      type: "START_GAME",
      params: {
        socket: socket,
        teamInTurn: pollPlayers.data.playerInTurn,
        hostName: pollPlayers.data.host,
        guestName: pollPlayers.data.guest ?? "Name",
      },
    });
  }, [pollPlayers.isSuccess, pollPlayers.data]);

  useEffect(() => {
    if (!readyMutation.isSuccess) return;
    setIsReady(readyMutation.data.isReady);
  }, [readyMutation.isSuccess]);

  useEffect(() => {
    if (!pollPlayers.isError) return;

    const error = pollPlayers.error;

    if (error && typeof error === "object" && "status" in error) {
      const status = error.status;

      if (status === 401) {
        useRefresh.mutate();
        return;
      }
    }
  }, [pollPlayers.isError]);
  return (
    <Stack>
      {!mutation.isSuccess && (
        <Stack>
          <form
            onSubmit={(e: React.SubmitEvent<HTMLFormElement>) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const code = formData.get("code");
              if (typeof code !== "string") {
                setError("type of field not string");
                return;
              }
              if (!code) {
                setError("Empty code field");
                return;
              }
              mutation.mutate({
                accessToken: user.value.accessToken,
                code: code,
              });
            }}
          >
            <Stack gap={"xs"}>
              <Title order={4}>Join Room</Title>
              <Flex align={"center"} gap={"10"}>
                <Title order={5} w={titleWidth}>
                  Code
                </Title>
                <TextInput name="code" size="lg"></TextInput>
              </Flex>
              {error && <Text c={"red"}>{error}</Text>}
              <Button type="submit" color="var(--primary)" size="lg">
                Join
              </Button>
            </Stack>
          </form>
        </Stack>
      )}
      {mutation.isSuccess && (
        <Stack>
          <Title order={4}>Room</Title>
          <Flex align={"center"} justify={"space-between"}>
            <Title order={5} w={titleWidth}>
              Code:
            </Title>
            <Text size="lg" className="grow flex justify-center">
              {match.value.code}
            </Text>
          </Flex>

          <Stack>
            <Title order={5} w={titleWidth}>
              Players:
            </Title>
            <ScrollArea h={90} bg={"var(--secondary)"}>
              {pollPlayers.isSuccess && (
                <Stack align="center">
                  <Group>
                    <Text size="lg">{pollPlayers.data.host}</Text>
                    {pollPlayers.data.host &&
                      (pollPlayers.data.readyUsers.find(
                        (element) => pollPlayers.data.host === element,
                      ) ? (
                        <CheckIcon></CheckIcon>
                      ) : (
                        <XIcon></XIcon>
                      ))}
                  </Group>
                  <Group>
                    <Text size="lg">{pollPlayers.data.guest}</Text>
                    {pollPlayers.data.guest &&
                      (pollPlayers.data.readyUsers.find(
                        (element) => pollPlayers.data.guest === element,
                      ) ? (
                        <CheckIcon></CheckIcon>
                      ) : (
                        <XIcon></XIcon>
                      ))}
                  </Group>
                </Stack>
              )}
            </ScrollArea>
          </Stack>
          <Button
            onClick={() => {
              readyMutation.mutate({
                accessToken: user.value.accessToken,
                code: match.value.code,
                userName: user.value.userName,
                guestName: user.value.userName,
                hostName: match.value.hostName,
                color: "BLACK",
                domain: "PRIVATE",
                increment: 3,
                turnTime: 1,
                isReady: !isReady,
              });
            }}
            color="var(--primary)"
            size="lg"
          >
            {isReady ? "Hold on!" : "Ready!"}
          </Button>
          {mutation.isError && <Text c={"red"}>Failed to Set Ready</Text>}
        </Stack>
      )}
    </Stack>
  );
}

function Matchmaking({
  setIsGameStart,
}: {
  setIsGameStart: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [visible, { toggle }] = useDisclosure(true);
  const userData = useUserDataContext();
  const useRefresh = useRefreshUser();
  const randomQuery = useGetRandomRoom({
    userName: userData.value.userName,
    accessToken: userData.value.accessToken,
  });
  const match = useMatchContext();
  const useReconnect = useReconnectMatch({
    accessToken: userData.value.accessToken,
  });
  useEffect(() => {
    if (!randomQuery.data) return;

    setIsGameStart(true);
    function reconnect(retries: number) {
      if (!retries) return;
      console.log("reconnect");

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
        if (!match.value.winner) {
          let retry = 3;
          let result = null;
          while (retry) {
            result = await useReconnect.refetch();

            if (result.data) break;
            const err = result.error;
            const errorTypeGuard =
              err && typeof err === "object" && "status" in err;
            if (errorTypeGuard && err.status === 401) {
              let retry = 1;
              let refresh: any = null;
              while (retry) {
                try {
                  refresh = await useRefresh.mutateAsync();
                } catch {}

                if (refresh) break;

                retry--;
              }
              if (!refresh) {
                userData.set({
                  userName: "",
                  name: "",
                  accessToken: "",
                });
                return;
              }
              userData.set({
                ...userData.value,
                accessToken: refresh.accessToken as any,
              });
            }

            retry--;
          }
          if (!result) return;

          if (!result.data) return;

          match.dispatch({
            type: "RESYNC",
            params: {
              board: result.data.board,
              guestTime: result.data.guestTime,
              hostTime: result.data.hostTime,
              teamInTurn: result.data.playerInTurn,
            },
          });

          const res = reconnect(retries - 1);

          if (res)
            match.dispatch({
              type: "SET_SOCKET",
              params: {
                socket: res,
              },
            });
        }
      };
      socket.onerror = () => {
        socket.close();
      };

      return socket;
    }

    const socket = reconnect(RECONNECT_RETRY_COUNT);

    if (!socket) return;

    match.dispatch({
      type: "CONFIGURE",
      params: {
        code: randomQuery.data.code,
        color: randomQuery.data.color,
        domain: randomQuery.data.domain,
        increment: randomQuery.data.increment,
        turnTime: randomQuery.data.turnTime,
        guestName: match.value.guestName,
        hostName: randomQuery.data.hostName,
      },
    });

    match.dispatch({
      type: "START_GAME",
      params: {
        socket,
        teamInTurn: randomQuery.data.playerInTurn,
        hostName: randomQuery.data.hostName,
        guestName: randomQuery.data.guestName ?? "",
      },
    });
  }, [randomQuery.data]);

  useEffect(() => {
    if (!randomQuery.isError) return;

    const error = randomQuery.error;

    if (error && typeof error === "object" && "status" in error) {
      const status = error.status;

      if (status === 401) {
        useRefresh.mutate();
        return;
      }
    }
  }, [randomQuery.isError]);

  return (
    <Stack pos={"relative"} h={100}>
      <Title order={4}>Random Match Up</Title>
      <LoadingOverlay
        visible={visible}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
        loaderProps={{
          color: "var(--secondary)",
        }}
      />
    </Stack>
  );
}

function Spectate({
  setIsGameStart,
}: {
  setIsGameStart: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const match = useMatchContext();
  const userData = useUserDataContext();
  const spectateQuery = useSpecateMatch(userData.value.userName, {
    code: code,
    accessToken: userData.value.accessToken,
  });
  const titleWidth = "70px";
  const useRefresh = useRefreshUser();
  const useReconnect = useReconnectMatch({
    accessToken: userData.value.accessToken,
  });

  useEffect(() => {
    if (!spectateQuery.isSuccess) return;

    setIsGameStart(true);
    function reconnect(retries: number) {
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
              // Queenside
              if (fromY - toY > 0) {
                movements.push({
                  fromX,
                  fromY: 0,
                  toX: fromX,
                  toY: fromY - 1,
                });
              }
              // Kingside
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
            userType: "SPECTATOR",
            accessToken: userData.value.accessToken,
          }),
        );
      };

      socket.onclose = async () => {
        if (!match.value.winner) {
          let retry = 3;
          let result = null;
          while (retry) {
            result = await useReconnect.refetch();

            if (result.data) break;
            const err = result.error;
            const errorTypeGuard =
              err && typeof err === "object" && "status" in err;
            if (errorTypeGuard && err.status === 401) {
              let retry = 1;
              let refresh: any = null;
              while (retry) {
                try {
                  refresh = await useRefresh.mutateAsync();
                } catch {}

                if (refresh) break;

                retry--;
              }
              if (!refresh) {
                userData.set({
                  userName: "",
                  name: "",
                  accessToken: "",
                });
                return;
              }
              userData.set({
                ...userData.value,
                accessToken: refresh.accessToken as any,
              });
            }
            retry--;
          }
          if (!result) return;

          if (!result.data) return;

          match.dispatch({
            type: "RESYNC",
            params: {
              board: result.data.board,
              guestTime: result.data.guestTime,
              hostTime: result.data.hostTime,
              teamInTurn: result.data.playerInTurn,
            },
          });

          const res = reconnect(retries - 1);

          if (res)
            match.dispatch({
              type: "SET_SOCKET",
              params: {
                socket: res,
              },
            });
        }
      };

      socket.onerror = () => {
        socket.close();
      };
      return socket;
    }

    const socket = reconnect(RECONNECT_RETRY_COUNT);

    if (!socket) return;

    match.dispatch({
      type: "CONFIGURE",
      params: {
        code: spectateQuery.data.code,
        color: spectateQuery.data.color,
        domain: spectateQuery.data.domain,
        increment: spectateQuery.data.increment,
        turnTime: spectateQuery.data.turnTime,
        guestName: spectateQuery.data.guest,
        hostName: spectateQuery.data.host,
      },
    });

    match.dispatch({
      type: "SPECTATE_INIT",
      params: {
        socket,
        teamInTurn: spectateQuery.data.playerInTurn,
        board: spectateQuery.data.board,
      },
    });
  }, [spectateQuery.isSuccess]);
  useEffect(() => {
    if (!spectateQuery.isError) return;

    const error = spectateQuery.error;

    if (error && typeof error === "object" && "status" in error) {
      const status = error.status;

      if (status === 401) {
        useRefresh.mutate();
        return;
      }
    }
  }, [spectateQuery.isError]);

  return (
    <Stack>
      <form
        onSubmit={(e: React.SubmitEvent<HTMLFormElement>) => {
          e.preventDefault();

          const formData = new FormData(e.currentTarget);
          const code = formData.get("code");

          if (typeof code !== "string") {
            setError("type of field not string");
            return;
          }
          if (!code) {
            setError("Empty code field");
            return;
          }
          setCode(code);
        }}
      >
        <Stack gap={"xs"}>
          <Title order={4}>Join Room</Title>
          <Flex align={"center"} gap={"10"}>
            <Title order={5} w={titleWidth}>
              Code
            </Title>
            <TextInput name="code" size="lg"></TextInput>
          </Flex>
          {error && (
            <Text size="lg" c={"red"}>
              {error}
            </Text>
          )}
          <Button type="submit" bg="var(--primary)" size="lg">
            Join
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}

export default function Lobby() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  const [view, setView] = useState<LobbyView>("home");
  const showBackButton = view !== "home";
  const [isGameStart, setIsGameStart] = useState(false);
  const match = useMatchContext();
  const user = useUserDataContext();
  const useReconnectQuery = useReconnectMatch({
    accessToken: user.value.accessToken,
  });
  const spectateQuery = useSpecateMatch(user.value.userName, {
    code: code ? code : "",
    accessToken: user.value.accessToken,
  });
  const queryClient = useQueryClient();
  const useRefresh = useRefreshUser();
  // useEffect(() => {
  //   window.Match = match;
  // });

  useEffect(() => {
    if (!spectateQuery.isSuccess) return;

    setIsGameStart(true);
    function reconnect(retries: number) {
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
              // Queenside
              if (fromY - toY > 0) {
                movements.push({
                  fromX,
                  fromY: 0,
                  toX: fromX,
                  toY: fromY - 1,
                });
              }
              // Kingside
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
                movements,
              },
            });

            break;
          }

          case "MESSAGE":
            if (message.from === user.value.userName) break;

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
            userType: "SPECTATOR",
            accessToken: user.value.accessToken,
          }),
        );
      };

      socket.onclose = async () => {
        if (!match.value.winner) {
          let retry = 3;
          let result = null;
          while (retry) {
            result = await useReconnectQuery.refetch();

            if (result.data) break;
            const err = result.error;
            const errorTypeGuard =
              err && typeof err === "object" && "status" in err;
            if (errorTypeGuard && err.status === 401) {
              let retry = 1;
              let refresh: any = null;
              while (retry) {
                try {
                  refresh = await useRefresh.mutateAsync();
                } catch {}

                if (refresh) break;

                retry--;
              }
              if (!refresh) {
                user.set({
                  userName: "",
                  name: "",
                  accessToken: "",
                });
                return;
              }
              user.set({
                ...user.value,
                accessToken: refresh.accessToken as any,
              });
            }
            retry--;
          }
          if (!result) return;

          if (!result.data) return;

          match.dispatch({
            type: "RESYNC",
            params: {
              board: result.data.board,
              guestTime: result.data.guestTime,
              hostTime: result.data.hostTime,
              teamInTurn: result.data.playerInTurn,
            },
          });

          const res = reconnect(retries - 1);

          if (res)
            match.dispatch({
              type: "SET_SOCKET",
              params: {
                socket: res,
              },
            });
        }
      };

      socket.onerror = () => {
        socket.close();
      };
      return socket;
    }

    const socket = reconnect(RECONNECT_RETRY_COUNT);

    if (!socket) return;

    match.dispatch({
      type: "CONFIGURE",
      params: {
        code: spectateQuery.data.code,
        color: spectateQuery.data.color,
        domain: spectateQuery.data.domain,
        increment: spectateQuery.data.increment,
        turnTime: spectateQuery.data.turnTime,
        guestName: spectateQuery.data.guest,
        hostName: spectateQuery.data.host,
      },
    });

    match.dispatch({
      type: "SPECTATE_INIT",
      params: {
        socket,
        teamInTurn: spectateQuery.data.playerInTurn,
        board: spectateQuery.data.board,
      },
    });
  }, [spectateQuery.isSuccess]);

  useEffect(() => {
    if (!useReconnectQuery.isSuccess) return;

    setIsGameStart(true);

    const connectSocket = (retries: number) => {
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
            if (message.from === user.value.userName) break;

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
            accessToken: user.value.accessToken,
          }),
        );
      };

      socket.onclose = async () => {
        if (!match.value.winner) {
          let retry = 3;
          let result = null;
          while (retry) {
            result = await useReconnectQuery.refetch();

            if (result.data) break;
            const err = result.error;
            const errorTypeGuard =
              err && typeof err === "object" && "status" in err;
            if (errorTypeGuard && err.status === 401) {
              let retry = 1;
              let refresh: any = null;
              while (retry) {
                try {
                  refresh = await useRefresh.mutateAsync();
                } catch {}

                if (refresh) break;

                retry--;
              }
              if (!refresh) {
                user.set({
                  userName: "",
                  name: "",
                  accessToken: "",
                });
                return;
              }
              user.set({
                ...user.value,
                accessToken: refresh.accessToken as any,
              });
            }
            retry--;
          }
          if (!result) return;

          if (!result.data) return;

          match.dispatch({
            type: "RESYNC",
            params: {
              board: result.data.board,
              guestTime: result.data.guestTime,
              hostTime: result.data.hostTime,
              teamInTurn: result.data.playerInTurn,
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
        }
      };

      socket.onerror = () => {
        socket.close();
      };

      return socket;
    };

    const socket = connectSocket(RECONNECT_RETRY_COUNT);

    if (!socket) return;

    match.dispatch({
      type: "CONFIGURE",
      params: {
        code: useReconnectQuery.data.code,
        color: useReconnectQuery.data.color,
        domain: useReconnectQuery.data.domain,
        increment: useReconnectQuery.data.increment,
        turnTime: useReconnectQuery.data.turnTime,
        guestName: useReconnectQuery.data.guest,
        hostName: useReconnectQuery.data.host,
      },
    });

    match.dispatch({
      type: "START_GAME",
      params: {
        socket,
        teamInTurn: useReconnectQuery.data.playerInTurn,
        guestName: useReconnectQuery.data.guest,
        hostName: useReconnectQuery.data.host,
      },
    });

    match.dispatch({
      type: "RESYNC",
      params: {
        board: useReconnectQuery.data.board,
        guestTime: useReconnectQuery.data.guestTime,
        hostTime: useReconnectQuery.data.hostTime,
        teamInTurn: useReconnectQuery.data.playerInTurn,
      },
    });
  }, [useReconnectQuery.isSuccess]);

  useEffect(() => {
    if (!useReconnectQuery.isError) return;

    const error = useReconnectQuery.error;

    if (error && typeof error === "object" && "status" in error) {
      const status = error.status;

      if (status === 401) {
        useRefresh.mutate();
        return;
      }
    }
  }, [useReconnectQuery.isError]);

  useEffect(() => {
    useReconnectQuery.refetch();
  }, []);

  return (
    <>
      <div className="z-1 relative">
        <Modal
          zIndex={50}
          opened={
            !(
              isGameStart ||
              useReconnectQuery.isSuccess ||
              spectateQuery.isSuccess
            )
          }
          onClose={() => {}}
          title="Lobby"
          centered
          withCloseButton={false}
          closeOnClickOutside={false}
          styles={{
            title: {
              fontSize: "var(--header-3)",
              fontWeight: "var(--bold)",
            },
            content: {
              marginLeft: 40,
              width: "calc(100% - 40px)",
            },
            overlay: {
              left: 40,
            },
            inner: {
              padding: 40,
            },
          }}
          style={{ backgroundColor: "transparent" }}
        >
          <Box>
            {showBackButton && (
              <ActionIcon
                mb="md"
                size="lg"
                variant="subtle"
                onClick={() => setView("home")}
              >
                <ArrowLeftIcon size={30} />
              </ActionIcon>
            )}

            {view === "home" && <LobbyHome onNavigate={setView} />}

            {view === "create-room" && <Room setIsGameStart={setIsGameStart} />}

            {view === "join-room" && (
              <JoinRoom setIsGameStart={setIsGameStart} />
            )}

            {view === "matchmaking" && (
              <Matchmaking setIsGameStart={setIsGameStart} />
            )}

            {view === "spectate" && (
              <Spectate setIsGameStart={setIsGameStart} />
            )}
          </Box>
        </Modal>
      </div>
      <Grid>
        <Grid.Col span={{ base: 12, xxl: 3 }}></Grid.Col>
        <Grid.Col span={{ base: 12, xxl: 6 }}>
          <Center>
            <Stack align="center">
              {match.value.teamInTurn && (
                <Paper py={"xs"} px={"xs"} bg={"var(--primary)"} w={"100%"}>
                  <Flex justify={"space-between"}>
                    <Stack w={"100%"} gap={"0px"} align="center">
                      <Flex gap={"xs"} justify={"center"}>
                        <Title order={4} c={"var(--text)"}>
                          Code :{" "}
                        </Title>
                        <Text size="lg" c={"var(--text)"}>
                          {match.value.code}
                        </Text>
                      </Flex>
                      {match.value.winner ? (
                        <Text size="lg" c={"var(--text)"}>
                          {`${match.value.winner === "DRAW" ? "DRAW" : match.value.winner === "HOST" ? `${match.value.hostName} has won the game` : `${match.value.guestName} has won the game`}`}{" "}
                        </Text>
                      ) : (
                        <Flex
                          justify={"space-between"}
                          w={"100%"}
                          direction={{ base: "column", md: "row" }}
                          c={"var(--text)"}
                        >
                          <Stack>
                            <Text size="lg" c={"var(--text)"}>
                              {user.value.userName === match.value.hostName &&
                              match.value.role === "PLAYER"
                                ? "YOU: "
                                : "OPPONENT: "}
                            </Text>
                            <Text
                              size="lg"
                              c={
                                match.value.teamInTurn === "HOST"
                                  ? "green.9"
                                  : "var(--text)"
                              }
                            >
                              {match.value.hostName}
                            </Text>
                            {match.value.time.host ? (
                              <Timer
                                time={match.value.time.host}
                                updaterFn={(time: number) => {
                                  if (match.value.teamInTurn === "GUEST")
                                    return;
                                  match.dispatch({
                                    type: "UPDATE_TIME",
                                    params: {
                                      host: (match.value.time.host ?? 0) - time,
                                      guest: match.value.time.guest ?? 0,
                                    },
                                  });
                                }}
                              ></Timer>
                            ) : (
                              ""
                            )}
                          </Stack>
                          <Stack>
                            <Text size="lg" c={"var(--text)"}>
                              {user.value.userName === match.value.guestName &&
                              match.value.role === "PLAYER"
                                ? "YOU: "
                                : "OPPONENT: "}
                            </Text>
                            <Text
                              size="lg"
                              c={
                                match.value.teamInTurn === "GUEST"
                                  ? "green.9"
                                  : "var(--text)"
                              }
                            >
                              {match.value.guestName}
                            </Text>
                            {match.value.time.guest ? (
                              <Timer
                                time={match.value.time.guest}
                                updaterFn={(time: number) => {
                                  if (match.value.teamInTurn === "HOST") return;
                                  match.dispatch({
                                    type: "UPDATE_TIME",
                                    params: {
                                      host: match.value.time.host ?? 0,
                                      guest:
                                        (match.value.time.guest ?? 0) - time,
                                    },
                                  });
                                }}
                              ></Timer>
                            ) : (
                              ""
                            )}
                          </Stack>
                        </Flex>
                      )}
                    </Stack>
                  </Flex>
                </Paper>
              )}

              <Stack pos={"relative"}>
                <Board
                  chessBoard={match.value.board}
                  team={
                    match.value.hostName === user.value.userName
                      ? match.value.color
                      : match.value.color === "BLACK"
                        ? "WHITE"
                        : "BLACK"
                  }
                  update={(fromX, fromY, toX, toY) => {
                    if (
                      match.value.socket &&
                      match.value.socket.readyState === WebSocket.OPEN
                    ) {
                      match.value.socket.send(
                        JSON.stringify({
                          type: "PLAY",
                          userName: user.value.userName,
                          fromX: fromX,
                          fromY: fromY,
                          toX: toX,
                          toY: toY,
                        }),
                      );
                    }
                  }}
                ></Board>
                {match.value.winner ? (
                  <Overlay styles={{ root: { zIndex: 10 } }}></Overlay>
                ) : (
                  ""
                )}
              </Stack>
            </Stack>
          </Center>
        </Grid.Col>
        <Grid.Col span={{ base: 12, xxl: 3 }}>
          <Center>
            <Stack maw={"400px"}>
              {match.value.role === "PLAYER" ? (
                <Button
                  size="lg"
                  bg="red"
                  onClick={() => {
                    if (match.value.winner) {
                      match.dispatch({ type: "RESET", params: {} });
                      queryClient.resetQueries();
                      queryClient.invalidateQueries();
                      setIsGameStart(false);
                      setView("home");
                      return;
                    }

                    if (
                      match.value.socket &&
                      match.value.socket.readyState === WebSocket.OPEN
                    ) {
                      match.value.socket.send(
                        JSON.stringify({
                          type: "SURRENDER",
                          userName: user.value.userName,
                          userType: "PLAYER",
                        }),
                      );
                    }
                  }}
                >
                  {match.value.winner ? "Exit" : "Resign"}
                </Button>
              ) : (
                ""
              )}
              {match.value.role === "SPECTATOR" ? (
                <Button
                  size="lg"
                  bg="red"
                  onClick={() => {
                    match.dispatch({ type: "RESET", params: {} });
                    queryClient.resetQueries();
                    queryClient.invalidateQueries();
                    setIsGameStart(false);
                    setView("home");
                    return;
                  }}
                >
                  {"Exit"}
                </Button>
              ) : (
                ""
              )}
              <Chat messages={match.value.messages}></Chat>
              <Logger data={match.value.log}></Logger>
            </Stack>
          </Center>
        </Grid.Col>
      </Grid>
    </>
  );
}
