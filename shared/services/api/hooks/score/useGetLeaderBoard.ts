import { useQuery } from "@tanstack/react-query";
import { ScoreApi } from "../../api";

const scoreApi: ScoreApi = new ScoreApi();

export const useGetLeaderboard = () => {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => scoreApi.getLeaderboard(),
  });
};
