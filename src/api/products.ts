import { apiRequest } from "@/lib/apiClient";

export interface ApiResponse<T = unknown> {
  ok?: boolean;
  success?: boolean;
  message: string;
  data: T;
  status_code?: number;
  status?: number;
}

export type ProductImagePayload = {
  id?: number;
  image_url: string;
  sort_order?: number;
  is_primary?: boolean;
};

export type ProductImage = ProductImagePayload & {
  id: number;
  product_id?: number;
  sort_order: number;
  created_at?: string;
};

export type ProductListItem = {
  id: number | string;
  name: string;
  slug: string;
  description?: string;
  price_ghs?: number | string;
  price?: number | string;
  unit: string;
  min_order_qty?: number | string;
  stock_qty?: number | string;
  is_active?: boolean | number;
  category_id?: string | number | null;
  image_url?: string | null;
  images?: ProductImagePayload[];
  categories?: {
    slug?: string;
    name?: string;
  };
  category?: {
    slug?: string;
    name?: string;
  };
};

export type ProductDetail = ProductListItem & {
  id: number | string;
  name: string;
  slug: string;
  unit: string;
  min_order_qty: number;
  stock_qty: number;
  description?: string;
  images?: ProductImage[];
};

export type AdminProduct = ProductListItem & {
  id: number | string;
};

export type WeeklyProductPayload = {
  name: string;
  description?: string;
  price: number;
  image_url?: string | null;
  status?: "active" | "inactive";
  category_id?: string | number | null;
};

export type WeeklyProduct = {
  id?: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string | null;
  status?: "active" | "inactive" | string;
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
  images?: ProductImagePayload[];
};

export const productsApi = {
  listProducts: (params?: { category?: string; q?: string }) => {
    const query = new URLSearchParams(
      Object.entries(params ?? {}).reduce<Record<string, string>>(
        (acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            acc[key] = String(value);
          }
          return acc;
        },
        {},
      ),
    ).toString();

    return apiRequest<ApiResponse<ProductListItem[]>>(
      `food_trade/products${query ? `?${query}` : ""}`,
      "GET",
    );
  },
  listWeeklyProducts: () =>
    apiRequest<ApiResponse<WeeklyProduct[]>>(
      "food_trade/weekly_products",
      "GET",
    ),
  createWeeklyProduct: (payload: WeeklyProductPayload) =>
    apiRequest<ApiResponse<{ id: number }>>(
      "food_trade/weekly_products",
      "POST",
      payload,
    ),
  deleteWeeklyProduct: (productId: number) =>
    apiRequest<ApiResponse>(
      `food_trade/weekly_products/${productId}`,
      "DELETE",
    ),
  getProductBySlug: (slug: string) =>
    apiRequest<ApiResponse<ProductDetail>>(
      `food_trade/products/${slug}`,
      "GET",
    ),
  getProductImages: (productId: number | string) =>
    apiRequest<ApiResponse<ProductImage[]>>(
      `food_trade/product/images/${productId}`,
      "GET",
    ),

  adminListProducts: () =>
    apiRequest<ApiResponse<AdminProduct[]>>("food_trade/admin/products", "GET"),
  adminUpsertProduct: (payload: AdminProductPayload) =>
    apiRequest<ApiResponse<{ id: number }>>(
      "food_trade/admin/products",
      "POST",
      payload,
    ),
  adminAddProductImages: (
    productId: number | string,
    payload: {
      image_url?: string | null;
      images?: Array<{
        image_url: string;
        sort_order?: number;
        is_primary?: boolean;
      }>;
    },
  ) =>
    apiRequest<ApiResponse<{ images: ProductImage[] }>>(
      `food_trade/admin/products/${productId}/images`,
      "POST",
      payload,
    ),
  adminDeleteProduct: (pid: number) =>
    apiRequest<ApiResponse>(`food_trade/admin/products/${pid}`, "DELETE"),
};

export function resolveImageUrl(imageUrl?: string | null) {
  if (!imageUrl) return "";
  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("data:")
  ) {
    return imageUrl;
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
  }

  return imageUrl;
}
