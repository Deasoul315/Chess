"use client";

import { useQuery } from "@tanstack/react-query";
import { MatchApi } from "../../api";

const matchApi = new MatchApi();

const useGetRandomRoom = (payload: { userName: string }) => {
  const query = useQuery({
    queryKey: ["random-players"],
    queryFn: async () => await matchApi.getRandomMatch(payload),
    refetchInterval: 5_000, // every 5 seconds
    enabled: !!payload.userName,
  });

  return query;
};

export default useGetRandomRoom;
