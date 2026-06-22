import { useUserDataContext } from "@/shared/contexts/UserData";
import { useMutation, useQuery } from "@tanstack/react-query";
import { UserApi } from "../../api";
import { useEffect } from "react";

const userApi = new UserApi();

export function useGetUser(payload: { userName: string; password: string }) {
  const query = useQuery({
    queryKey: ["user", payload.userName],
    queryFn: async () => await userApi.get(payload),
    enabled: !!payload.userName && !!payload.password,
    retry: 3,
    retryDelay: 1000,
  });

  return query;
}
