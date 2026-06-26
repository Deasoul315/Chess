"use client";

import { useMatchContext } from "@/shared/contexts/Match";
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
  Button,
  ScrollArea,
} from "@mantine/core";
import { TrophyIcon } from "@phosphor-icons/react";
import Link from "next/link";

export default function DashboardPage() {
  const userData = useUserDataContext();
  const scoreQuery = useGetScore(userData.value.userName);
  const leaderBoardQuery = useGetLeaderboard();
  const userStats = useGetDailyStats(userData.value.userName);
  const activeMatchesPoll = useGetActiveMatches({});
  const match = useMatchContext();

  return (
    <Container size="xl" py="lg" c={"var(--text)"}>
      <Stack gap="lg">
        <Title order={3} hiddenFrom="md">
          Dashboard
        </Title>

        <Title order={1} visibleFrom="md">
          Dashboard
        </Title>

        {scoreQuery.isSuccess && (
          <Flex
            bg="primary"
            style={{
              border: "1px solid var(--primary)",
              borderRadius: 15,
            }}
            p={25}
            px={10}
            justify="space-between"
            wrap="wrap"
            gap="md"
          >
            <Flex gap="xs">
              <Title order={5} hiddenFrom="md">
                Wins:
              </Title>
              <Title order={3} visibleFrom="md">
                Wins:
              </Title>
              <Title order={5} hiddenFrom="md">
                {scoreQuery.data.score.wins}
              </Title>
              <Title order={3} visibleFrom="md">
                {scoreQuery.data.score.wins}
              </Title>
            </Flex>

            <Flex gap="xs">
              <Title order={5} hiddenFrom="md">
                Losses:
              </Title>
              <Title order={3} visibleFrom="md">
                Losses:
              </Title>
              <Title order={5} hiddenFrom="md">
                {scoreQuery.data.score.losses}
              </Title>
              <Title order={3} visibleFrom="md">
                {scoreQuery.data.score.losses}
              </Title>
            </Flex>

            <Flex gap="xs">
              <Title order={5} hiddenFrom="md">
                Draws:
              </Title>
              <Title order={3} visibleFrom="md">
                Draws:
              </Title>
              <Title order={5} hiddenFrom="md">
                {scoreQuery.data.score.draws}
              </Title>
              <Title order={3} visibleFrom="md">
                {scoreQuery.data.score.draws}
              </Title>
            </Flex>

            <Flex gap="xs">
              <Title order={5} hiddenFrom="md">
                Total:
              </Title>
              <Title order={3} visibleFrom="md">
                Total:
              </Title>
              <Title order={5} hiddenFrom="md">
                {scoreQuery.data.score.total}
              </Title>
              <Title order={3} visibleFrom="md">
                {scoreQuery.data.score.total}
              </Title>
            </Flex>
          </Flex>
        )}

        {userData.value.userName && (
          <Grid>
            <Grid.Col span={12}>
              <Paper withBorder p="md" bg="var(--secondary)">
                <Title order={4} hiddenFrom="md" mb="md">
                  Recent Performance
                </Title>

                <Title order={2} visibleFrom="md" mb="md">
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

        <Paper withBorder p="md" bg="var(--secondary)">
          <Title order={4} hiddenFrom="md" mb="md">
            Leaderboard
          </Title>

          <Title order={2} visibleFrom="md" mb="md">
            Leaderboard
          </Title>

          <ScrollArea>
            <Table
              highlightOnHover
              miw={600}
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
          </ScrollArea>
        </Paper>

        {activeMatchesPoll.isSuccess &&
          activeMatchesPoll.data.activeRooms.length > 0 && (
            <Paper bg="var(--secondary)">
              <ScrollArea>
                <Table
                  miw={600}
                  data={{
                    head: ["Code", "Player 1", "Player 2", ""],
                    body: activeMatchesPoll.data.activeRooms.map((room) => [
                      room.code,
                      room.host,
                      room.guest,
                      userData.value.userName !== "" &&
                      room.host !== userData.value.userName &&
                      room.guest !== userData.value.userName ? (
                        <Link
                          href={{
                            pathname: "/play",
                            query: { code: room.code },
                          }}
                        >
                          <Button size="md" bg="var(--primary)">
                            Spectate
                          </Button>
                        </Link>
                      ) : (
                        ""
                      ),
                    ]),
                  }}
                />
              </ScrollArea>
            </Paper>
          )}
      </Stack>
    </Container>
  );
}
