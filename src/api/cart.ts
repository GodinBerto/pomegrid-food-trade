import { apiRequest } from "@/lib/apiClient";
import { ApiResponse } from "./products";

export type BackendCartItem = {
  id: number;
  product_id: number;
  quantity: number;
  name: string;
  price_ghs: number;
  image_url?: string | null;
  is_active: boolean;
};

export type CartItem = {
  id: number;
  productId: string;
  name: string;
  pricGhs: number;
  qty: number;
  imageUrl?: string | null;
  isActive?: boolean;
};

export function mapCartItem(item: BackendCartItem): CartItem {
  return {
    id: item.id,
    productId: String(item.product_id),
    name: item.name,
    pricGhs: Number(item.price_ghs),
    qty: item.quantity,
    imageUrl: item.image_url,
    isActive: item.is_active,
  };
}

export const cartApi = {
  getCart: () => apiRequest<ApiResponse<BackendCartItem[]>>("food_trade/cart", "GET"),
  addToCart: (data: { product_id: string | number; quantity: number }) =>
    apiRequest<ApiResponse>("food_trade/cart", "POST", data),
  updateCartItem: (itemId: number, data: { quantity: number }) =>
    apiRequest<ApiResponse>(`food_trade/cart/${itemId}`, "PUT", data),
  removeCartItem: (itemId: number) =>
    apiRequest<ApiResponse>(`food_trade/cart/${itemId}`, "DELETE"),
  clearCart: () => apiRequest<ApiResponse>("food_trade/cart", "DELETE"),
};
