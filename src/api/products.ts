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
    return apiRequest<ApiResponse>(`products${query ? `?${query}` : ""}`, "GET");
  },
  getProductBySlug: (slug: string) => 
    apiRequest<ApiResponse>(`products/${slug}`, "GET"),
  
  // Admin Endpoints
  adminListProducts: () => 
    apiRequest<ApiResponse>("admin/products", "GET"),
  adminUpsertProduct: (data: any) => 
    apiRequest<ApiResponse>("admin/products", "POST", data),
  adminDeleteProduct: (pid: number) => 
    apiRequest<ApiResponse>(`admin/products/${pid}`, "DELETE"),
};
