import { UserProps } from "@/shared/types/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useUserDataContext } from "@/shared/contexts/UserData";
import { MatchApi } from "../../api";
import { useMatchContext } from "@/shared/contexts/Match";
import { Domain, PieceColor } from "@/shared/constants/types";

const matchApi = new MatchApi();

export function useReconnectMatch(payload: { userName: string }) {
  const match = useMatchContext();
  return useQuery({
    queryKey: ["reconnect", payload.userName],
    queryFn: async () => await matchApi.reconnectMatch(payload),
    enabled: !!payload.userName,
  });
}
