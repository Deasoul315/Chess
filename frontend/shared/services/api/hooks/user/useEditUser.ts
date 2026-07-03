import { UserProps } from "@/shared/types/types";
import { useMutation } from "@tanstack/react-query";
import { UserApi } from "../../api";
import { useUserDataContext } from "@/shared/contexts/UserData";
import { useRefreshUser } from "./useRefreshToken";

const userApi = new UserApi();

export function useEditUser() {
  const userData = useUserDataContext();
  return useMutation({
    mutationFn: async (payload: {
      accessToken: string;
      newPassword: string;
      oldPassword: string;
      name: string;
    }) => await userApi.patch(payload),
    onSuccess: (data, variables) => {
      userData.set({
        ...userData.value,
        userName: data.userName,
        name: data.name,
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
