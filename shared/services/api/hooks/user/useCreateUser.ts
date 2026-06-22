import { UserProps } from "@/shared/types/types";
import { useMutation } from "@tanstack/react-query";
import { UserApi } from "../../api";
import { useUserDataContext } from "@/shared/contexts/UserData";

const userApi = new UserApi();

export function useCreateUser() {
  const userData = useUserDataContext();
  return useMutation({
    mutationFn: async (payload: UserProps) => await userApi.post(payload),
    onSuccess: (data, variables) => {
      userData.set({
        userName: variables.userName,
        name: variables.name,
      });
    },
  });
}
