import { apiRequest } from "@/lib/apiClient";
import { ApiResponse } from "./products";

export const ordersApi = {
  placeOrder: (data: any) =>
    apiRequest<ApiResponse>("food_trade/orders", "POST", data),
  getMyOrders: () =>
    apiRequest<ApiResponse>("food_trade/orders/me", "GET"),

  // Admin Endpoints
  adminListOrders: () =>
    apiRequest<ApiResponse>("food_trade/admin/orders", "GET"),
  adminUpdateOrderStatus: (data: { id: number; status: string }) =>
    apiRequest<ApiResponse>("food_trade/admin/orders/status", "POST", data),
};
