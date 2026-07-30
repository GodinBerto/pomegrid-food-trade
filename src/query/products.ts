import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/api/products";

export const useListProducts = (params?: { category?: string; q?: string }) => {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => (await productsApi.listProducts(params)).data,
  });
};

export const useGetProductBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => (await productsApi.getProductBySlug(slug)).data,
    enabled: !!slug,
  });
};

export const useAdminListProducts = () => {
  return useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => (await productsApi.adminListProducts()).data,
  });
};

export const useAdminUpsertProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productsApi.adminUpsertProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useAdminDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productsApi.adminDeleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
