import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  productsApi,
  type AdminProduct,
  type AdminProductPayload,
  type ProductDetail,
  type ProductListItem,
  type WeeklyProductPayload,
  type WeeklyProduct,
} from "@/api/products";

export const useListProducts = (params?: { category?: string; q?: string }) => {
  return useQuery<ProductListItem[]>({
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

export const useDeleteWeeklyProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: number) =>
      productsApi.deleteWeeklyProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekly_products"] });
    },
  });
};

export const useGetProductBySlug = (slug: string) => {
  return useQuery<ProductDetail | undefined>({
    queryKey: ["product", slug],
    queryFn: async () => (await productsApi.getProductBySlug(slug)).data,
    enabled: !!slug,
  });
};

export const useAdminListProducts = () => {
  return useQuery<AdminProduct[]>({
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
