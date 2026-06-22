import { UserProps } from "@/shared/types/types";
import { useMutation } from "@tanstack/react-query";
import { UserApi } from "../../api";
import { useUserDataContext } from "@/shared/contexts/UserData";

const userApi = new UserApi();

export function useEditUser() {
  const userData = useUserDataContext();
  return useMutation({
    mutationFn: async (payload: {
      userName: string;
      newPassword: string;
      oldPassword: string;
      name: string;
    }) => await userApi.patch(payload),
    onSuccess: (data, variables) => {
      userData.set({
        userName: data.userName,
        name: data.name,
      });
    },
  });
}
