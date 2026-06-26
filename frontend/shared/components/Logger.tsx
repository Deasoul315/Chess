import { Flex, Paper, ScrollArea, Stack, Table, Title } from "@mantine/core";
import React, { useEffect, useRef } from "react";
import { chessXAxis, chessYAxis } from "../constants/constants";
import { MoveCoordination } from "../constants/types";
import { useMediaQuery } from "@mantine/hooks";

function mapper(x: number, y: number) {
  const result = `${chessXAxis[y]}${chessYAxis[7 - x]}`;

  return result;
}

const Logger = ({
  data,
}: {
  data: {
    host: MoveCoordination[];
    guest: MoveCoordination[];
  };
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const hostViewport = useRef<HTMLDivElement>(null);
  const guestViewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hostViewport || !guestViewport) return;

    hostViewport.current!.scrollTo({
      top: hostViewport.current!.scrollHeight,
      behavior: "smooth",
    });
    guestViewport.current!.scrollTo({
      top: guestViewport.current!.scrollHeight,
      behavior: "smooth",
    });
  }, [data]);

  return (
    <Paper bg="var(--secondary)" p={10}>
      <Flex gap="xs" direction={isMobile ? "column" : "row"}>
        <Stack align="center">
          <Title order={isMobile ? 4 : 3}>Host</Title>

          <ScrollArea h={200} w={"100%"} viewportRef={hostViewport}>
            <Table
              stickyHeader
              style={{
                tableLayout: "fixed",
              }}
              styles={{
                th: {
                  background: "var(--secondary)",
                  fontSize: isMobile ? "var(--header-5)" : "var(--header-4)",
                  fontWeight: "var(--bold)",
                },

                td: {
                  fontSize: isMobile ? "var(--text-md)" : "var(--text-lg)",
                },
              }}
              data={{
                head: ["from", "to"],
                body: data.host.map((move: MoveCoordination) => [
                  mapper(move.fromX, move.fromY),
                  mapper(move.toX, move.toY),
                ]),
              }}
            />
          </ScrollArea>
        </Stack>

        <Stack align="center">
          <Title order={isMobile ? 4 : 3}>Guest</Title>

          <ScrollArea h={200} w={"100%"} viewportRef={guestViewport}>
            <Table
              style={{
                tableLayout: "fixed",
              }}
              stickyHeader
              styles={{
                th: {
                  background: "var(--secondary)",
                  fontSize: isMobile ? "var(--header-5)" : "var(--header-4)",
                  fontWeight: "var(--bold)",
                },

                td: {
                  fontSize: isMobile ? "var(--text-md)" : "var(--text-lg)",
                },
              }}
              data={{
                head: ["from", "to"],
                body: data.guest.map((move: MoveCoordination) => [
                  mapper(move.fromX, move.fromY),
                  mapper(move.toX, move.toY),
                ]),
              }}
            />
          </ScrollArea>
        </Stack>
      </Flex>
    </Paper>
  );
};

export default Logger;
