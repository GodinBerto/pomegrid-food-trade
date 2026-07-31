import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriesApi, type CategoryInput, type CategoryUpdateInput } from "@/api/categories";

export const CATEGORIES_QUERY_KEY = ["categories"];
export const ADMIN_CATEGORIES_QUERY_KEY = ["admin-categories"];

export const useListCategories = () => {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: async () => (await categoriesApi.listCategories()).data ?? [],
  });
};

export const useAdminListCategories = () => {
  return useQuery({
    queryKey: ADMIN_CATEGORIES_QUERY_KEY,
    queryFn: async () => (await categoriesApi.adminListCategories()).data ?? [],
  });
};

export const useAdminGetCategory = (categoryId: number | null) => {
  return useQuery({
    queryKey: [...ADMIN_CATEGORIES_QUERY_KEY, categoryId],
    queryFn: async () => (await categoriesApi.adminGetCategory(categoryId!)).data,
    enabled: categoryId !== null,
  });
};

export const useAdminCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CategoryInput) => categoriesApi.adminCreateCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
};

export const useAdminUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryUpdateInput }) =>
      categoriesApi.adminUpdateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
};

export const useAdminDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: number) => categoriesApi.adminDeleteCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
};
