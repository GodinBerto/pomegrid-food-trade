import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  productsApi,
  type AdminProductPayload,
  type WeeklyProductPayload,
  type WeeklyProduct,
} from "@/api/products";

export const useListProducts = (params?: { category?: string; q?: string }) => {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => (await productsApi.listProducts(params)).data,
  });
};

export const useListWeeklyProducts = () => {
  return useQuery<WeeklyProduct[]>({
    queryKey: ["weekly_products"],
    queryFn: async () => (await productsApi.listWeeklyProducts()).data,
  });
};

export const useCreateWeeklyProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: WeeklyProductPayload) =>
      productsApi.createWeeklyProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekly_products"] });
    },
  });
};

export const useGetProductBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => (await productsApi.getProductBySlug(slug)).data,
    enabled: !!slug,
  });
};

export const useGetProductImages = (productId?: number | string | null) => {
  return useQuery({
    queryKey: ["product-images", productId],
    queryFn: async () =>
      (await productsApi.getProductImages(productId!)).data ?? [],
    enabled: productId !== undefined && productId !== null && productId !== "",
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
    mutationFn: (payload: AdminProductPayload) =>
      productsApi.adminUpsertProduct(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      const productId = data?.data?.id ?? variables.id;
      if (productId) {
        queryClient.invalidateQueries({
          queryKey: ["product-images", productId],
        });
      }
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
