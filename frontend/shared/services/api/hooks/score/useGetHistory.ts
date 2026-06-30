import { useQuery } from "@tanstack/react-query";
import { ScoreApi } from "../../api";

const scoreApi: ScoreApi = new ScoreApi();

export const useHistory = (
  username: string,
  payload: { accessToken: string },
) => {
  return useQuery({
    queryKey: ["history", username],
    queryFn: () => scoreApi.getHistory(payload),
    enabled: !!username,
  });
};
