import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "@/api/categories";

export const useListCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await categoriesApi.listCategories()).data,
  });
};

export const useAdminListCategories = () => {
  return useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => (await categoriesApi.adminListCategories()).data,
  });
};
