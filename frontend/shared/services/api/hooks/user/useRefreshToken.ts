import { UserProps } from "@/shared/types/types";
import { useMutation } from "@tanstack/react-query";
import { UserApi } from "../../api";
import { useUserDataContext } from "@/shared/contexts/UserData";
import { useAppContext } from "@/shared/contexts/App";

const userApi = new UserApi();

export function useRefreshUser() {
  const userData = useUserDataContext();
  const app = useAppContext();
  return useMutation({
    mutationFn: async () => await userApi.refreshToken(),
    onSuccess: (data, variables) => {
      console.log("success");
      userData.set({
        ...userData.value,
        accessToken: data.accessToken,
      });
    },
    onError: () => {
      console.log("fail");

      userData.set({
        userName: "",
        name: "",
        accessToken: "",
      });
    },
  });
}
