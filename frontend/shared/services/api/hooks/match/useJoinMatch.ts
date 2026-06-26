import { UserProps } from "@/shared/types/types";
import { useMutation } from "@tanstack/react-query";
import { useUserDataContext } from "@/shared/contexts/UserData";
import { MatchApi } from "../../api";
import { useMatchContext } from "@/shared/contexts/Match";
import { Domain, PieceColor } from "@/shared/constants/types";

const matchApi = new MatchApi();

export function useJoinMatch() {
  const match = useMatchContext();
  return useMutation({
    mutationFn: async (payload: { code: string; guestName: string }) =>
      await matchApi.joinMatch(payload),
    onSuccess: (data, variables) => {
      match.dispatch({
        type: "CONFIGURE",
        params: {
          code: data.code,
          color: data.color,
          domain: data.domain,
          increment: data.increment,
          turnTime: data.turnTime,
          guestName: data.guestName,
          hostName: data.hostName,
        },
      });
    },
  });
}
