"use client";

import { useQuery } from "@tanstack/react-query";
import { MatchApi } from "../../api";

const matchApi = new MatchApi();

const useGetRoom = (payload: { code: string }) => {
  const query = useQuery({
    queryKey: ["players"],
    queryFn: async () => await matchApi.getMatch(payload),
    refetchInterval: 5_000, // every 5 seconds
    enabled: !!payload.code,
  });

  return query;
};

export default useGetRoom;
