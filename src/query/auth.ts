import { useMutation, useQuery } from "@tanstack/react-query";
import { authApi } from "@/api/auth";

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
  return useMutation({
    mutationFn: authApi.logout,
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
