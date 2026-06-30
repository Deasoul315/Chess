import { UserProps } from "@/shared/types/types";
import { useMutation } from "@tanstack/react-query";
import { useUserDataContext } from "@/shared/contexts/UserData";
import { MatchApi } from "../../api";
import { useMatchContext } from "@/shared/contexts/Match";
import { Domain, PieceColor } from "@/shared/constants/types";
import { useRefreshUser } from "../user/useRefreshToken";

const matchApi = new MatchApi();

export function useConfigMatch() {
  const match = useMatchContext();
  return useMutation({
    mutationFn: async (payload: {
      accessToken: string;
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
    onError: async (error: any) => {
      const status = error?.response?.status;

      if (status === 401) {
        const useRefresh = await useRefreshUser();
        await useRefresh.mutateAsync();

        return;
      }
    },
  });
}
