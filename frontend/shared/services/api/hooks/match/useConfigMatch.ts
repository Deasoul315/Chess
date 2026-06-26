import { UserProps } from "@/shared/types/types";
import { useMutation } from "@tanstack/react-query";
import { useUserDataContext } from "@/shared/contexts/UserData";
import { MatchApi } from "../../api";
import { useMatchContext } from "@/shared/contexts/Match";
import { Domain, PieceColor } from "@/shared/constants/types";

const matchApi = new MatchApi();

export function useConfigMatch() {
  const match = useMatchContext();
  return useMutation({
    mutationFn: async (payload: {
      userName: string;
      color: PieceColor;
      domain: Domain;
      increment: number;
      turnTime: number;
    }) => await matchApi.configMatch(payload),
    onSuccess: (data, variables) => {
      match.dispatch({
        type: "CONFIGURE",
        params: {
          code: data.code,
          color: data.color,
          domain: data.domain,
          increment: data.increment,
          turnTime: data.turnTime,
          guestName: match.value.guestName,
          hostName: data.hostName,
        },
      });
    },
  });
}
