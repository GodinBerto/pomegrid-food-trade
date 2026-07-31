import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/api/admin";
import { hasSession } from "@/lib/apiClient";
import { useUserStore } from "@/store/store";

export const useIsAdminCheck = () => {
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);

  return useQuery({
    queryKey: ["admin", "is-admin"],
    queryFn: async () => (await adminApi.isAdminCheck()).data,
    enabled: isLoggedIn || hasSession(),
    retry: 1,
  });
};
