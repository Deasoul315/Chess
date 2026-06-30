import { useQuery } from "@tanstack/react-query";
import { ScoreApi } from "../../api";

const scoreApi: ScoreApi = new ScoreApi();

export const useGetScore = (
  userName: string,
  payload: { accessToken: string },
) => {
  return useQuery({
    queryKey: ["score", userName],
    queryFn: () => scoreApi.getScore(payload),
    enabled: !!payload,
  });
};
