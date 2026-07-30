import { apiRequest } from "@/lib/apiClient";
import { ApiResponse } from "./products";

export const ordersApi = {
  placeOrder: (data: any) => 
    apiRequest<ApiResponse>("orders", "POST", data),
  getMyOrders: () => 
    apiRequest<ApiResponse>("orders/me", "GET"),
  
  // Admin Endpoints
  adminListOrders: () => 
    apiRequest<ApiResponse>("admin/orders", "GET"),
  adminUpdateOrderStatus: (data: { id: number; status: string }) => 
    apiRequest<ApiResponse>("admin/orders/status", "POST", data),
};
