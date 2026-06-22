import { Flex, Paper, ScrollArea, Stack, Table, Title } from "@mantine/core";
import React from "react";
import { chessXAxis, chessYAxis } from "../constants/constants";
import { MoveCoordination } from "../constants/types";

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
  return (
    <Paper bg={"var(--secondary)"} p={10}>
      <Flex gap={"xs"}>
        <ScrollArea h={200}>
          <Stack align="center">
            <Title order={3}>Host</Title>
            <Table
              stickyHeader
              data={{
                head: ["from", "to"],
                body: data.host.map((move: MoveCoordination) => [
                  mapper(move.fromX, move.fromY),
                  mapper(move.toX, move.toY),
                ]),
              }}
              styles={{
                th: {
                  background: "var(--secondary)",
                  fontSize: "var(--header-4)",
                  fontWeight: "var(--bold)",
                },
                tr: {
                  fontSize: "var(--text-lg)",
                },
              }}
            ></Table>
          </Stack>
        </ScrollArea>
        <ScrollArea h={200}>
          <Stack align="center">
            <Title order={3}>Guest</Title>
            <Table
              stickyHeader
              styles={{
                th: {
                  background: "var(--secondary)",
                  fontSize: "var(--header-4)",
                  fontWeight: "var(--bold)",
                },
                tr: {
                  fontSize: "var(--text-lg)",
                },
              }}
              data={{
                head: ["from", "to"],
                body: data.guest.map((move: MoveCoordination) => [
                  mapper(move.fromX, move.fromY),
                  mapper(move.toX, move.toY),
                ]),
              }}
            ></Table>
          </Stack>
        </ScrollArea>
      </Flex>
    </Paper>
  );
};

export default Logger;
