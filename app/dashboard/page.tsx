"use client";

import { useUserDataContext } from "@/shared/contexts/UserData";
import useGetActiveMatches from "@/shared/services/api/hooks/match/useGetActiveMatches";
import { useGetDailyStats } from "@/shared/services/api/hooks/score/useGetDailyStats";
import { useGetLeaderboard } from "@/shared/services/api/hooks/score/useGetLeaderBoard";
import { useGetScore } from "@/shared/services/api/hooks/score/useGetScore";
import { AreaChart } from "@mantine/charts";
import {
  Container,
  Title,
  Grid,
  Paper,
  Text,
  Table,
  Badge,
  Group,
  Stack,
  Flex,
  Box,
} from "@mantine/core";
import { TrophyIcon } from "@phosphor-icons/react";

export default function DashboardPage() {
  const userData = useUserDataContext();
  const scoreQuery = useGetScore(userData.value.userName);
  const leaderBoardQuery = useGetLeaderboard();
  const userStats = useGetDailyStats(userData.value.userName);
  const activeMatchesPoll = useGetActiveMatches({});

  return (
    <Container size="xl" py="lg" c={"var(--text)"}>
      <Stack gap="lg">
        <Title order={1}>Dashboard</Title>
        {scoreQuery.isSuccess && (
          <Flex
            bg="primary"
            style={{ border: "1px solid var(--primary) ", borderRadius: 15 }}
            p={25}
            px={10}
            justify={"space-between"}
          >
            <Flex gap={"xs"}>
              <Title order={3}>Wins: </Title>
              <Title order={3}>{scoreQuery.data.score.wins}</Title>
            </Flex>
            <Flex gap={"xs"}>
              <Title order={3}>Losses: </Title>
              <Title order={3}>{scoreQuery.data.score.losses}</Title>
            </Flex>
            <Flex gap={"xs"}>
              <Title order={3}>Draws: </Title>
              <Title order={3}>{scoreQuery.data.score.draws}</Title>
            </Flex>
            <Flex gap={"xs"}>
              <Title order={3}>Total: </Title>
              <Title order={3}>{scoreQuery.data.score.total}</Title>
            </Flex>
          </Flex>
        )}
        {userData.value.userName && (
          <Grid>
            {/* Performance Graph */}
            <Grid.Col span={{ base: 12, md: 12 }}>
              <Paper withBorder p="md" bg={"var(--secondary)"}>
                <Title order={2} mb="md">
                  Recent Performance
                </Title>

                {userStats.isSuccess && (
                  <AreaChart
                    h={300}
                    data={userStats.data.stats}
                    dataKey="date"
                    series={[
                      { name: "wins", color: "green" },
                      { name: "losses", color: "red" },
                      { name: "draws", color: "gray" },
                    ]}
                    curveType="linear"
                  />
                )}
              </Paper>
            </Grid.Col>
          </Grid>
        )}

        {/* Leaderboard */}
        <Paper withBorder p="md" bg={"var(--secondary)"}>
          <Title order={2} mb="md">
            Leaderboard
          </Title>

          <Table
            highlightOnHover
            styles={{
              td: {
                fontSize: "var(--text-lg)",
              },
            }}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th
                  styles={{
                    th: {
                      fontWeight: "var(--bold)",
                      fontSize: "var(--header-3)",
                    },
                  }}
                >
                  Username
                </Table.Th>
                <Table.Th
                  styles={{
                    th: {
                      fontWeight: "var(--bold)",
                      fontSize: "var(--header-3)",
                    },
                  }}
                >
                  Wins
                </Table.Th>
                <Table.Th
                  styles={{
                    th: {
                      fontWeight: "var(--bold)",
                      fontSize: "var(--header-3)",
                    },
                  }}
                >
                  Total
                </Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {leaderBoardQuery.isSuccess &&
                leaderBoardQuery.data.leaderboard.map((player: any) => (
                  <Table.Tr key={player.userName}>
                    <Table.Td>{player.userName}</Table.Td>
                    <Table.Td>{player.wins}</Table.Td>
                    <Table.Td>{player.total}</Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </Paper>
        {activeMatchesPoll.isSuccess &&
          activeMatchesPoll.data.activeRooms.length > 0 && (
            <Paper bg={"var(--secondary)"}>
              <Table
                data={{
                  head: ["Code", "Player 1", "Player 2"],
                  body: activeMatchesPoll.data.activeRooms.map((room) => [
                    room.code,
                    room.host,
                    room.guest,
                  ]),
                }}
                styles={{
                  th: {
                    fontWeight: "var(--bold)",
                    fontSize: "var(--header-3)",
                  },
                  td: {
                    fontSize: "var(--text-lg)",
                  },
                }}
              ></Table>
            </Paper>
          )}
      </Stack>
    </Container>
  );
}
