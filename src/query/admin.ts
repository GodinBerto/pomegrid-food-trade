import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/api/admin";

export const useIsAdminCheck = () => {
  return useQuery({
    queryKey: ["admin", "is-admin"],
    queryFn: async () => (await adminApi.isAdminCheck()).data,
  });
};
