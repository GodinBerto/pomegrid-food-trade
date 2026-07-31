import { apiRequest } from "@/lib/apiClient";

export interface ApiResponse<T = any> {
  ok: boolean;
  message: string;
  data: T;
  status_code: number;
}

export type ProductImage = {
  id: number;
  product_id: number;
  image_url: string;
  sort_order: number;
  created_at?: string;
};

export type AdminProductPayload = {
  id?: string | number;
  name: string;
  slug: string;
  description?: string;
  price_ghs: number;
  unit: string;
  min_order_qty: number;
  stock_qty: number;
  is_active: boolean | number;
  category_id?: string | number | null;
  image_url?: string | null;
  images?: string[];
};

export const productsApi = {
  listProducts: (params?: { category?: string; q?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return apiRequest<ApiResponse>(`food_trade/products${query ? `?${query}` : ""}`, "GET");
  },
  listWeeklyProducts: () =>
    apiRequest<ApiResponse>("food_trade/weekly_products", "GET"),
  getProductBySlug: (slug: string) =>
    apiRequest<ApiResponse>(`food_trade/products/${slug}`, "GET"),
  getProductImages: (productId: number | string) =>
    apiRequest<ApiResponse<ProductImage[]>>(`food_trade/product/images/${productId}`, "GET"),

  adminListProducts: () =>
    apiRequest<ApiResponse>("food_trade/admin/products", "GET"),
  adminUpsertProduct: (payload: AdminProductPayload) =>
    apiRequest<ApiResponse<{ id: number }>>("food_trade/admin/products", "POST", payload),
  adminDeleteProduct: (pid: number) =>
    apiRequest<ApiResponse>(`food_trade/admin/products/${pid}`, "DELETE"),
};

export function resolveImageUrl(imageUrl?: string | null) {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://") || imageUrl.startsWith("data:")) {
    return imageUrl;
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
  }

  return imageUrl;
}
