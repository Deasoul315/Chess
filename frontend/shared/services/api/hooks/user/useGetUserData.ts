import { useUserDataContext } from "@/shared/contexts/UserData";
import { useMutation, useQuery } from "@tanstack/react-query";
import { UserApi } from "../../api";
import { useEffect } from "react";

const userApi = new UserApi();

export function useGetUserData(payload: { accessToken: string }) {
  const query = useQuery({
    queryKey: ["user"],
    queryFn: async () => await userApi.getData(payload),
    enabled: !!payload.accessToken,
    retry: 3,
    retryDelay: 1000,
  });

  return query;
}
