import { useMutation } from "@tanstack/react-query";
import { UserApi } from "../../api";
import { useUserDataContext } from "@/shared/contexts/UserData";
import { useRefreshUser } from "./useRefreshToken";

const userApi = new UserApi();

export function useSignOutUser() {
  const userData = useUserDataContext();
  const useRefresh = useRefreshUser();
  const query = useMutation({
    mutationFn: async () =>
      await userApi.signout({ accessToken: userData.value.accessToken }),
    onSuccess: () => {
      userData.set({
        userName: "",
        accessToken: "",
        name: "",
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

  return query;
}
