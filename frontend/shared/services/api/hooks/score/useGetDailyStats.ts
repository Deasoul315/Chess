import { useQuery } from "@tanstack/react-query";
import { ScoreApi } from "../../api";

const scoreApi = new ScoreApi();

export const useGetDailyStats = (
  username: string,
  payload: { accessToken: string },
) => {
  return useQuery({
    queryKey: ["daily-stats", username],
    queryFn: () => scoreApi.getDailyStats(payload),
    enabled: !!username,
  });
};
