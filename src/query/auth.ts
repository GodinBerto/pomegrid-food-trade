import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/api/auth";
import { logoutUser } from "@/lib/auth";

export const useLogin = () => {
  return useMutation({
    mutationFn: authApi.login,
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: authApi.register,
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSettled: () => {
      queryClient.removeQueries({ queryKey: ["auth"] });
      queryClient.removeQueries({ queryKey: ["admin"] });
      queryClient.removeQueries({ queryKey: ["cart"] });
      queryClient.removeQueries({ queryKey: ["my-orders"] });
    },
  });
};

export const useGetMe = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.getMe,
    enabled: options?.enabled,
  });
};

export const useVerifyUser = () => {
  return useQuery({
    queryKey: ["auth", "verify-user"],
    queryFn: authApi.verifyUser,
  });
};
