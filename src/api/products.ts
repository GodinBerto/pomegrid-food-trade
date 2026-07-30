import { apiRequest } from "@/lib/apiClient";

export interface ApiResponse<T = any> {
  ok: boolean;
  message: string;
  data: T;
  status_code: number;
}

export const productsApi = {
  listProducts: (params?: { category?: string; q?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return apiRequest<ApiResponse>(`food_trade/products${query ? `?${query}` : ""}`, "GET");
  },
  listWeeklyProducts: () => 
    apiRequest<ApiResponse>("food_trade/weekly_products", "GET"),
  getProductBySlug: (slug: string) =>
    apiRequest<ApiResponse>(`food_trade/products/${slug}`, "GET"),

  // Admin Endpoints
  adminListProducts: () =>
    apiRequest<ApiResponse>("food_trade/admin/products", "GET"),
  adminUpsertProduct: (data: any) =>
    apiRequest<ApiResponse>("food_trade/admin/products", "POST", data),
  adminDeleteProduct: (pid: number) =>
    apiRequest<ApiResponse>(`food_trade/admin/products/${pid}`, "DELETE"),
};
