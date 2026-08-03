import { apiRequest } from "@/lib/apiClient";
import { ApiResponse } from "./products";

export type OrderItem = {
  id: number;
  product_name: string;
  qty: number;
  unit_price: number;
  unit_price_ghs?: number;
};

export type UserOrder = {
  id: number;
  status: string;
  total_price?: number;
  total_ghs?: number;
  created_at: string;
  delivery_region: string | null;
  delivery_address?: string | null;
  contact_phone?: string | null;
  notes?: string | null;
  order_items: OrderItem[];
};

export const ordersApi = {
  placeOrder: (data: any) =>
    apiRequest<ApiResponse>("food_trade/orders", "POST", data),
  getMyOrders: () =>
    apiRequest<ApiResponse<UserOrder[]>>("food_trade/orders/me", "GET"),

  adminListOrders: () =>
    apiRequest<ApiResponse>("food_trade/admin/orders", "GET"),
  adminUpdateOrderStatus: (data: { id: string | number; status: string }) =>
    apiRequest<ApiResponse>("food_trade/admin/orders/status", "POST", data),
};
