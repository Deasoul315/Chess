"use client";

import { useQuery } from "@tanstack/react-query";
import { MatchApi } from "../../api";

const matchApi = new MatchApi();

const useGetActiveMatches = (payload: {}) => {
  const query = useQuery({
    queryKey: ["active-matches"],
    queryFn: async () => await matchApi.getActiveMatches(payload),
    refetchInterval: 5_000, // every 5 seconds
  });

  return query;
};

export default useGetActiveMatches;
