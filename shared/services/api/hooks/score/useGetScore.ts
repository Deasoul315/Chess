import { useQuery } from "@tanstack/react-query";
import { ScoreApi } from "../../api";

const scoreApi: ScoreApi = new ScoreApi();

export const useGetScore = (username: string) => {
  return useQuery({
    queryKey: ["score", username],
    queryFn: () => scoreApi.getScore(username),
    enabled: !!username,
  });
};
