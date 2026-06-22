import { UserProps } from "@/shared/types/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useUserDataContext } from "@/shared/contexts/UserData";
import { MatchApi } from "../../api";
import { useMatchContext } from "@/shared/contexts/Match";
import { Domain, PieceColor } from "@/shared/constants/types";

const matchApi = new MatchApi();

export function useSpecateMatch(payload: { code: string; userName: string }) {
  const match = useMatchContext();
  return useQuery({
    queryKey: ["spectate", payload.code],
    queryFn: async () => await matchApi.spectateMatch(payload),
    enabled: !!payload.code,
  });
}
